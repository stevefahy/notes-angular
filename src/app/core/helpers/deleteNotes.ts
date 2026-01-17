import { errString } from '../lib/errString';
import APPLICATION_CONSTANTS from '../application-constants/application-constants';
import { DeleteNotes } from '../model/global';
import { environment } from 'src/environments/environment';

const AC = APPLICATION_CONSTANTS;

export const deleteNotes = async (
  token: string,
  notes_selected: string[]
): Promise<DeleteNotes> => {
  let response;
  const del = { note_ids: notes_selected };
  try {
    response = await fetch(
      environment.APP_API_ENDPOINT + `api/data/delete-notes`,
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(del),
      }
    );
    if (response.status === 404) {
      throw new Error(`${response.url} Not Found.`);
    }
  } catch (err: unknown) {
    const errMessage = errString(err);
    return { error: errMessage };
  }
  let data: DeleteNotes;
  try {
    data = await response.json();
    if (data === null) {
      return { error: `${AC.NOTES_DELETE_ERROR}` };
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
