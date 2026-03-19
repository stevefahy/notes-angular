import {
  Component,
  ViewChild,
  signal,
  computed,
  Input,
  OnInit,
  ViewContainerRef,
  ComponentRef,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AlertInterface,
  ChangePasswordObj,
  NewUsernameObj,
} from 'src/app/core/model/global';
import APPLICATION_CONSTANTS from 'src/app/core/application-constants/application-constants';
import {
  normalizeErrorToString,
  toUserFriendlyError,
} from 'src/app/core/lib/error-message-map';
import { ErrorAlertComponent } from '../../../../core/components/ui/error-alert/error-alert.component';
import { toObservable } from '@angular/core/rxjs-interop';
import { Subject, takeUntil } from 'rxjs';

const AC = APPLICATION_CONSTANTS;

@Component({
  selector: 'ProfileForm',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-form.component.html',
  styleUrls: ['./profile-form.component.scss'],
})
export class ProfileFormComponent implements OnInit, OnDestroy {
  @Input() set userName(name: string) {
    this._username.set(name ?? '');
  }
  @Input() onChangePassword: (arg0: ChangePasswordObj) => void;
  @Input() onChangeUsername: (arg0: NewUsernameObj) => void;

  @ViewChild('errorcontainer', { read: ViewContainerRef })
  errorcontainer: ViewContainerRef;

  AC = AC;
  _username = signal<string>('');
  activeTab = signal<'user' | 'pass'>('user');
  newUsername = signal('');
  oldPassword = signal('');
  newPassword = signal('');
  isSubmitting = signal(false);
  usernameServerError = signal('');
  passwordServerError = signal('');
  tooltipSuppressed = signal(false);

  usernameError = computed(() => {
    const val = this.newUsername();
    const len = val.length;
    if (len === 0) return '';
    if (len > AC.USERNAME_MAX)
      return `Too long — max ${AC.USERNAME_MAX} characters`;
    if (val.trim() === this._username()) return 'Same as your current username';
    if (val.trim().length < AC.USERNAME_MIN)
      return `At least ${AC.USERNAME_MIN} characters required`;
    return '';
  });

  usernameValid = computed(
    () =>
      this.newUsername().length > 0 &&
      this.newUsername().length <= AC.USERNAME_MAX &&
      this.newUsername().trim() !== this._username() &&
      this.newUsername().trim().length >= AC.USERNAME_MIN,
  );

  usernameTooltip = computed(
    () =>
      this.usernameError() ||
      (this.newUsername().length === 0 ? 'Enter a new username to save' : ''),
  );

  passwordError = computed(() => {
    const np = this.newPassword();
    const op = this.oldPassword();
    if (!np || !op) return '';
    if (np === op) return 'Must differ from your current password';
    if (np.length < AC.PASSWORD_MIN)
      return `At least ${AC.PASSWORD_MIN} characters required`;
    if (np.length > AC.PASSWORD_MAX) return `Max ${AC.PASSWORD_MAX} characters`;
    return '';
  });

  passwordValid = computed(
    () =>
      !!this.oldPassword() &&
      !!this.newPassword() &&
      this.newPassword() !== this.oldPassword() &&
      this.newPassword().length >= AC.PASSWORD_MIN &&
      this.newPassword().length <= AC.PASSWORD_MAX,
  );

  passwordTooltip = computed(
    () =>
      this.passwordError() ||
      (!this.oldPassword() || !this.newPassword()
        ? 'Fill in both fields to continue'
        : ''),
  );

  strengthScore = computed(() => {
    let s = 0;
    const np = this.newPassword();
    if (np.length >= AC.PASSWORD_MIN) s++;
    if (/[A-Z]/.test(np)) s++;
    if (/[0-9]/.test(np)) s++;
    if (/[^A-Za-z0-9]/.test(np)) s++;
    return s;
  });

  strengthClass = computed(() => {
    const s = this.strengthScore();
    return s <= 1 ? 'weak' : s <= 2 ? 'ok' : 'good';
  });

  formIsValid = signal<boolean>(false);
  error = signal<AlertInterface>({
    error_state: false,
    error_severity: '',
    message: '',
  });
  error$ = toObservable(this.error);

  onDestroy$ = new Subject<void>();
  componentRef: ComponentRef<ErrorAlertComponent>;

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

  setActiveTab(tab: 'user' | 'pass'): void {
    this.activeTab.set(tab);
  }

  addErrorComponent(): void {
    if (!this.errorcontainer) return;
    import('../../../../core/lazy-error-alert.module').then((importedFile) => {
      const componentToOpen =
        importedFile.LazyLoadedModule.components.dynamicComponent;
      this.componentRef = this.errorcontainer.createComponent(componentToOpen);
      this.componentRef.instance.error_state = this.error().error_state!;
      this.componentRef.instance.error_severity = this.error().error_severity!;
      this.componentRef.instance.message = this.error().message!;
    });
  }

  resetError(): void {
    if (this.componentRef) {
      this.componentRef.destroy();
    }
    this.formIsValid.set(true);
    this.error.update((prev) => ({
      ...prev,
      error_state: false,
      error_severity: '',
      message: '',
    }));
  }

  submitHandlerUsername = async (event: Event): Promise<void> => {
    event.preventDefault();
    if (!this.usernameValid()) return;
    this.isSubmitting.set(true);
    this.usernameServerError.set('');
    const result = (await this.onChangeUsername({
      newUsername: this.newUsername().trim(),
    })) as unknown as {
      success?: boolean;
      error?: string;
      fromServer?: boolean;
    };
    this.isSubmitting.set(false);
    if (result?.error) {
      const rawMsg = normalizeErrorToString(result.error);
      const msg =
        result.fromServer === true ? rawMsg : toUserFriendlyError(rawMsg);
      this.usernameServerError.set(msg);
    } else if (result?.success) {
      this.newUsername.set('');
    }
  };

  submitHandlerPassword = async (event: Event): Promise<void> => {
    event.preventDefault();
    if (!this.passwordValid()) return;
    this.isSubmitting.set(true);
    this.passwordServerError.set('');
    const result = (await this.onChangePassword({
      oldPassword: this.oldPassword(),
      newPassword: this.newPassword(),
    })) as unknown as {
      success?: boolean;
      error?: string;
      fromServer?: boolean;
    };
    this.isSubmitting.set(false);
    if (result?.error) {
      const rawMsg = normalizeErrorToString(result.error);
      const msg =
        result.fromServer === true ? rawMsg : toUserFriendlyError(rawMsg);
      this.passwordServerError.set(msg);
    } else if (result?.success) {
      this.oldPassword.set('');
      this.newPassword.set('');
    }
  };
}
