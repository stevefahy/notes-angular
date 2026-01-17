import { createActionGroup, props } from '@ngrx/store';
import { Notification } from '../models/notification.model';

export const NotificationActions = createActionGroup({
  source: 'Notification',
  events: {
    ShowNotification: props<{
      notification: Notification;
    }>(),
  },
});
