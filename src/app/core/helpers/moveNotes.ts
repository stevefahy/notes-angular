import { errString } from '../lib/errString';
import APPLICATION_CONSTANTS from '../application-constants/application-constants';
import { MoveNotes } from '../model/global';
import { environment } from 'src/environments/environment';

const AC = APPLICATION_CONSTANTS;

export const moveNotes = async (
  token: string,
  notebookId: string,
  notesSelected: string[],
  latestUpdatedDate: string | undefined
): Promise<MoveNotes> => {
  let response;
  const move = {
    notes: notesSelected,
    notebookID: notebookId,
    latestUpdatedNote: latestUpdatedDate,
  };
  try {
    response = await fetch(
      environment.APP_API_ENDPOINT + `api/data/move-notes`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(move),
      }
    );
    if (response.status === 404) {
      throw new Error(`${response.url} Not Found.`);
    }
  } catch (err: unknown) {
    const errMessage = errString(err);
    return { error: errMessage };
  }
  let data: MoveNotes;
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
