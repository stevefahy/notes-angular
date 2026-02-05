import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { IAuthContext, IAuthDetails } from 'src/app/core/model/global';
import { Store } from '@ngrx/store';
import { NotificationActions } from '../../../../store/actions/notification.actions';
import { changePassword } from 'src/app/core/helpers/changePassword';
import { changeUsername } from 'src/app/core/helpers/changeUsername';
import { Subject, takeUntil } from 'rxjs';
import { LoadingScreenComponent } from '../../../../core/components/ui/loading-screen/loading-screen.component';
import { ProfileFormComponent } from '../profile-form/profile-form.component';

@Component({
    selector: 'UserProfile',
    standalone: true,
    imports: [CommonModule, LoadingScreenComponent, ProfileFormComponent],
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent implements OnInit, OnDestroy {
  loading: boolean | null;
  token: string | null;
  success: boolean | null;
  details: IAuthDetails | null;
  onLogout: () => void;

  private authService = inject(AuthService);
  private store = inject(Store);

  onDestroy$: Subject<void> = new Subject();

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  ngOnInit(): void {
    this.authService.authContext$
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((res: IAuthContext) => {
        this.updateContext(res);
      });
  }

  updateContext = (context: IAuthContext) => {
    this.loading = context.loading;
    this.token = context.token;
    this.success = context.success;
    this.details = context.details;
    this.onLogout = context.onLogout;
  };

  readonly showNotification = (msg: string) => {
    this.store.dispatch(
      NotificationActions.showNotification({
        notification: { n_status: 'error', title: 'Error!', message: msg },
      })
    );
  };

  readonly changePasswordHandler = async (passwordData: {}) => {
    if (this.token) {
      try {
        const response = await changePassword(this.token, passwordData);
        if (response.error) {
          this.showNotification(`${response.error}`);
          return;
        }
        if (response.success) {
        }
      } catch (err) {
        this.showNotification(`${err}`);
        return;
      }
    }
  };

  readonly changeUsernameHandler = async (passwordData: {}) => {
    if (this.token) {
      try {
        const response = await changeUsername(this.token, passwordData);
        if (response.error) {
          this.showNotification(`${response.error}`);
          return;
        }
        if (response.error === 'Unauthorized') {
          if (this.onLogout) {
            this.onLogout();
          }
          return;
        }
        if (response.success) {
          this.authService.authContext.update((authContext: IAuthContext) => {
            return {
              ...authContext,
              success: response.success,
              details: response.details,
              loading: false,
            };
          });
        }
      } catch (err) {
        this.showNotification(`${err}`);
        return;
      }
    }
  };
}
