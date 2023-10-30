import { createReducer, on } from '@ngrx/store';
import { Notification } from '../models/notification.model';
import { NotificationActions } from '../actions/notification.actions';

// Define the initial state using that type
export const initialState: Notification = {
  n_status: null,
  title: null,
  message: null,
};

export const notificationReducer = createReducer(
  initialState,
  on(
    NotificationActions.showNotification,
    (_state, notification) => notification.notification
  )
);
