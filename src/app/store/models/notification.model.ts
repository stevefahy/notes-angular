import { NotificationStatus } from 'src/app/core/model/global';

export interface Notification {
  n_status: NotificationStatus | null;
  title: string | null;
  message: string | null;
}
