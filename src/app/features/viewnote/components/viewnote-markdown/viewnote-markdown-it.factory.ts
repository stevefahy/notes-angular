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

import {
  sanitizeCustomContainerStyles,
  sanitizeCustomCssClasses,
  sanitizeMarkdownTargetId,
} from 'src/app/core/lib/markdownSafeStyles';

const langAliases: Record<string, string> = { md: 'markdown' };

export function createViewnoteMarkdownIt(
  emojiDefs: Record<string, string>,
): MarkdownIt {
  let md: MarkdownIt;
  md = new MarkdownIt({
    html: false,
    linkify: true,
    typographer: true,
    langPrefix: 'language-',
    breaks: false,
    highlight: function (str: string, lang: string): string {
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

  md.inline.ruler.push('html_br', (state: unknown, silent: boolean) => {
    const s = state as {
      src: string;
      pos: number;
      push: (type: string, tag: string, nesting: number) => void;
    };
    if (s.src.slice(s.pos, s.pos + 4) === '<br>') {
      if (!silent) {
        s.push('hardbreak', 'br', 0);
      }
      s.pos += 4;
      return true;
    }
    if (s.src.slice(s.pos, s.pos + 5) === '<br/>') {
      if (!silent) {
        s.push('hardbreak', 'br', 0);
      }
      s.pos += 5;
      return true;
    }
    return false;
  });

  md.use(markdownItEmoji, { defs: emojiDefs });
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

  md.renderer.rules['table_open'] = function (tokens: any, idx: any) {
    return '<table class="table table-striped">';
  };

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
      (slf.rules.footnote_anchor_name?.(tokens, idx, options, env, slf) ??
        '') +
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

  return md;
}

let markdownItPromise: Promise<MarkdownIt> | null = null;

/**
 * Lazily loads custom emoji definitions (separate chunk) and returns a shared MarkdownIt instance.
 */
export function getViewnoteMarkdownIt(): Promise<MarkdownIt> {
  markdownItPromise ??= import(
    '../../../../core/lib/emoji_definitions'
  ).then((m) => createViewnoteMarkdownIt(m.default));
  return markdownItPromise;
}
