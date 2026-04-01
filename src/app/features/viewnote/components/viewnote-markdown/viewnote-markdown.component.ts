import {
  Component,
  Input,
  OnInit,
  signal,
  inject,
  afterRenderEffect,
  viewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import morphdom from 'morphdom';
import type MarkdownIt from 'markdown-it';
import { ViewNoteMarkdownProps } from 'src/app/core/model/global';
import fm from 'front-matter';
import { stringifyFrontMatter } from 'src/app/core/lib/front-matter-helper';
import { scrollToElementByHtmlId } from 'src/app/core/lib/markdownScroll';
import { getViewnoteMarkdownIt } from './viewnote-markdown-it.factory';

@Component({
  selector: 'ViewNoteMarkdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './viewnote-markdown.component.html',
  styleUrls: ['./viewnote-markdown.component.scss'],
})
export class ViewnoteMarkdownComponent
  implements ViewNoteMarkdownProps, OnInit
{
  @Input()
  set viewText(val: string) {
    this.fullNoteText = val;
    this.content = fm(val).body;
    if (this.content !== this.contextView()) {
      this.contextView.update((prev) => this.content);
      this.isLoaded.set(true);
      this.renderMarkdown();
    }
  }
  @Input() scrollView?: number | undefined;
  @Input() splitScreen?: boolean | undefined;
  @Input() updatedViewText: (updatedEdit: string) => void;
  @Input() disableLinks: boolean;

  private markdown: MarkdownIt | null = null;
  outHtml = '';
  currenturl: string;

  private router = inject(Router);
  readonly mdHost = viewChild<ElementRef<HTMLElement>>('mdHost');
  private readonly morphHtml = signal<string>('');

  constructor() {
    this.currenturl = this.router.url;
    this.renderMarkdown();

    afterRenderEffect(() => {
      const html = this.morphHtml();
      const host = this.mdHost()?.nativeElement;
      if (!host) return;

      if (!html) {
        host.replaceChildren();
        return;
      }

      const temp = document.createElement('span');
      temp.innerHTML = html;

      morphdom(host, temp, {
        childrenOnly: true,
        getNodeKey: (node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as Element;
            if (el.classList.contains('image')) {
              const img = el.querySelector('img');
              if (img) return `img-${img.getAttribute('src')}`;
            }
            if (el.tagName === 'IMG') {
              return `img-${el.getAttribute('src')}`;
            }
          }
          return undefined;
        },
        onBeforeElUpdated: (fromEl, toEl) => {
          if (
            fromEl.classList.contains('image') &&
            toEl.classList.contains('image')
          ) {
            const fromImg = fromEl.querySelector('img');
            const toImg = toEl.querySelector('img');
            if (
              fromImg &&
              toImg &&
              fromImg.getAttribute('src') === toImg.getAttribute('src')
            ) {
              for (const attr of Array.from(toImg.attributes)) {
                if (fromImg.getAttribute(attr.name) !== attr.value) {
                  fromImg.setAttribute(attr.name, attr.value);
                }
              }
              return false;
            }
          }
          if (fromEl.tagName === 'IMG' && toEl.tagName === 'IMG') {
            if (fromEl.getAttribute('src') === toEl.getAttribute('src')) {
              for (const attr of Array.from(toEl.attributes)) {
                if (fromEl.getAttribute(attr.name) !== attr.value) {
                  fromEl.setAttribute(attr.name, attr.value);
                }
              }
              return false;
            }
          }
          return true;
        },
      });
    });
  }

  content: string;
  fullNoteText: string = '';
  contextView = signal<string>('');
  isLoaded = signal<boolean>(false);

  private readonly TASK_LINE_RE = /^\s*[-*+]\s+\[[xX \u00A0]\s*\]/;

  private renderMarkdown(): void {
    const apply = () => {
      if (!this.markdown) return;
      this.outHtml = this.markdown.render(this.contextView());
      this.morphHtml.set(this.outHtml);
    };
    if (this.markdown) {
      apply();
      return;
    }
    void getViewnoteMarkdownIt().then((md) => {
      this.markdown = md;
      apply();
    });
  }

  ngOnInit(): void {}

  onMarkdownClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    const foot = target.closest<HTMLElement>('[data-md-footnote-scroll]');
    if (foot) {
      const to = foot.getAttribute('data-md-footnote-scroll');
      if (to) {
        event.preventDefault();
        scrollToElementByHtmlId(to);
      }
      return;
    }

    const anchor = target.closest<HTMLElement>(
      '.md_anchorlink[data-md-target-id]',
    );
    if (anchor) {
      const id = anchor.getAttribute('data-md-target-id');
      if (id) {
        event.preventDefault();
        scrollToElementByHtmlId(id);
      }
      return;
    }

    this.onCheckboxClick(event);
  }

  onMarkdownKeyDown(event: KeyboardEvent): void {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const target = event.target as HTMLElement;
    const anchor = target.closest<HTMLElement>(
      '.md_anchorlink[data-md-target-id]',
    );
    if (!anchor || !anchor.contains(target)) return;
    const id = anchor.getAttribute('data-md-target-id');
    if (!id) return;
    event.preventDefault();
    scrollToElementByHtmlId(id);
  }

  private onCheckboxClick(event: MouseEvent): void {
    if (!this.updatedViewText) {
      return;
    }

    const target = event.target as HTMLElement;
    let checkbox: HTMLInputElement | null = null;
    let checked: boolean | undefined;

    if (
      target.tagName === 'INPUT' &&
      (target as HTMLInputElement).type === 'checkbox'
    ) {
      checkbox = target as HTMLInputElement;
      checked = checkbox.checked;
    } else if (target.tagName === 'LABEL' && target.getAttribute('for')) {
      const input = document.getElementById(target.getAttribute('for')!);
      if (
        input?.tagName === 'INPUT' &&
        (input as HTMLInputElement).type === 'checkbox'
      ) {
        checkbox = input as HTMLInputElement;
        checked = !checkbox.checked;
      }
    }

    if (!checkbox?.id?.startsWith('cbx_') || checked === undefined) {
      return;
    }

    const taskIndex = parseInt(checkbox.id.slice(4), 10);
    if (isNaN(taskIndex) || taskIndex < 0) {
      return;
    }

    this.updateCheckboxInMarkdown(taskIndex, checked);
  }

  private updateCheckboxInMarkdown(taskIndex: number, checked: boolean): void {
    if (!this.fullNoteText || !this.updatedViewText) {
      return;
    }

    const parsed = fm(this.fullNoteText);
    const contentToUpdate = parsed.body || this.fullNoteText;

    const lines = contentToUpdate.split('\n');
    let nth = 0;

    for (let i = 0; i < lines.length; i++) {
      if (this.TASK_LINE_RE.test(lines[i])) {
        if (nth === taskIndex) {
          lines[i] = lines[i].replace(
            /\[\s*(x|\s)\s*\]/i,
            checked ? '[x]' : '[ ]',
          );

          const updatedContent = lines.join('\n');

          const attrs = parsed.attributes as Record<string, unknown>;
          const updatedFull =
            attrs && typeof attrs === 'object' && Object.keys(attrs).length > 0
              ? stringifyFrontMatter(updatedContent, attrs)
              : updatedContent;

          this.updatedViewText(updatedFull);
          return;
        }
        nth++;
      }
    }
  }
}
