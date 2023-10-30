import { errString } from '../lib/errString';
import APPLICATION_CONSTANTS from '../application-constants/application-constants';
import { GetNotebook } from '../model/global';
import { environment } from 'src/environments/environment';

const AC = APPLICATION_CONSTANTS;

export const getNotebook = async (
  token: string,
  notebookId: string
): Promise<GetNotebook> => {
  let response;
  try {
    response = await fetch(
      environment.APP_API_ENDPOINT + `api/data/notebook/${notebookId}`,
      {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 404) {
      throw new Error(`${response.url} Not Found.`);
    }
  } catch (err: unknown) {
    const errMessage = errString(err);
    return { error: errMessage };
  }
  let data: GetNotebook;
  try {
    data = await response.json();
    if (data === null) {
      return { error: `${AC.NOTEBOOK_ERROR}` };
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
