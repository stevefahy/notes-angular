import { Component, Input } from '@angular/core';
import { NotificationInterface } from 'src/app/core/model/global';

@Component({
  selector: 'NotificationView',
  templateUrl: './notification-view.component.html',
  styleUrls: ['./notification-view.component.scss'],
})
export class NotificationViewComponent implements NotificationInterface {
  @Input() title: string;
  @Input() message: string;
  @Input() n_status: any;

  errorClass = false;

  constructor() {
    if (this.n_status === 'error') {
      this.errorClass = false;
    }
    if (this.n_status === 'success') {
      this.errorClass = true;
    }
  }
  readonly errorClasses = this.errorClass;
}
