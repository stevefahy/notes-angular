import { Component, signal, OnInit, Input, OnDestroy } from '@angular/core';
import {
  GetNotebooks,
  IAuthContext,
  Notebook,
} from '../../../../core/model/global';
import { AuthService } from '../../../../core/services/auth.service';
import { Store } from '@ngrx/store';
import { NotificationActions } from '../../../../store/actions/notification.actions';
import { addNotebook } from 'src/app/core/helpers/addNotebook';
import { AddNotebookFormComponent } from '../add-notebook-form/add-notebook-form.component';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
} from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'NotebooksList',
  templateUrl: './notebookslist.component.html',
  styleUrls: ['../../styles_shared/notebook-list-shared-css.scss'],
})
export class NotebookslistComponent implements OnInit, OnDestroy {
  @Input() notebooks: GetNotebooks;

  enableAddNotebook = signal<boolean>(false);
  userNotebooks = signal<Notebook[] | []>([]);
  isLoaded = signal<boolean>(false);

  loading: boolean | null;
  token: string | null;

  dialogRef: MatDialogRef<AddNotebookFormComponent, any>;

  constructor(
    private authService: AuthService,
    private store: Store,
    public dialog: MatDialog
  ) {}

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
        this.initUserNotebooks(this.notebooks);
      });
  }

  trackByuserNotebooks = (index: number, notebook: Notebook) => {
    return notebook ? notebook._id : undefined;
  };

  updateContext = (context: IAuthContext) => {
    this.loading = context.loading;
    this.token = context.token;
  };

  initUserNotebooks = (notebooks: GetNotebooks) => {
    if (notebooks && notebooks.success && notebooks.notebooks) {
      const noteBooksArray = notebooks.notebooks;
      this.userNotebooks.set(noteBooksArray);
      this.isLoaded.set(true);
    }
    if (notebooks && notebooks.error) {
      this.showNotification(notebooks.error);
    }
  };

  openAddNotebookFormDialog(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      method: 'create',
      addNotebook: this.addNotebookHandler,
      onCancel: this.cancelHandler,
    };
    this.dialogRef = this.dialog.open(AddNotebookFormComponent, dialogConfig);
  }

  readonly showNotification = (msg: string) => {
    this.store.dispatch(
      NotificationActions.showNotification({
        notification: { n_status: 'error', title: 'Error!', message: msg },
      })
    );
  };

  addNotebookFormHandler = () => {
    this.openAddNotebookFormDialog();
  };

  cancelHandler = () => {
    this.dialogRef.close();
  };

  addNotebookHandler = async (
    notebook_name: string,
    notebook_cover: string
  ) => {
    if (this.token) {
      try {
        const response = await addNotebook(
          this.token,
          notebook_name,
          notebook_cover
        );
        if (response.error) {
          this.showNotification(`${response.error}`);
          return;
        }
        if (response.success) {
          this.userNotebooks.update((prevNotebooks) => [
            {
              _id: response.notebook._id,
              notebook_name: response.notebook.notebook_name,
              notebook_cover: response.notebook.notebook_cover,
              updatedAt: response.notebook.updatedAt,
              createdAt: response.notebook.createdAt,
            },
            ...prevNotebooks,
          ]);
        }
      } catch (err) {
        this.showNotification(`${err}`);
        return;
      }
    }
  };
}
