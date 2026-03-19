import { Component, Input, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ViewNoteMarkdownProps } from 'src/app/core/model/global';
import { EscapeHtmlPipe } from '../../../../core/pipes/keep-html.pipe';
import fm from 'front-matter';
import emoji_defs from 'src/app/core/lib/emoji_definitions';
import { stringifyFrontMatter } from 'src/app/core/lib/front-matter-helper';
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

// Add target blank to links
// & Change Anchor links to scrollIntoView
// Remember old renderer, if overridden, or proxy to default renderer
var defaultRender =
  md.renderer.rules['link_open'] ||
  function (tokens: any, idx: any, options: any, env: any, slf: any) {
    return slf.renderToken(tokens, idx, options);
  };

md.renderer.rules['link_open'] = function (
  tokens: any,
  idx: any,
  options: any,
  env: any,
  slf: any,
) {
  var aIndex = tokens[idx].attrIndex('target');
  var hIndex = tokens[idx].attrIndex('href');
  if (aIndex < 0) {
    tokens[idx].attrPush(['target', '_blank']); // add new attribute
  } else {
    tokens[idx].attrs[aIndex][1] = '_blank'; // replace value of existing attr
  }
  // Change Anchor links to scrollIntoView
  // anchor links were causing page reload
  if (hIndex >= 0) {
    const link_text = tokens[idx].attrs[hIndex][1];
    if (link_text.charAt(0) === '#') {
      tokens[idx].attrs[hIndex][1] = 'javascript: void(0)';
      const anchor_link = "'" + link_text + "'";
      return (
        '<span class="md_anchorlink" onclick="document.querySelector(' +
        anchor_link +
        ').scrollIntoView()">'
      );
    }
  }
  return defaultRender(tokens, idx, options, env, slf);
};

md.renderer.rules['link_close'] = function (
  tokens: any,
  idx: any,
  options: any,
  env: any,
  slf: any,
) {
  var hIndex = tokens[idx].attrIndex('href');
  if (hIndex >= 0) {
    const link_text = tokens[idx].attrs[hIndex][1];
    if (link_text.charAt(0) === '#') {
      // change href
      tokens[idx].attrs[hIndex][1] = 'javascript: void(0)';
      return '</span>';
    }
  }
  return defaultRender(tokens, idx, options, env, slf);
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

// Footnotes enable scrollIntoView instead of Anchor link
md.renderer.rules['footnote_anchor'] = function (
  tokens: any,
  idx: any,
  options: any,
  env: any,
  slf: any,
) {
  var id = slf.rules.footnote_anchor_name(tokens, idx, options, env, slf);
  if (tokens[idx].meta.subId > 0) {
    id += ':' + tokens[idx].meta.subId;
  }
  const newid = "'#fnref" + id + "'";
  return (
    '<span class="footnote-backref" onclick="document.querySelector(' +
    newid +
    ').scrollIntoView()" id="fnref' +
    id +
    '">\u21a9\uFE0E</span>'
  );
  /* ↩ with escape code to prevent display as Apple Emoji on iOS */
};

md.renderer.rules['footnote_ref'] = function (
  tokens: any,
  idx: any,
  options: any,
  env: any,
  slf: any,
) {
  var id = slf.rules.footnote_anchor_name(tokens, idx, options, env, slf);
  var caption = slf.rules.footnote_caption(tokens, idx, options, env, slf);
  var refid = id;
  if (tokens[idx].meta.subId > 0) {
    refid += ':' + tokens[idx].meta.subId;
  }
  const newid = "'#fn" + id + "'";
  return (
    '<sup class="footnote-ref"><span onclick="document.querySelector(' +
    newid +
    ').scrollIntoView()" id="fnref' +
    refid +
    '">' +
    caption +
    '</span></sup>'
  );
};

// CUSTOM CONTAINERS

// Custom container that can have styles added
md.use(markdownItContainer, 'custom', {
  validate: function (params: any) {
    return params.trim().match(/^custom\s+(.*)$/);
  },
  render: function (tokens: any, idx: any) {
    var m = tokens[idx].info.trim().match(/^custom\s+(.*)$/);
    if (tokens[idx].nesting === 1) {
      // opening tag
      return '<span style="' + md.utils.escapeHtml(m[1]) + '">\n';
    } else {
      // closing tag
      return '</span>\n';
    }
  },
});

// Custom container that can have css added
// md.use(require('markdown-it-container'), 'custom-css', {
md.use(markdownItContainer, 'custom-css', {
  validate: function (params: any) {
    return params.trim().match(/^custom-css\s+(.*)$/);
  },
  render: function (tokens: any, idx: any) {
    var m = tokens[idx].info.trim().match(/^custom-css\s+(.*)$/);
    if (tokens[idx].nesting === 1) {
      // opening tag
      return '<span class="' + md.utils.escapeHtml(m[1]) + '">\n';
    } else {
      // closing tag
      return '</span>\n';
    }
  },
});

@Component({
  selector: 'ViewNoteMarkdown',
  standalone: true,
  imports: [CommonModule, EscapeHtmlPipe],
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
    }
  }
  @Input() scrollView?: number | undefined;
  @Input() splitScreen?: boolean | undefined;
  @Input() updatedViewText: (updatedEdit: string) => void;
  @Input() disableLinks: boolean;

  private markdown;
  outHtml;
  currenturl;

  private router = inject(Router);

  constructor() {
    this.currenturl = this.router.url;
    this.markdown = md;
    this.outHtml = this.markdown.render(this.contextView());
  }

  content: string;
  fullNoteText: string = '';
  contextView = signal<string>('');
  isLoaded = signal<boolean>(false);

  // Task line regex to match GFM task list lines
  private readonly TASK_LINE_RE = /^\s*[-*+]\s+\[[xX \u00A0]\s*\]/;

  ngOnInit(): void {}

  onCheckboxClick(event: MouseEvent): void {
    // Only process if update callback exists (not read-only)
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
        // Label click toggles the checkbox; use the new state
        checked = !checkbox.checked;
      }
    }

    if (!checkbox?.id?.startsWith('cbx_') || checked === undefined) {
      return;
    }

    const taskIndex = parseInt(checkbox.id.slice(4), 10); // 4 = length of 'cbx_'
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
