import * as yaml from 'js-yaml';

/**
 * Stringify front matter and content back to a full document.
 * Used when updating note content (e.g. checkbox state) while preserving YAML front matter.
 */
export function stringifyFrontMatter(content: string, data: Record<string, unknown>): string {
  if (!data || Object.keys(data).length === 0) {
    return content;
  }
  return `---\n${yaml.dump(data)}---\n${content}`;
}
