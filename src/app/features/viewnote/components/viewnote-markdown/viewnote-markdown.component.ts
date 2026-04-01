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
import { ViewNoteMarkdownProps } from 'src/app/core/model/global';
import fm from 'front-matter';
import emoji_defs from 'src/app/core/lib/emoji_definitions';
import { stringifyFrontMatter } from 'src/app/core/lib/front-matter-helper';
import { scrollToElementByHtmlId } from 'src/app/core/lib/markdownScroll';
import {
  sanitizeCustomContainerStyles,
  sanitizeCustomCssClasses,
  sanitizeMarkdownTargetId,
} from 'src/app/core/lib/markdownSafeStyles';
import markdownItAnchor from 'markdown-it-anchor';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markdown';

import MarkdownIt from 'markdown-it';
import markdownItEmoji from 'markdown-it-emoji';
import markdownItFootnote from 'markdown-it-footnote';
import markdownItSub from 'markdown-it-sub';
import markdownItSup from 'markdown-it-sup';
import markdownItIns from 'markdown-it-ins';
import markdownItMark from 'markdown-it-mark';
import markdownItAbbr from 'markdown-it-abbr';
import markdownItAttrs from 'markdown-it-attrs';
import markdownItTaskCheckbox from 'markdown-it-task-checkbox';
import markdownItContainer from 'markdown-it-container';

// Map "md" to markdown language for Prism
const langAliases: Record<string, string> = { md: 'markdown' };

// MARKDOWN-IT

let md: MarkdownIt;
md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  langPrefix: 'language-',
  breaks: false,
  highlight: function (str: string, lang: string) {
    const prismLang = lang ? (langAliases[lang] ?? lang) : undefined;
    if (prismLang && prismLang in Prism.languages) {
      const gram = Prism.languages[prismLang as keyof typeof Prism.languages];
      const highlighted = Prism.highlight(str, gram, prismLang);
      return (
        `<pre class="language-${prismLang}"><code class="language-${prismLang}">${highlighted}</code></pre>` +
        '<p>' +
        md.utils.escapeHtml(lang ?? '') +
        '</p>'
      );
    }
    return (
      '<pre><code>' +
      md.utils.escapeHtml(str) +
      '</code></pre><p>' +
      (lang ? md.utils.escapeHtml(lang) : '') +
      '</p>'
    );
  },
});

// Add a ruler to recognize <br> as a hardbreak
md.inline.ruler.push('html_br', (state, silent) => {
  if (state.src.slice(state.pos, state.pos + 4) === '<br>') {
    if (!silent) {
      state.push('hardbreak', 'br', 0);
    }
    state.pos += 4;
    return true;
  }
  if (state.src.slice(state.pos, state.pos + 5) === '<br/>') {
    if (!silent) {
      state.push('hardbreak', 'br', 0);
    }
    state.pos += 5;
    return true;
  }
  return false;
});

// MARKDOWN-IT PLUGINS

md.use(markdownItEmoji, { defs: emoji_defs });
md.use(markdownItFootnote);
md.use(markdownItSub);
md.use(markdownItSup);
md.use(markdownItIns);
md.use(markdownItMark);
md.use(markdownItAbbr);
md.use(markdownItAttrs, {
  leftDelimiter: 'xx',
  rightDelimiter: 'xx',
  allowedAttributes: [],
});
md.use(markdownItTaskCheckbox, {
  disabled: false,
  divWrap: true,
  divClass: 'custom-checkbox',
  idPrefix: 'cbx_',
  ulClass: 'task-list',
  liClass: 'task-list-item',
});

md.use(markdownItAnchor, {
  level: 1,
  permalink: false,
  permalinkClass: 'header-anchor',
  permalinkSymbol: '¶',
  permalinkBefore: false,
});

const getSize = (node: string) => {
  let width: string | number = 1;
  let height: string | number = 1;
  let alt: string = '';

  const substrings = node.split('{{');
  alt = substrings[0].trim();

  const regex_w = /w:\d.*\b/;
  const regex_h = /h:\d.*\b/;

  const default_w = 100;
  const default_h = 100;

  let result_w;
  let result_h;

  if (substrings[1]) {
    result_w = substrings[1].match(regex_w);
    result_h = substrings[1].match(regex_h);
  }
  if (
    substrings[1] &&
    substrings[1].includes('}}') &&
    result_w !== null &&
    result_h !== null
  ) {
    width = substrings[1]
      ? substrings[1].match(/(?<=w:\s?)\d+/g)![0]
      : default_w;
    height = substrings[1]
      ? substrings[1].match(/(?<=h:\s?)\d+/g)![0]
      : default_h;
  } else {
    width = default_w;
    height = default_h;
  }
  return { width, height };
};

// MD RENDERER RULES

const anchorLinkStack: boolean[] = [];

const defaultLinkOpen = md.renderer.rules['link_open'];

md.renderer.rules['link_open'] = function (
  tokens: any,
  idx: any,
  options: any,
  env: any,
  slf: any,
) {
  const aIndex = tokens[idx].attrIndex('target');
  const hIndex = tokens[idx].attrIndex('href');
  if (aIndex < 0 && tokens[idx].attrs) {
    tokens[idx].attrPush(['target', '_blank']);
  } else if (aIndex >= 0 && tokens[idx].attrs) {
    tokens[idx].attrs[aIndex][1] = '_blank';
  }
  if (hIndex >= 0 && tokens[idx].attrs) {
    const linkText = tokens[idx].attrs[hIndex][1];
    if (linkText.charAt(0) === '#') {
      anchorLinkStack.push(true);
      if (tokens[idx].attrs) tokens[idx].attrs[hIndex][1] = '#';
      let frag = linkText.slice(1);
      if (frag.startsWith('user-content-')) {
        frag = frag.slice('user-content-'.length);
      }
      const safeId = sanitizeMarkdownTargetId(frag);
      const idAttr = safeId ? md.utils.escapeHtml(safeId) : '';
      return (
        '<span class="md_anchorlink" role="link" tabindex="0" data-md-target-id="' +
        idAttr +
        '">'
      );
    }
  }
  anchorLinkStack.push(false);
  return (
    defaultLinkOpen?.(tokens, idx, options, env, slf) ??
    slf.renderToken(tokens, idx, options)
  );
};

const defaultLinkClose = md.renderer.rules['link_close'];

md.renderer.rules['link_close'] = function (
  tokens: any,
  idx: any,
  options: any,
  env: any,
  slf: any,
) {
  const wasAnchor = anchorLinkStack.pop();
  if (wasAnchor) {
    return '</span>';
  }
  return (
    defaultLinkClose?.(tokens, idx, options, env, slf) ??
    slf.renderToken(tokens, idx, options)
  );
};

// Add class to table
md.renderer.rules['table_open'] = function (tokens: any, idx: any) {
  return '<table class="table table-striped">';
};

// Add width and height to images
md.renderer.rules.image = function (
  tokens: any,
  idx: any,
  options: any,
  env: any,
  slf: any,
) {
  var token = tokens[idx];
  token.attrs![token.attrIndex('alt')][1] = slf.renderInlineAsText(
    token.children!,
    options,
    env,
  );
  const size = getSize(token.attrs![token.attrIndex('alt')][1]);
  token.attrSet('width', size.width + 'px');
  token.attrSet('height', size.height + 'px');
  return (
    '<span class="image">' + slf.renderToken(tokens, idx, options) + '</span>'
  );
};

md.renderer.rules['footnote_anchor'] = function (
  tokens: any,
  idx: any,
  options: any,
  env: any,
  slf: any,
) {
  const id =
    (slf.rules.footnote_anchor_name?.(tokens, idx, options, env, slf) ?? '') +
    (tokens[idx].meta?.subId && tokens[idx].meta.subId > 0
      ? ':' + tokens[idx].meta.subId
      : '');
  const escId = md.utils.escapeHtml(id);
  return (
    '<span class="footnote-backref" data-md-footnote-scroll="fnref' +
    escId +
    '" id="fnref' +
    escId +
    '">\u21a9\uFE0E</span>'
  );
};

md.renderer.rules['footnote_ref'] = function (
  tokens: any,
  idx: any,
  options: any,
  env: any,
  slf: any,
) {
  const id =
    slf.rules.footnote_anchor_name?.(tokens, idx, options, env, slf) ?? '';
  const caption =
    slf.rules.footnote_caption?.(tokens, idx, options, env, slf) ?? '';
  const refid =
    id +
    (tokens[idx].meta?.subId && tokens[idx].meta.subId > 0
      ? ':' + tokens[idx].meta.subId
      : '');
  const escRef = md.utils.escapeHtml(refid);
  const escId = md.utils.escapeHtml(id);
  return (
    '<sup class="footnote-ref"><span class="md-footnote-ref" data-md-footnote-scroll="fn' +
    escId +
    '" id="fnref' +
    escRef +
    '">' +
    caption +
    '</span></sup>'
  );
};

// CUSTOM CONTAINERS

md.use(markdownItContainer, 'custom', {
  validate: (params: string) => !!params.trim().match(/^custom\s+(.*)$/),
  render: (tokens: any, idx: any) => {
    const m = tokens[idx].info.trim().match(/^custom\s+(.*)$/);
    if (tokens[idx].nesting === 1) {
      const safe = sanitizeCustomContainerStyles(m![1] ?? '');
      if (safe) return '<span style="' + md.utils.escapeHtml(safe) + '">\n';
      return '<span class="md-custom-unstyled">\n';
    }
    return '</span>\n';
  },
});

md.use(markdownItContainer, 'custom-css', {
  validate: (params: string) => !!params.trim().match(/^custom-css\s+(.*)$/),
  render: (tokens: any, idx: any) => {
    if (tokens[idx].nesting === 1) {
      const m = tokens[idx].info.trim().match(/^custom-css\s+(.*)$/);
      if (!m) return '';
      const classes = sanitizeCustomCssClasses(m[1]);
      if (classes)
        return '<span class="' + md.utils.escapeHtml(classes) + '">\n';
      return '<span class="md-custom-css-fallback">\n';
    }
    return '</span>\n';
  },
});

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
      this.outHtml = this.markdown.render(this.contextView());
      this.morphHtml.set(this.outHtml);
    }
  }
  @Input() scrollView?: number | undefined;
  @Input() splitScreen?: boolean | undefined;
  @Input() updatedViewText: (updatedEdit: string) => void;
  @Input() disableLinks: boolean;

  private markdown;
  outHtml: string;
  currenturl;

  private router = inject(Router);
  readonly mdHost = viewChild<ElementRef<HTMLElement>>('mdHost');
  private readonly morphHtml = signal<string>('');

  constructor() {
    this.currenturl = this.router.url;
    this.markdown = md;
    this.outHtml = this.markdown.render(this.contextView());
    this.morphHtml.set(this.outHtml);

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

  // Task line regex to match GFM task list lines
  private readonly TASK_LINE_RE = /^\s*[-*+]\s+\[[xX \u00A0]\s*\]/;

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

    // Parse frontmatter if present
    const parsed = fm(this.fullNoteText);
    const contentToUpdate = parsed.body || this.fullNoteText;

    // Split content into lines
    const lines = contentToUpdate.split('\n');
    let nth = 0;

    // Find the Nth task line and update it
    for (let i = 0; i < lines.length; i++) {
      if (this.TASK_LINE_RE.test(lines[i])) {
        if (nth === taskIndex) {
          // Replace checkbox state in the line
          lines[i] = lines[i].replace(
            /\[\s*(x|\s)\s*\]/i,
            checked ? '[x]' : '[ ]',
          );

          // Reconstruct content with updated line
          const updatedContent = lines.join('\n');

          // Preserve frontmatter if it exists
          const attrs = parsed.attributes as Record<string, unknown>;
          const updatedFull =
            attrs && typeof attrs === 'object' && Object.keys(attrs).length > 0
              ? stringifyFrontMatter(updatedContent, attrs)
              : updatedContent;

          // Call callback with updated full note text
          this.updatedViewText(updatedFull);
          return;
        }
        nth++;
      }
    }
  }
}
