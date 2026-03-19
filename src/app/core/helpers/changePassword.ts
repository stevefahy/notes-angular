import {
  normalizeErrorToString,
  toUserFriendlyError,
} from '../lib/error-message-map';
import APPLICATION_CONSTANTS from '../application-constants/application-constants';
import { ChangePassword } from '../model/global';
import { environment } from 'src/environments/environment';

const AC = APPLICATION_CONSTANTS;

export const changePassword = async (
  token: string,
  passwordData: {},
): Promise<ChangePassword> => {
  let response;
  try {
    response = await fetch(
      environment.APP_API_ENDPOINT + `api/auth/change-password`,
      {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(passwordData),
      },
    );
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
      return { error: 'Unauthorized', fromServer: false };
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
            : `${AC.CHANGE_PASS_ERROR}`,
        fromServer: false,
      };
    }
  } catch (err: unknown) {
    return { error: toUserFriendlyError(err), fromServer: false };
  }
  let data: ChangePassword;
  try {
    data = await response.json();
    if (data === null) {
      return { error: `${AC.CHANGE_PASS_ERROR}`, fromServer: false };
    }
  } catch (err: unknown) {
    return { error: toUserFriendlyError(err), fromServer: false };
  }
  if ('error' in data && data.error) {
    return { error: normalizeErrorToString(data.error), fromServer: true };
  }
  return data;
};
