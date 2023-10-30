import { errString } from '../lib/errString';
import APPLICATION_CONSTANTS from '../application-constants/application-constants';
import { EditNotebook } from '../model/global';
import { environment } from 'src/environments/environment';

const AC = APPLICATION_CONSTANTS;

export const editNotebook = async (
  token: string,
  notebookID: string,
  notebookName: string,
  notebookCover: string,
  notebookUpdated: string
): Promise<EditNotebook> => {
  let response;
  const edit = {
    notebookID,
    notebookName,
    notebookCover,
    notebookUpdated,
  };
  try {
    response = await fetch(
      environment.APP_API_ENDPOINT + `api/data/edit-notebook`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(edit),
      }
    );
    if (response.status === 404) {
      throw new Error(`${response.url} Not Found.`);
    }
  } catch (err: unknown) {
    const errMessage = errString(err);
    return { error: errMessage };
  }
  let data: EditNotebook;
  try {
    data = await response.json();
    if (data === null) {
      return { error: `${AC.NOTES_ERROR}` };
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
