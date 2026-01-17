import { Component, signal, OnDestroy, OnInit } from '@angular/core';
import {
  NotificationStatus,
  NotificationInterface,
} from 'src/app/core/model/global';
import { Store } from '@ngrx/store';
import { selectNotification } from 'src/app/store/selectors/notification.selector';
import { selectSnack } from 'src/app/store/selectors/snack.selector';
import { Snack } from 'src/app/store/models/snack.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarViewComponent } from '../ui/snackbar-view/snackbar-view.component';

// Set the CSS variable --jsvh (Javascript Vertical Height)
// This var is used because on mobile browsers the css: calc(100vh)
// includes the browser address bar area.
// In the /styles/global.css
// height: calc(100vh - var(--header-footer-height));
// becomes:
// height: calc(var(--jsvh) - var(--header-footer-height));
const setScreenHeight = () => {
  let jsvh = window && window.innerHeight;
  let header_height =
    document &&
    document.getElementById('header_height')?.getBoundingClientRect().height;
  document && document.documentElement.style.setProperty('--jsvh', `${jsvh}px`);
  document &&
    document.documentElement.style.setProperty(
      '--jsheader-height',
      `${header_height}`
    );
};

@Component({
  selector: 'Layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent implements OnDestroy, OnInit {
  constructor(private store: Store, private _snackBar: MatSnackBar) {}

  ngOnDestroy(): void {
    this.notification$.unsubscribe();
    this.snack$.unsubscribe();
  }

  ngOnInit(): void {
    // Set the initial screenHeight
    setTimeout(() => {
      setScreenHeight();
    }, 0);

    // Set the screenHeight on window resize (includes orientation change)
    window &&
      window.addEventListener('resize', () => {
        setScreenHeight();
      });
  }

  status = signal<NotificationStatus>(null);
  notification = signal<NotificationInterface>({});
  snackbar = signal<Snack | null>(null);

  timer_notification: NodeJS.Timeout;

  notification$ = this.store.select(selectNotification).subscribe((res) => {
    this.status.set(res.n_status);
    if (this.status() !== null) {
      this.notification.set(res);
      this.timer_notification = setTimeout(() => {
        this.status.set(null);
        clearTimeout(this.timer_notification);
      }, 5000);
    }
  });

  snack$ = this.store.select(selectSnack).subscribe((res) => {
    this.snackbar.set(res);
    if (res.n_status !== null && res.message !== null) {
      this._snackBar.openFromComponent(SnackbarViewComponent, {
        duration: 2000,
        panelClass: ['snackbar'],
        data: {
          message: res.message,
          icon: 'check_circle',
        },
      });
    }
  });
}
