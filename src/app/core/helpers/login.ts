import { errString } from '../lib/errString';
import APPLICATION_CONSTANTS from '../application-constants/application-constants';
import { AuthAuthenticate } from '../model/global';
import { environment } from './../../../environments/environment';

const AC = APPLICATION_CONSTANTS;

export const login = async (
  email: string,
  password: string
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
      throw new Error(`${response.url} Not Found.`);
    }
    if (response.status === 401) {
      throw new Error(`Unauthorized`);
    }
  } catch (err: unknown) {
    const errMessage = errString(err);
    return { error: errMessage };
  }
  let data: AuthAuthenticate;
  try {
    data = await response.json();
    if (data === null || data === undefined) {
      return { error: `${AC.LOGIN_ERROR}` };
    }
  } catch (err: unknown) {
    const errMessage = errString(err);
    return { error: errMessage };
  }
  if (data.error) {
    return { error: data.error };
  }
  return data;
};
