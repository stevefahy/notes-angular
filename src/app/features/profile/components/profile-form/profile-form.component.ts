import {
  Component,
  ViewChild,
  ElementRef,
  signal,
  Input,
  OnInit,
  ViewContainerRef,
  ComponentRef,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  AlertInterface,
  ProfileFormProps,
  ChangePasswordObj,
  NewUsernameObj,
} from 'src/app/core/model/global';
import APPLICATION_CONSTANTS from 'src/app/core/application-constants/application-constants';
import { ErrorAlertComponent } from '../../../../core/components/ui/error-alert/error-alert.component';
import { toObservable } from '@angular/core/rxjs-interop';
import { Subject, takeUntil } from 'rxjs';

const AC = APPLICATION_CONSTANTS;

@Component({
    selector: 'ProfileForm',
    standalone: true,
    imports: [CommonModule, FormsModule, MatButtonModule],
    templateUrl: './profile-form.component.html',
    styleUrls: ['./profile-form.component.scss'],
})
export class ProfileFormComponent
  implements ProfileFormProps, OnInit, OnDestroy
{
  @Input()
  set userName(name: string) {
    this.username.set(name);
  }
  @Input() onChangePassword: (arg0: ChangePasswordObj) => void;
  @Input() onChangeUsername: (arg0: NewUsernameObj) => void;

  @ViewChild('oldPasswordRef') oldPasswordRef!: ElementRef<HTMLInputElement>;
  @ViewChild('newPasswordRef') newPasswordRef!: ElementRef<HTMLInputElement>;
  @ViewChild('newUsernameRef') newUsernameRef!: ElementRef<HTMLInputElement>;

  @ViewChild('errorcontainer', { read: ViewContainerRef })
  errorcontainer: ViewContainerRef;

  username = signal<string>('');
  userNameToggle = signal<boolean>(false);
  passwordToggle = signal<boolean>(false);
  formIsValid = signal<boolean>(false);
  error = signal<AlertInterface>({
    error_state: false,
    error_severity: '',
    message: '',
  });
  error$ = toObservable(this.error);

  onDestroy$: Subject<void> = new Subject();

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  ngOnInit(): void {
    this.error$.pipe(takeUntil(this.onDestroy$)).subscribe((err) => {
      if (err.error_state) {
        this.addErrorComponent();
      }
    });
  }

  componentRef: ComponentRef<ErrorAlertComponent>;
  public addErrorComponent(): void {
    import('../../../../core/lazy-error-alert.module').then((importedFile) => {
      const componentToOpen =
        importedFile.LazyLoadedModule.components.dynamicComponent;
      this.componentRef = this.errorcontainer.createComponent(componentToOpen);
      this.componentRef.instance.error_state = this.error().error_state!;
      this.componentRef.instance.error_severity = this.error().error_severity!;
      this.componentRef.instance.message = this.error().message!;
    });
  }

  resetError = () => {
    if (this.componentRef) {
      this.componentRef.destroy();
    }
    this.formIsValid.set(true);
    this.error.update((prevState) => ({
      ...prevState,
      error_state: false,
      error_severity: '',
      message: '',
    }));
  };

  handleChangeUsername = (event: Event) => {
    this.resetError();
    const target = event.currentTarget! as HTMLInputElement;
    if (target.value.length < AC.USERNAME_MIN || target.value === undefined) {
      this.formIsValid.set(false);
      this.error.update((prevState) => ({
        ...prevState,
        error_state: true,
        error_severity: 'warning',
        message: AC.CHANGE_USER_TOO_FEW,
      }));
    } else if (target.value.length > AC.USERNAME_MAX) {
      this.formIsValid.set(false);
      this.error.update((prevState) => ({
        ...prevState,
        error_state: true,
        error_severity: 'warning',
        message: AC.CHANGE_USER_TOO_MANY,
      }));
    } else if (target.value === this.username()) {
      this.formIsValid.set(false);
      this.error.update((prevState) => ({
        ...prevState,
        error_state: true,
        error_severity: 'warning',
        message: AC.CHANGE_USER_UNIQUE,
      }));
    } else {
      this.resetError();
    }
  };

  handleChangePassword = (event: Event) => {
    this.resetError();
    const target = event.currentTarget! as HTMLInputElement;
    const enteredOldPassword = this.oldPasswordRef.nativeElement.value;
    const enteredNewPassword = this.newPasswordRef.nativeElement.value;
    if (
      enteredOldPassword!.length < AC.PASSWORD_MIN ||
      enteredNewPassword!.length < AC.PASSWORD_MIN
    ) {
      this.formIsValid.set(false);
      this.error.update((prevState) => ({
        ...prevState,
        error_state: true,
        error_severity: 'warning',
        message: AC.CHANGE_PASS_TOO_FEW,
      }));
    } else if (
      enteredOldPassword!.length > AC.PASSWORD_MAX ||
      enteredNewPassword!.length > AC.PASSWORD_MAX
    ) {
      this.formIsValid.set(false);
      this.error.update((prevState) => ({
        ...prevState,
        error_state: true,
        error_severity: 'warning',
        message: AC.CHANGE_PASS_TOO_MANY,
      }));
    } else if (
      enteredOldPassword &&
      enteredNewPassword &&
      enteredOldPassword === enteredNewPassword
    ) {
      this.formIsValid.set(false);
      this.error.update((prevState) => ({
        ...prevState,
        error_state: true,
        error_severity: 'warning',
        message: AC.CHANGE_PASS_UNIQUE,
      }));
    } else if (enteredOldPassword!.length !== enteredNewPassword!.length) {
      this.formIsValid.set(false);
      this.error.update((prevState) => ({
        ...prevState,
        error_state: true,
        error_severity: 'warning',
        message: AC.CHANGE_PASS_LENGTH,
      }));
    } else {
      this.resetError();
    }
  };

  submitHandlerUsername = (event: Event) => {
    event.preventDefault();
    const enteredNewUsername = this.newUsernameRef.nativeElement.value;
    if (!enteredNewUsername) return;
    this.onChangeUsername({
      newUsername: enteredNewUsername,
    });
    this.resetToggle();
  };

  submitHandlerPassword = (event: Event) => {
    event.preventDefault();
    const enteredOldPassword = this.oldPasswordRef.nativeElement?.value;
    const enteredNewPassword = this.newPasswordRef.nativeElement?.value;
    if (!enteredOldPassword || !enteredNewPassword) {
      return;
    }
    this.onChangePassword({
      oldPassword: enteredOldPassword,
      newPassword: enteredNewPassword,
    });
    this.resetToggle();
  };

  resetToggle = () => {
    this.resetError();
    this.userNameToggle.update((prev) => {
      return false;
    });
    this.passwordToggle.update((prev) => {
      return false;
    });
  };

  toggleUserName = () => {
    this.resetError();
    this.userNameToggle.update((prev) => {
      return !prev;
    });
    this.passwordToggle.update((prev) => {
      return false;
    });
  };

  togglePassword = () => {
    this.resetError();
    this.passwordToggle.update((prev) => {
      return !prev;
    });
    this.userNameToggle.update((prev) => {
      return false;
    });
  };
}
