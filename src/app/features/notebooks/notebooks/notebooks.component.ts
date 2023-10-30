import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { GetNotebooks, IAuthContext } from '../../../core/model/global';
import { AuthService } from '../../../core/services/auth.service';
import { Store } from '@ngrx/store';
import { NotificationActions } from '../../../store/actions/notification.actions';
import { getNotebooks } from '../../../core/helpers/getNotebooks';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'Notebooks',
  templateUrl: './notebooks.component.html',
  styleUrls: ['./notebooks.component.scss'],
})
export class NotebooksComponent implements OnInit, OnDestroy {
  notebooksLoaded = signal<boolean>(false);
  userNotebooks = signal<GetNotebooks>({ success: false, notebooks: [] });

  loading: boolean | null;
  token: string | null;

  constructor(private authService: AuthService, private store: Store) {}

  onDestroy$: Subject<void> = new Subject();

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  ngOnInit(): void {
    this.authService.authContext$
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((res: IAuthContext) => {
        this.updateContext(res);
        this.loadNotebooks();
      });
  }

  updateContext = (context: IAuthContext) => {
    this.loading = context.loading;
    this.token = context.token;
  };

  readonly showNotification = (msg: string) => {
    this.store.dispatch(
      NotificationActions.showNotification({
        notification: { n_status: 'error', title: 'Error!', message: msg },
      })
    );
  };

  // Get the Notebooks
  loadNotebooks = async () => {
    if (!this.notebooksLoaded() && this.token) {
      try {
        const response = await getNotebooks(this.token);
        if (response.error) {
          this.showNotification(`${response.error}`);
          return;
        }
        if (response.success) {
          this.userNotebooks.set(response);
          this.filterNotebooks();
        }
      } catch (err) {
        this.showNotification(`${err}`);
        return;
      }
    }
  };

  // Filter Notebooks
  filterNotebooks = async () => {
    const notebooks_found = this.userNotebooks().notebooks;
    const error_found = this.userNotebooks().error;
    if (notebooks_found && notebooks_found.length > 0) {
      // Set an old date for those notes without any updatedAt
      notebooks_found.map((x) => {
        if (x.updatedAt === 'No date' || undefined) {
          x.updatedAt = 'December 17, 1995 03:24:00';
        }
        return x;
      });
      // Sort the notebooks by updatedAt
      notebooks_found
        .sort((a, b) => {
          if (a.updatedAt !== undefined && b.updatedAt !== undefined) {
            return new Date(a.updatedAt) > new Date(b.updatedAt) ? 1 : -1;
          } else {
            return a.updatedAt !== undefined ? 1 : -1;
          }
        })
        .reverse();
      this.userNotebooks.set({ success: true, notebooks: notebooks_found });
      this.notebooksLoaded.set(true);
    }
    if (error_found) {
      this.showNotification(error_found);
    }
  };
}
