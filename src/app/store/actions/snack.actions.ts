import { createActionGroup, props } from '@ngrx/store';
import { Snack } from '../models/snack.model';

export const SnackActions = createActionGroup({
  source: 'Snack',
  events: {
    ShowSnack: props<{
      snack: Snack;
    }>(),
  },
});
