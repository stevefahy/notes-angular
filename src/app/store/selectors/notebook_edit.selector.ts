import { createSelector, createFeatureSelector } from '@ngrx/store';
import { Edited, Editing } from '../models/notebook_edit.model';

export const selectEditedFeature = createFeatureSelector<Edited>('edited');
export const selectEdited = createSelector(selectEditedFeature, (edited) => {
  return edited;
});

const selectEditingFeature = createFeatureSelector<Editing>('editing');
export const selectEditing = createSelector(selectEditingFeature, (state) => {
  return state;
});
