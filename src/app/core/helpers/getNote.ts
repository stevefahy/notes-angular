import {
  normalizeErrorToString,
  toUserFriendlyError,
} from '../lib/error-message-map';
import APPLICATION_CONSTANTS from '../application-constants/application-constants';
import { GetNote } from '../model/global';
import { environment } from 'src/environments/environment';

const AC = APPLICATION_CONSTANTS;

export const getNote = async (
  token: string,
  notebookId: string,
  noteId: string,
): Promise<GetNote> => {
  let response;
  try {
    response = await fetch(
      environment.APP_API_ENDPOINT +
        `api/data/notebook/${notebookId}/${noteId}`,
      {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (response.status === 404) {
      throw new Error(`404 Not Found: ${response.url}`);
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
            : `${AC.NOTE_ERROR}`,
        fromServer: false,
      };
    }
  } catch (err: unknown) {
    return { error: toUserFriendlyError(err), fromServer: false };
  }
  let data: GetNote;
  try {
    data = await response.json();
    if (data === null) {
      return { error: `${AC.NOTE_ERROR}`, fromServer: false };
    }
  } catch (err: unknown) {
    return { error: toUserFriendlyError(err), fromServer: false };
  }
  if ('error' in data && data.error) {
    return { error: normalizeErrorToString(data.error), fromServer: true };
  }
  return data;
};
