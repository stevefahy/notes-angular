import { inject } from '@angular/core';
import { Router, CanActivateFn, CanDeactivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NoteComponent } from '../../features/note/note/note.component';

/**
 * Functional guard that checks if user is authenticated
 * Replaces the class-based AuthGuardService.canActivate method
 */
export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = await authService.authGuardVerify();
  if (!token) {
    router.navigate(['login']);
    return false;
  }
  return token;
};

/**
 * Saves unsaved note content before leaving the note route, then allows navigation.
 * Matches prior behavior: persist on leave and show "Note Saved" on success.
 */
export const canDeactivateGuard: CanDeactivateFn<NoteComponent> = (
  component,
) => {
  return typeof component?.confirmNavigateAway === 'function'
    ? component.confirmNavigateAway()
    : true;
};
