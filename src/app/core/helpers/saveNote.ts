import { errString } from '../lib/errString';
import APPLICATION_CONSTANTS from '../application-constants/application-constants';
import { SaveNote } from '../model/global';
import { environment } from 'src/environments/environment';

const AC = APPLICATION_CONSTANTS;

export const saveNote = async (
  token: string,
  notebookId: string,
  noteId: string,
  note: string
): Promise<SaveNote> => {
  let response;
  const note_obj = {
    notebookID: notebookId,
    noteID: noteId,
    note: note,
  };
  try {
    response = await fetch(
      environment.APP_API_ENDPOINT + `api/data/save-note`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(note_obj),
      }
    );
    if (response.status === 404) {
      throw new Error(`${response.url} Not Found.`);
    }
  } catch (err: unknown) {
    const errMessage = errString(err);
    return { error: errMessage };
  }
  let data: SaveNote;
  try {
    data = await response.json();
    if (data === null) {
      return { error: `${AC.NOTE_SAVE_ERROR}` };
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
