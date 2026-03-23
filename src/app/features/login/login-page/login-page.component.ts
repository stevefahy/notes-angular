import {
  Component,
  ViewChild,
  ElementRef,
  OnInit,
  OnDestroy,
  signal,
  computed,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import {
  AlertInterface,
  IAuthContext,
  onLoginT,
  onRegisterT,
} from '../../../core/model/global';
import APPLICATION_CONSTANTS from '../../../core/application-constants/application-constants';
import {
  normalizeErrorToString,
  toUserFriendlyError,
} from '../../../core/lib/error-message-map';
import { AuthService } from '../../../core/services/auth.service';
import { Subscription, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'LoginPage',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent implements OnInit, OnDestroy {
  readonly AC = APPLICATION_CONSTANTS;
  private authService = inject(AuthService);
  private router = inject(Router);
  @ViewChild('usernameInputRef')
  usernameInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('emailInputRef') emailInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('passwordInputRef')
  passwordInputRef!: ElementRef<HTMLInputElement>;

  isLogin = signal<boolean>(true);
  isSubmitting = signal<boolean>(false);
  signupUsername = signal('');
  signupEmail = signal('');
  signupPassword = signal('');
  error = signal<AlertInterface>({
    error_state: false,
    error_severity: '',
    message: '',
  });
  onLogin: onLoginT;
  onRegister: onRegisterT;

  usernameError = computed(() => {
    const val = this.signupUsername();
    const len = val.length;
    if (len === 0) return '';
    if (len > this.AC.USERNAME_MAX)
      return `Too long — max ${this.AC.USERNAME_MAX} characters`;
    if (val.trim().length < this.AC.USERNAME_MIN)
      return `At least ${this.AC.USERNAME_MIN} characters required`;
    return '';
  });

  usernameValid = computed(
    () =>
      this.signupUsername().trim().length >= this.AC.USERNAME_MIN &&
      this.signupUsername().length <= this.AC.USERNAME_MAX,
  );

  private readonly emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  emailError = computed(() => {
    const val = this.signupEmail().trim();
    if (val.length === 0) return '';
    if (!this.emailRegex.test(val)) return this.AC.EMAIL_INVALID;
    return '';
  });

  emailValid = computed(() => {
    const val = this.signupEmail().trim();
    return val.length > 0 && this.emailRegex.test(val);
  });

  passwordError = computed(() => {
    const p = this.signupPassword();
    if (!p) return '';
    if (p.length < this.AC.PASSWORD_MIN)
      return `At least ${this.AC.PASSWORD_MIN} characters required`;
    if (p.length > this.AC.PASSWORD_MAX)
      return `Max ${this.AC.PASSWORD_MAX} characters`;
    return '';
  });

  passwordValid = computed(
    () =>
      this.signupPassword().length >= this.AC.PASSWORD_MIN &&
      this.signupPassword().length <= this.AC.PASSWORD_MAX,
  );

  signupFormValid = computed(
    () => this.usernameValid() && this.emailValid() && this.passwordValid(),
  );

  signupTooltip = computed(
    () =>
      this.usernameError() ||
      this.emailError() ||
      this.passwordError() ||
      (this.signupUsername().length === 0 ? 'Enter a username' : '') ||
      (this.signupEmail().trim().length === 0
        ? 'Enter an email address'
        : '') ||
      (this.signupPassword().length === 0 ? 'Enter a password' : ''),
  );

  strengthScore = computed(() => {
    let s = 0;
    const np = this.signupPassword();
    if (np.length >= this.AC.PASSWORD_MIN) s++;
    if (/[A-Z]/.test(np)) s++;
    if (/[0-9]/.test(np)) s++;
    if (/[^A-Za-z0-9]/.test(np)) s++;
    return s;
  });

  strengthClass = computed(() => {
    const s = this.strengthScore();
    return s <= 1 ? 'weak' : s <= 2 ? 'ok' : 'good';
  });

  onDestroy$: Subject<void> = new Subject();

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  sub: Subscription;

  ngOnInit(): void {
    this.sub = this.authService.authContext$.subscribe({
      next: (res: IAuthContext) => {
        this.updateContext(res);
      },
    });
  }

  updateContext = (context: IAuthContext) => {
    this.onLogin = context.onLogin;
    this.onRegister = context.onRegister;
  };

  readonly switchAuthModeHandler = () => {
    this.isLogin.update((prev) => !prev);
    this.signupUsername.set('');
    this.signupEmail.set('');
    this.signupPassword.set('');
    this.resetError();
  };

  readonly resetError = () => {
    this.error.set({
      error_state: false,
      message: '',
    });
    this.isSubmitting.set(false);
  };

  readonly isFieldError = () => {
    const msg = this.error().message;
    return (
      msg === this.AC.SIGNUP_INVALID_USERNAME ||
      msg === this.AC.SIGNUP_INVALID_EMAIL ||
      msg === this.AC.SIGNUP_INVALID_PASSWORD
    );
  };

  readonly validateForm = (validate: string[]) => {
    if (validate.includes('username')) {
      const enteredUsername = this.signupUsername().trim();
      if (
        enteredUsername.length < this.AC.USERNAME_MIN ||
        this.signupUsername().length > this.AC.USERNAME_MAX
      ) {
        this.usernameInputRef?.nativeElement?.focus();
        this.error.set({
          error_state: true,
          message: this.AC.SIGNUP_INVALID_USERNAME,
        });
        return false;
      }
    }
    if (validate.includes('email')) {
      const enteredEmail = this.signupEmail().trim();
      if (!enteredEmail || !this.emailRegex.test(enteredEmail)) {
        this.emailInputRef.nativeElement.focus();
        this.error.set({
          error_state: true,
          message: this.AC.SIGNUP_INVALID_EMAIL,
        });
        return false;
      }
    }
    if (validate.includes('password')) {
      const enteredPassword = this.signupPassword();
      if (
        !enteredPassword ||
        enteredPassword.length < this.AC.PASSWORD_MIN ||
        enteredPassword.length > this.AC.PASSWORD_MAX
      ) {
        this.passwordInputRef.nativeElement.focus();
        this.error.set({
          error_state: true,
          message: this.AC.SIGNUP_INVALID_PASSWORD,
        });
        return false;
      }
    }
    return true;
  };

  readonly submitHandler = async (event: Event) => {
    event.preventDefault();
    this.error.set({ error_state: false, message: '' });
    this.isSubmitting.set(true);

    const enteredEmail = this.signupEmail().trim();
    const enteredPassword = this.signupPassword();

    if (this.isLogin()) {
      // Existing user
      const validForm = this.validateForm(['email', 'password']);
      if (!validForm) {
        return;
      }
      try {
        const result = await this.onLogin(enteredEmail, enteredPassword);
        if ((result && result === undefined) || (result && result.error)) {
          if (!result.error) {
            result.error = 'Unauthorised';
          }
          const rawMsg = normalizeErrorToString(result.error);
          const displayMsg =
            result.fromServer === true ? rawMsg : toUserFriendlyError(rawMsg);
          this.isSubmitting.set(false);
          this.error.set({ error_state: true, message: displayMsg });
          return;
        } else {
          // Navigate the default page.
          this.router.navigate([`${this.AC.DEFAULT_PAGE}`]);
        }
      } catch (error: any) {
        this.isSubmitting.set(false);
        this.error.set({
          error_state: true,
          message: toUserFriendlyError(error),
        });
      }
    } else {
      // New User
      const enteredUsername = this.signupUsername().trim();
      const validForm = this.validateForm(['username', 'email', 'password']);
      if (!validForm) {
        return;
      }
      try {
        const result = await this.onRegister(
          enteredUsername,
          enteredEmail,
          enteredPassword,
          this.AC.FRAMEWORK,
        );
        this.isSubmitting.set(false);
        if (result === null || result === undefined) {
          this.router.navigate([`${this.AC.DEFAULT_PAGE}`]);
          return;
        }
        if (result.error) {
          const rawMsg = normalizeErrorToString(result.error);
          const displayMsg =
            result.fromServer === true ? rawMsg : toUserFriendlyError(rawMsg);
          this.error.set({ error_state: true, message: displayMsg });
          return;
        }
        if (result.success && result.notebookID && result.noteID) {
          this.router.navigate([
            `/notebook/${result.notebookID}/${result.noteID}`,
          ]);
        } else {
          this.router.navigate([`${this.AC.DEFAULT_PAGE}`]);
        }
      } catch (error: unknown) {
        this.error.set({
          error_state: true,
          message: toUserFriendlyError(error),
        });
      }
    }
  };
}
