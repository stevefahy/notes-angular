import {
  Component,
  ViewChild,
  ElementRef,
  OnInit,
  OnDestroy,
  ViewContainerRef,
  ComponentRef,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  AlertInterface,
  IAuthContext,
  onLoginT,
  onRegisterT,
} from '../../../core/model/global';
import APPLICATION_CONSTANTS from '../../../core/application-constants/application-constants';
import { AuthService } from '../../../core/services/auth.service';
import { Subscription, Subject, takeUntil } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { ErrorAlertComponent } from '../../../core/components/ui/error-alert/error-alert.component';

const AC = APPLICATION_CONSTANTS;

@Component({
  selector: 'LoginPage',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent implements OnInit, OnDestroy {
  constructor(private authService: AuthService, private router: Router) {}
  @ViewChild('usernameInputRef')
  usernameInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('emailInputRef') emailInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('passwordInputRef')
  passwordInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('errorcontainer', { read: ViewContainerRef })
  errorcontainer: ViewContainerRef;

  isLogin = signal<boolean>(true);
  isSubmitting = signal<boolean>(false);
  error = signal<AlertInterface>({
    error_state: false,
    error_severity: '',
    message: '',
  });
  error$ = toObservable(this.error);

  onLogin: onLoginT;
  onRegister: onRegisterT;

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

    this.error$.pipe(takeUntil(this.onDestroy$)).subscribe((err) => {
      if (err.error_state) {
        this.addErrorComponent();
      }
    });
  }

  componentAdded = false;

  componentRef: ComponentRef<ErrorAlertComponent>;

  public addErrorComponent(): void {
    this.isSubmitting.set(true);
    import('../../../core/lazy-error-alert.module').then((importedFile) => {
      const componentToOpen =
        importedFile.LazyLoadedModule.components.dynamicComponent;
      const componentRef = this.errorcontainer.createComponent(componentToOpen);
      componentRef.instance.error_state = this.error().error_state!;
      componentRef.instance.error_severity = this.error().error_severity!;
      componentRef.instance.message = this.error().message!;
    });
  }

  updateContext = (context: IAuthContext) => {
    this.onLogin = context.onLogin;
    this.onRegister = context.onRegister;
  };

  readonly switchAuthModeHandler = () => {
    this.isLogin.update((prev) => !prev);
    this.resetError();
  };

  readonly resetError = () => {
    this.error.set({
      error_state: false,
      message: '',
    });
    this.isSubmitting.set(false);
  };

  readonly validateForm = (validate: string[]) => {
    if (validate.includes('username')) {
      const enteredUsername = this.usernameInputRef.nativeElement.value;
      if (enteredUsername.length < 2) {
        this.usernameInputRef.nativeElement.focus();
        this.error.set({
          error_state: true,
          message: AC.SIGNUP_INVALID_USERNAME,
        });
        return false;
      }
    }
    if (validate.includes('email')) {
      const enteredEmail = this.emailInputRef.nativeElement.value;
      if (
        !enteredEmail ||
        !enteredEmail.includes('@') ||
        !enteredEmail.includes('.')
      ) {
        this.emailInputRef.nativeElement.focus();
        this.error.set({
          error_state: true,
          message: AC.SIGNUP_INVALID_EMAIL,
        });
        return false;
      }
    }
    if (validate.includes('password')) {
      const enteredPassword = this.passwordInputRef.nativeElement.value;
      if (!enteredPassword || enteredPassword.trim().length < 7) {
        this.passwordInputRef.nativeElement.focus();
        this.error.set({
          error_state: true,
          message: AC.SIGNUP_INVALID_PASSWORD,
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

    const enteredEmail = this.emailInputRef.nativeElement.value;
    const enteredPassword = this.passwordInputRef.nativeElement.value;

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
          this.error.set({ error_state: true, message: result.error });
          return;
        } else {
          // Navigate the default page.
          this.router.navigate([`${AC.DEFAULT_PAGE}`]);
        }
      } catch (error: any) {
        this.error.set({ error_state: true, message: error.message });
      }
    } else {
      // New User
      const enteredUsername = this.usernameInputRef.nativeElement.value;
      const validForm = this.validateForm(['username', 'email', 'password']);
      if (!validForm) {
        return;
      }
      try {
        const result = await this.onRegister(
          enteredUsername,
          enteredEmail,
          enteredPassword,
          'angular'
        );
        this.isSubmitting.set(false);
        if (result === null || result === undefined) {
          this.router.navigate([`${AC.DEFAULT_PAGE}`]);
          return;
        }
        if (result.error) {
          this.error.set({ error_state: true, message: result.error });
          return;
        }
        if (result.success && result.notebookID && result.noteID) {
          this.router.navigate([
            `/notebook/${result.notebookID}/${result.noteID}`,
          ]);
        } else {
          this.router.navigate([`${AC.DEFAULT_PAGE}`]);
        }
      } catch (error: any) {
        this.error.set({ error_state: true, message: error.message });
      }
    }
  };
}
