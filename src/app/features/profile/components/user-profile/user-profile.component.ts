import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { IAuthContext, IAuthDetails } from 'src/app/core/model/global';
import { SnackService } from '../../../../core/services/snack.service';
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
  private snack = inject(SnackService);

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

  readonly changePasswordHandler = async (passwordData: {
    oldPassword?: string;
    newPassword?: string;
  }) => {
    if (this.token) {
      try {
        const response = await changePassword(this.token, passwordData);
        if (response.error) {
          return {
            success: false,
            error: response.error,
            fromServer: response.fromServer,
          };
        }
        if (response.success) {
          this.snack.showSnack('Password updated');
          return { success: true };
        }
      } catch (err) {
        return { success: false, error: `${err}`, fromServer: false };
      }
    }
    return { success: false };
  };

  readonly changeUsernameHandler = async (passwordData: {
    newUsername?: string;
  }) => {
    if (this.token) {
      try {
        const response = await changeUsername(this.token, passwordData);
        if (response.error) {
          return {
            success: false,
            error: response.error,
            fromServer: response.fromServer,
          };
        }
        if (response.error === 'Unauthorized') {
          if (this.onLogout) {
            this.onLogout();
          }
          return { success: false, error: 'Unauthorized', fromServer: true };
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
          this.snack.showSnack('User name changed!');
          return { success: true };
        }
      } catch (err) {
        return { success: false, error: `${err}`, fromServer: false };
      }
    }
    return { success: false };
  };
}
