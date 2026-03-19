import {
  normalizeErrorToString,
  toUserFriendlyError,
} from '../lib/error-message-map';
import APPLICATION_CONSTANTS from '../application-constants/application-constants';
import { AuthAuthenticate } from '../model/global';
import { environment } from './../../../environments/environment';

const AC = APPLICATION_CONSTANTS;

export const login = async (
  email: string,
  password: string,
): Promise<AuthAuthenticate> => {
  let response;
  try {
    response = await fetch(environment.APP_API_ENDPOINT + `api/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    if (response.status === 404) {
      throw new Error(`404 Not Found: ${response.url}`);
    }
    if (response.status === 401) {
      try {
        const data = await response.json();
        if (data && data.error != null)
          return {
            error: normalizeErrorToString(data.error),
            fromServer: true,
          };
      } catch {}
      return {
        error: 'Invalid email and password combination.',
        fromServer: false,
      };
    }
    if (!response.ok) {
      try {
        const errData = await response.json();
        if (errData && errData.error != null)
          return {
            error: normalizeErrorToString(errData.error),
            fromServer: true,
          };
      } catch {}
      return {
        error:
          response.status >= 500
            ? 'The server could not be reached. Please try again.'
            : `${AC.LOGIN_ERROR}`,
        fromServer: false,
      };
    }
  } catch (err: unknown) {
    return { error: toUserFriendlyError(err), fromServer: false };
  }
  let data: AuthAuthenticate;
  try {
    data = await response.json();
    if (data === null || data === undefined) {
      return { error: `${AC.LOGIN_ERROR}`, fromServer: false };
    }
  } catch (err: unknown) {
    return { error: toUserFriendlyError(err), fromServer: false };
  }
  if ('error' in data && data.error) {
    return { error: normalizeErrorToString(data.error), fromServer: true };
  }
  return data;
};
