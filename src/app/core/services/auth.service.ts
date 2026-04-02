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
import { SnackService } from './snack.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import APPLICATION_CONSTANTS from 'src/app/core/application-constants/application-constants';
import {
  normalizeErrorToString,
  toUserFriendlyError,
} from '../lib/error-message-map';
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
    private router: Router,
    private snack: SnackService,
  ) {
    this.AutoRefreshToken();
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          setTimeout(() => this.verifyRefreshTokenWithRetry(), 500);
        }
      });
    }
  }

  interval: NodeJS.Timeout;
  AutoRefreshToken = () => {
    this.interval = setInterval(() => {
      if (document.visibilityState === 'hidden') return;
      if (!this.authContext().success) {
        this.autoLogout();
      } else {
        void this.verifyRefreshTokenWithRetry();
      }
    }, AC.REFRESH_TOKEN_INTERVAL);
  };

  getServer() {
    return this.http.get('http://localhost:5000');
  }

  readonly showErrorSnack = (err: unknown, fromServer = false) => {
    this.snack.showErrorSnack(err, fromServer);
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
          this.showErrorSnack(response.error, response.fromServer === true);
          return;
        }
        if (response.success) {
          this.resetAuthContext();
          let dateNow: number = Date.now();
          window.localStorage.setItem('logout', '' + dateNow);
          this.router.navigate([`${AC.LOGIN_PAGE}`]);
        }
      } catch (err) {
        this.showErrorSnack(err, false);
        return;
      }
    }
  };

  autoLogout = () => {
    this.router.navigate([`${AC.LOGIN_PAGE}`]);
    clearInterval(this.interval);
  };

  public authGuardVerify = async () => {
    const t = this.authContext().token;
    if (!t || this.jwtHelper.isTokenExpired(t)) {
      await this.verifyRefreshTokenWithRetry();
    }
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

  private refreshInProgress: Promise<AuthAuthenticate | undefined> | null =
    null;

  readonly getRefreshToken = async () => {
    if (this.refreshInProgress) return this.refreshInProgress;
    const promise = (async () => {
      try {
        const response = await refreshtoken();
        if (!response) return;
        if (response.error) return;
        if (response.success) return response;
      } catch {
        return;
      }
      return;
    })();
    this.refreshInProgress = promise;
    try {
      return await promise;
    } finally {
      this.refreshInProgress = null;
    }
  };

  readonly handleLogout = async () => {
    const context = await this.getRefreshToken();
    if (context && typeof context.token === 'string') {
      this.logoutHandler(context.token);
    }
  };

  readonly handleLogin = async (
    email: string,
    password: string,
  ): Promise<AuthAuthenticate> => {
    if (email && password) {
      try {
        const response: AuthAuthenticate = await login(email, password);
        if (!response) {
          return;
        }
        if (response.error) {
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
        return { error: toUserFriendlyError(err), fromServer: false };
      }
    } else {
      return;
    }
  };

  readonly handleSignup = async (
    username: string,
    email: string,
    password: string,
    framework: string,
  ): Promise<AuthSignup> => {
    if (email && password) {
      try {
        const response: AuthSignup = await signup(
          username,
          email,
          password,
          framework,
        );
        if (!response) {
          return { error: `${AC.GENERAL_ERROR}` };
        }
        if (response.error) {
          return {
            error: normalizeErrorToString(response.error),
            fromServer: response.fromServer,
          };
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
        return { error: toUserFriendlyError(err), fromServer: false };
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
