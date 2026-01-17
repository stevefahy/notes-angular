import { createActionGroup, props } from '@ngrx/store';
import { NotebookCoverType } from 'src/app/core/model/global';

export const NotebookEditActions = createActionGroup({
  source: 'Notebook Edit',
  events: {
    Editing: props<{ status: boolean }>(),
    Edited: props<{
      _id: string;
      notebook_name: string;
      notebook_cover: NotebookCoverType;
    }>(),
  },
});
