import { Component, Input } from '@angular/core';
import { AlertInterface, ErrorSeverity } from 'src/app/core/model/global';

@Component({
  selector: 'ErrorAlert',
  templateUrl: './error-alert.component.html',
  styleUrls: ['./error-alert.component.scss'],
})
export class ErrorAlertComponent implements AlertInterface {
  @Input() error_state: boolean;
  @Input() error_severity?: ErrorSeverity | undefined;
  @Input() message?: string | undefined;
}
