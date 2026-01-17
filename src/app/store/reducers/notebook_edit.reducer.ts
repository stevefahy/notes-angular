import { createReducer, on } from '@ngrx/store';
import { NotebookEditActions } from '../actions/notebook_edit.actions';
import { Edited, Editing } from '../models/notebook_edit.model';

// Define the initial state using that type
export const editingInitialState: Editing = { status: false };

export const editedInitialState: Edited = {
  _id: '',
  notebook_name: '',
  notebook_cover: 'default',
};

export const editingReducer = createReducer(
  editingInitialState,
  on(NotebookEditActions.editing, (_state, status) => status)
);

export const editedReducer = createReducer(
  editedInitialState,
  on(NotebookEditActions.edited, (_state, message) => message)
);
