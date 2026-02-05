import { inject } from '@angular/core';
import { Router, CanActivateFn, CanDeactivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

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
 * Functional guard for canDeactivate
 * Replaces the class-based AuthGuardService.canDeactivate method
 *
 * Note: You can customize this to check for unsaved changes in components
 * For example, if a component has unsaved changes, you could inject it and check:
 *
 * export const canDeactivateGuard: CanDeactivateFn<ComponentWithUnsavedChanges> = (
 *   component: ComponentWithUnsavedChanges
 * ) => {
 *   return component.canDeactivate ? component.canDeactivate() : true;
 * };
 */
export const canDeactivateGuard: CanDeactivateFn<any> = () => {
  // For now, always allow navigation
  // You can add logic here to check for unsaved changes if needed
  // The old AuthGuardService had a `deactivate` property that was always true
  return true;
};
