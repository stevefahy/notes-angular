import { createReducer, on } from '@ngrx/store';
import { Snack } from '../models/snack.model';
import { SnackActions } from '../actions/snack.actions';

// Define the initial state using that type
export const initialState: Snack = {
  n_status: null,
  message: null,
};

export const snackReducer = createReducer(
  initialState,
  on(SnackActions.showSnack, (_state, snack) => snack.snack)
);
