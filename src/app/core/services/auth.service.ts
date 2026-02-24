import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  AuthAuthenticate,
  AuthSignup,
  IAuthContext,
} from 'src/app/core/model/global';
import { login } from '../helpers/login';
import { logout } from '../helpers/logout';
import { refreshtoken } from '../helpers/refreshtoken';
import { signup } from '../helpers/signup';
import { Store } from '@ngrx/store';
import { NotificationActions } from 'src/app/store/actions/notification.actions';
import { toObservable } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import APPLICATION_CONSTANTS from 'src/app/core/application-constants/application-constants';
import { JwtHelperService } from '@auth0/angular-jwt';

const AC = APPLICATION_CONSTANTS;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public jwtHelper: JwtHelperService = new JwtHelperService();

  constructor(
    private http: HttpClient,
    private store: Store,
    private router: Router
  ) {
    this.AutoRefreshToken();
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.verifyRefreshTokenWithRetry();
        }
      });
    }
  }

  interval: NodeJS.Timeout;
  AutoRefreshToken = () => {
    this.interval = setInterval(() => {
      if (!this.authContext().success) {
        this.autoLogout();
      } else {
        this.verifyRefreshToken();
      }
    }, AC.REFRESH_TOKEN_INTERVAL);
  };

  getServer() {
    return this.http.get('http://localhost:5000');
  }

  readonly showNotification = (msg: string) => {
    this.store.dispatch(
      NotificationActions.showNotification({
        notification: { n_status: 'error', title: 'Error!', message: msg },
      })
    );
  };

  readonly resetAuthContext = () => {
    this.authContext.update((authContext: IAuthContext) => {
      return {
        ...authContext,
        success: null,
        token: null,
        details: null,
        loading: false,
      };
    });
  };

  readonly logoutHandler = async (token: string) => {
    if (token) {
      try {
        const response = await logout(token);
        if (response.error) {
          this.showNotification(`${response.error}`);
          return;
        }
        if (response.success) {
          this.resetAuthContext();
          let dateNow: number = Date.now();
          window.localStorage.setItem('logout', '' + dateNow);
          this.router.navigate([`${AC.LOGIN_PAGE}`]);
        }
      } catch (err) {
        this.showNotification(`${err}`);
        return;
      }
    }
  };

  autoLogout = () => {
    this.router.navigate([`${AC.LOGIN_PAGE}`]);
    clearInterval(this.interval);
  };

  public authGuardVerify = async () => {
    if (!this.authContext().token) {
      await this.verifyRefreshTokenWithRetry();
    }
    // console.log(
    //   this.jwtHelper.getTokenExpirationDate(this.authContext().token!)
    // );
    return !this.jwtHelper.isTokenExpired(this.authContext().token);
  };

  public verifyRefreshToken = async () => {
    try {
      const response = await this.getRefreshToken();
      if (response === null || response === undefined) {
        this.resetAuthContext();
        this.autoLogout();
        return;
      }
      if (response.success) {
        this.authContext.update((authContext: IAuthContext) => {
          return {
            ...authContext,
            success: response.success,
            details: response.details,
            token: response.token,
            loading: false,
          };
        });
      } else {
        this.autoLogout();
      }
    } catch (err) {
      this.resetAuthContext();
    }
  };

  public verifyRefreshTokenWithRetry = async (retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await this.getRefreshToken();
        if (response?.success) {
          this.authContext.update((authContext: IAuthContext) => {
            return {
              ...authContext,
              success: response.success,
              details: response.details,
              token: response.token,
              loading: false,
            };
          });
          return;
        }
      } catch {
        /* retry on next iteration */
      }
      if (i < retries - 1) {
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
    this.resetAuthContext();
    this.autoLogout();
  };

  readonly getRefreshToken = async () => {
    try {
      const response = await refreshtoken();
      if (!response) {
        return;
      }
      if (response.error) {
        // this.showNotification(`${response.error}`);
        return;
      }
      if (response.success) {
        return response;
      }
    } catch (err) {
      // this.showNotification(`${err}`);
      return;
    }
    return;
  };

  readonly handleLogout = async () => {
    const context = await this.getRefreshToken();
    if (context && context.token !== null) {
      this.logoutHandler(context.token);
    }
  };

  readonly handleLogin = async (
    email: string,
    password: string
  ): Promise<AuthAuthenticate> => {
    if (email && password) {
      try {
        const response: AuthAuthenticate = await login(email, password);
        if (!response) {
          return;
        }
        if (response.error) {
          this.showNotification(`${response.error}`);
          return response;
        }
        if (response.success) {
          this.authContext.update((authContext: IAuthContext) => {
            return {
              ...authContext,
              success: response.success,
              details: response.details,
              token: response.token,
              loading: false,
            };
          });
          return response;
        }
        return response;
      } catch (err) {
        this.showNotification(`${err}`);
        return;
      }
    } else {
      return;
    }
  };

  readonly handleSignup = async (
    username: string,
    email: string,
    password: string,
    framework: string
  ): Promise<AuthSignup> => {
    if (email && password) {
      try {
        const response: AuthSignup = await signup(
          username,
          email,
          password,
          framework
        );
        if (!response) {
          return { error: `${AC.GENERAL_ERROR}` };
        }
        if (response.error) {
          this.showNotification(`${response.error}`);
          return { error: `${response.error}` };
        }
        if (response.success) {
          this.authContext.update((authContext: IAuthContext) => {
            return {
              ...authContext,
              success: response.success,
              details: response.details,
              token: response.token,
              loading: false,
            };
          });
          return {
            success: response.success,
            token: response.token,
            details: response.details,
            notebookID: response.notebookID,
            noteID: response.noteID,
          };
        }
      } catch (err) {
        this.showNotification(`${err}`);
        return { error: `${err}` };
      }
    } else {
      return { error: `${AC.GENERAL_ERROR}` };
    }
    return;
  };

  public initialState = {
    loading: true,
    details: null,
    success: null,
    token: null,
    onLogin: this.handleLogin,
    onLogout: this.handleLogout,
    onRegister: this.handleSignup,
    notebookID: null,
    noteID: null,
  };

  public authContext = signal<IAuthContext>(this.initialState);
  public authContext$ = toObservable(this.authContext);
}
