import { createSelector, createFeatureSelector } from '@ngrx/store';
import { Snack } from '../models/snack.model';

export const selectSnack = createFeatureSelector<Snack>('snack');
export const selectSnackCollection = createSelector(selectSnack, (snack) => {
  return snack;
});
