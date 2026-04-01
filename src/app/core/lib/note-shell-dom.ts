/**
 * Framework-agnostic note shell transitions: set data-note-transition on #view_container;
 * CSS (@keyframes / transitions) in styles/note-shell.css performs motion.
 */

export type NoteShellLayout = 'edit' | 'view' | 'split';

const SCROLL_LOCK_CLASS = 'note-shell--scroll-locked';

const NOTE_SHELL_CSS_VAR_EDIT_VIEW =
  '--note-shell-edit-view-animation-duration';
const NOTE_SHELL_CSS_VAR_SPLIT = '--note-shell-split-animation-duration';

const FALLBACK_ANIMATION_MS = 380;

function parseCssTimeToMs(raw: string): number {
  const s = raw.trim();
  if (!s) return FALLBACK_ANIMATION_MS;
  const msMatch = s.match(/^([\d.]+)ms$/i);
  if (msMatch) return Math.round(parseFloat(msMatch[1]));
  const sMatch = s.match(/^([\d.]+)s$/i);
  if (sMatch) return Math.round(parseFloat(sMatch[1]) * 1000);
  return FALLBACK_ANIMATION_MS;
}

function readCssVarDurationMs(varName: string): number {
  if (typeof document === 'undefined') return FALLBACK_ANIMATION_MS;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(
    varName,
  );
  return parseCssTimeToMs(raw);
}

function cleanupMsForCssVar(varName: string): number {
  return readCssVarDurationMs(varName) + 50;
}

function tokenToCssVarName(token: string): string {
  if (token === 'view-edit' || token === 'edit-view')
    return NOTE_SHELL_CSS_VAR_EDIT_VIEW;
  return NOTE_SHELL_CSS_VAR_SPLIT;
}

function getNoteShellTransitionCleanupMsForToken(token: string): number {
  return cleanupMsForCssVar(tokenToCssVarName(token));
}

export function getNoteShellSplitTransitionCleanupMs(): number {
  return cleanupMsForCssVar(NOTE_SHELL_CSS_VAR_SPLIT);
}

export function getNoteShellEditViewTransitionCleanupMs(): number {
  return cleanupMsForCssVar(NOTE_SHELL_CSS_VAR_EDIT_VIEW);
}

type Cleanup = { timeoutId: number };

const cleanups = new WeakMap<HTMLElement, Cleanup>();

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function noteShellTransitionToken(
  from: NoteShellLayout,
  to: NoteShellLayout,
): string | null {
  if (from === 'view' && to === 'edit') return 'view-edit';
  if (from === 'edit' && to === 'view') return 'edit-view';
  if (from === 'edit' && to === 'split') return 'edit-split';
  if (from === 'view' && to === 'split') return 'view-split';
  if (from === 'split' && to === 'edit') return 'split-edit';
  if (from === 'split' && to === 'view') return 'split-view';
  return null;
}

function cancelPending(root: HTMLElement): void {
  const c = cleanups.get(root);
  if (c) {
    clearTimeout(c.timeoutId);
    cleanups.delete(root);
  }
  root.classList.remove(SCROLL_LOCK_CLASS);
  delete root.dataset['noteTransition'];
}

export function commitNoteShellTransition(
  root: HTMLElement | null,
  from: NoteShellLayout,
  to: NoteShellLayout,
): void {
  if (!root || from === to) return;

  cancelPending(root);

  const token = noteShellTransitionToken(from, to);
  if (!token || prefersReducedMotion()) {
    return;
  }

  root.dataset['noteTransition'] = token;
  root.classList.add(SCROLL_LOCK_CLASS);
  void root.offsetWidth;

  const cleanupMs = getNoteShellTransitionCleanupMsForToken(token);
  const timeoutId = window.setTimeout((): void => {
    root.classList.remove(SCROLL_LOCK_CLASS);
    delete root.dataset['noteTransition'];
    cleanups.delete(root);
  }, cleanupMs);

  cleanups.set(root, { timeoutId });
}
