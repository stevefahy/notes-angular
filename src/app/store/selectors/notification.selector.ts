import { createSelector, createFeatureSelector } from '@ngrx/store';
import { Notification } from '../models/notification.model';

export const selectNotification =
  createFeatureSelector<Notification>('notification');

export const selectNotificationCollection = createSelector(
  selectNotification,
  (notification) => {
    return notification;
  }
);
