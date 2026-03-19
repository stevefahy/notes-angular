import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { SnackActions } from 'src/app/store/actions/snack.actions';
import {
  normalizeErrorToString,
  toUserFriendlyError,
} from '../lib/error-message-map';

@Injectable({
  providedIn: 'root',
})
export class SnackService {
  private store = inject(Store);

  /** Show an error snackbar. Use for API/server errors. When fromServer is true, show message as-is; otherwise run through toUserFriendlyError. */
  showErrorSnack(err: unknown, fromServer = false): void {
    const message =
      fromServer === true
        ? normalizeErrorToString(err)
        : toUserFriendlyError(err);
    this.store.dispatch(
      SnackActions.showSnack({
        snack: { n_status: true, message, variant: 'error' },
      }),
    );
  }

  /** Show a warning snackbar. */
  showWarningSnack(message: string): void {
    this.store.dispatch(
      SnackActions.showSnack({
        snack: { n_status: true, message, variant: 'warning' },
      }),
    );
  }

  /** Show a success snackbar. */
  showSnack(message: string): void {
    this.store.dispatch(
      SnackActions.showSnack({
        snack: { n_status: true, message, variant: 'success' },
      }),
    );
  }
}
