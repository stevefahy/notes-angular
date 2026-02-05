import {
  Component,
  signal,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  IAuthContext,
  Notebook,
  Note,
  SelectedNote,
} from '../../../core/model/global';
import { AuthService } from '../../../core/services/auth.service';
import { Store } from '@ngrx/store';
import { NotificationActions } from '../../../store/actions/notification.actions';
import { NotebookEditActions } from '../../../store/actions/notebook_edit.actions';
import { selectEditing } from 'src/app/store/selectors/notebook_edit.selector';
import { ActivatedRoute, Router } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { getNotes } from '../../../core/helpers/getNotes';
import { getNotebook } from '../../../core/helpers/getNotebook';
import { getNotebooks } from '../../../core/helpers/getNotebooks';
import { deleteNotes } from '../../../core/helpers/deleteNotes';
import { editNotebookDate } from '../../../core/helpers/editNotebookDate';
import { deleteNotebook } from '../../../core/helpers/deleteNotebook';
import { editNotebook } from '../../../core/helpers/editNotebook';
import { moveNotes } from '../../../core/helpers/moveNotes';
import { SelectNotebookFormComponent } from '../components/select-notebook-form/select-notebook-form.component';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
} from '@angular/material/dialog';
import { AddNotebookFormComponent } from '../../notebooks/components/add-notebook-form/add-notebook-form.component';
import { Subscription, Subject, takeUntil } from 'rxjs';
import { LoadingScreenComponent } from '../../../core/components/ui/loading-screen/loading-screen.component';
import { FooterComponent } from '../../../core/components/footer/footer.component';
import { NoteListComponent } from '../components/note-list/note-list.component';

@Component({
    selector: 'Notebook',
    standalone: true,
    imports: [
      CommonModule,
      MatButtonModule,
      MatIconModule,
      LoadingScreenComponent,
      FooterComponent,
      NoteListComponent,
    ],
    templateUrl: './notebook.component.html',
    styleUrls: ['./notebook.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotebookComponent implements OnInit, OnDestroy {
  private activatedRoute = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private store = inject(Store);
  private router = inject(Router);
  public dialog = inject(MatDialog);

  dialogRefSelectNotebook: MatDialogRef<SelectNotebookFormComponent, any>;
  dialogRefEditNotebook: MatDialogRef<AddNotebookFormComponent, any>;

  notebookId: string;
  loading: boolean | null;
  token: string | null;

  notes = signal<Note[] | null>(null);

  notesLoadedDelay = signal(false);
  notesLoadedDelay$ = toObservable(this.notesLoadedDelay);

  notesLoaded = signal(false);
  notesLoaded$ = toObservable(this.notesLoaded);

  notebookLoaded = signal(false);
  notebookLoaded$ = toObservable(this.notebookLoaded);

  notebooksLoaded = signal<boolean>(false);
  notebooksLoaded$ = toObservable(this.notebooksLoaded);

  notebook = signal<Notebook | null>(null);
  userNotebooks = signal<Notebook[] | null>(null);
  isSelected = signal<SelectedNote | null>(null);
  moveNote = signal(false);
  enableEditNotebook = signal(false);
  editNotes = signal(false);
  clearEditNotes = signal(false);

  loadingTimer: NodeJS.Timeout;

  onDestroy$: Subject<void> = new Subject();

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  ngOnInit(): void {
    // Effects
    this.activatedRoute.params
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((data: any) => {
        this.notebookId = data.notebookId;
      });

    this.authService.authContext$
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((res: IAuthContext) => {
        this.updateContext(res);
      });

    this.store.select(selectEditing)
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((editing) => {
        if (editing.status === true) {
          this.editNotebookBtnHandler();
        }
      });

    this.notesLoadedDelay$
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((notesLoadedDelay) => {
        if (notesLoadedDelay) {
          this.loadingTimer = setTimeout(() => {
            this.notesLoaded.set(true);
            clearTimeout(this.loadingTimer);
          }, 100);
        }
      });

    this.notesLoaded$
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((notesLoaded) => {
        if (!notesLoaded) {
          this.loadNotes();
        }
      });

    this.notebookLoaded$
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((notebookLoaded) => {
        if (!notebookLoaded) {
          this.loadNotebook();
        }
      });

    this.notebooksLoaded$
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((notebooksLoaded) => {
        if (!notebooksLoaded) {
          this.loadNotebooks();
        }
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

  sortNotes = (notes: Note[]) => {
    // Add an update date for sorting if one does not exist
    notes.forEach((x) => {
      if (x.updatedAt === 'No date' || undefined) {
        x.updatedAt = 'December 17, 1995 03:24:00';
      }
    });
    notes
      .sort((a, b) => {
        if (a.updatedAt !== undefined && b.updatedAt !== undefined) {
          return new Date(a.updatedAt) > new Date(b.updatedAt) ? 1 : -1;
        } else {
          return a.updatedAt !== undefined ? 1 : -1;
        }
      })
      .reverse();
    return notes;
  };

  loadNotes = async () => {
    if (!this.notesLoaded() && this.token && this.notebookId) {
      this.notesLoadedDelay.set(false);
      this.notesLoaded.set(false);
      try {
        const response = await getNotes(this.token, this.notebookId);
        this.notebookLoaded.set(true);
        if (response.error) {
          this.showNotification(`${response.error}`);
          return;
        }
        if (response.success) {
          const notes_sorted = this.sortNotes(response.notes);
          this.notes.set(notes_sorted);
          this.notesLoadedDelay.set(true);
        }
      } catch (err) {
        this.showNotification(`${err}`);
        this.notesLoadedDelay.set(true);
        return;
      }
    }
  };

  loadNotebook = async () => {
    if (!this.notebookLoaded() && this.token && this.notebookId) {
      this.notebookLoaded.set(false);
      try {
        const response = await getNotebook(this.token, this.notebookId);
        this.notebookLoaded.set(true);
        if (response.error) {
          this.showNotification(`${response.error}`);
          return;
        }
        if (response.success) {
          this.notebook.set(response.notebook);
          this.store.dispatch(NotebookEditActions.edited(response.notebook));
        }
      } catch (err) {
        this.showNotification(`${err}`);
        this.notebookLoaded.set(true);
        return;
      }
    }
  };

  loadNotebooks = async () => {
    if (!this.notebooksLoaded() && this.token) {
      this.notebooksLoaded.set(false);
      try {
        const response = await getNotebooks(this.token);
        this.notebooksLoaded.set(true);
        if (response.error) {
          this.showNotification(`${response.error}`);
          return;
        }
        if (response.success) {
          this.userNotebooks.set(response.notebooks);
        }
      } catch (err) {
        this.showNotification(`${err}`);
        this.notebooksLoaded.set(true);
        return;
      }
    }
  };

  updateSelected = (selected: SelectedNote) => {
    this.isSelected.update((prev) => selected);
  };

  openSelectNotebookDialog(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      notebooks: this.userNotebooks(),
      onCancel: this.cancelHandler,
      moveNotes: this.moveNoteHandler,
      notebookId: this.notebookId,
    };
    this.dialogRefSelectNotebook = this.dialog.open(
      SelectNotebookFormComponent,
      dialogConfig
    );
  }

  openAddNotebookFormDialog(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      notebook: this.notebook(),
      method: 'edit',
      editNotebook: this.editNotebookHandler,
      onCancel: this.cancelEditHandler,
    };
    this.dialogRefEditNotebook = this.dialog.open(
      AddNotebookFormComponent,
      dialogConfig
    );
  }

  moveNoteFormHandler = () => {
    this.moveNote.update((prevState) => true);
    this.openSelectNotebookDialog();
  };

  cancelHandler = () => {
    this.moveNote.update((prevState) => false);
    this.dialogRefSelectNotebook.close();
  };
  cancelEditHandler = () => {
    this.enableEditNotebook.update((prevState) => false);
    this.store.dispatch(NotebookEditActions.editing({ status: false }));
    this.dialogRefEditNotebook.close();
  };

  editNotebookBtnHandler = () => {
    this.enableEditNotebook.update((prevState) => true);
    this.openAddNotebookFormDialog();
  };

  addNoteFormHandler = () => {
    this.router.navigate([`/notebook/${this.notebookId}/create-note`]);
  };

  editNoteFormHandler = () => {
    this.editNotes.set(true);
    this.clearEditNotes.set(false);
  };

  resetNotesSelected = () => {
    this.isSelected.update((state) => {
      let newarray: SelectedNote = { selected: [] };
      return { ...state, selected: newarray.selected };
    });
  };

  cancelEditNoteFormHandler = () => {
    this.editNotes.set(false);
    this.clearEditNotes.set(true);
    this.resetNotesSelected();
  };

  updateNotebookDate = (notebookId: string, notebookLatesDate: string) => {
    this.editNotebookDateHandler(notebookId, notebookLatesDate);
  };

  deleteNoteHandler = async () => {
    let notesSelected: string[];
    if (
      this.token &&
      this.isSelected() !== null &&
      this.isSelected() !== undefined &&
      this.isSelected()?.selected !== null
    ) {
      notesSelected = this.isSelected()!.selected;
      try {
        const response = await deleteNotes(this.token, notesSelected);
        this.notebookLoaded.set(true);
        if (response.error) {
          this.showNotification(`${response.error}`);
          return;
        }
        if (response.success) {
          let updatedNotesLatestDate: string | undefined;
          const NotesLatestDate: string | undefined =
            this.notes()![0].updatedAt;
          // update the notes array to delete the notes from state
          this.notes.update((prev) => {
            let oldarray: Note[];
            let newarray: Note[] = [];
            if (prev) {
              oldarray = [...prev];
              let i = oldarray.length;
              while (i--) {
                var obj = oldarray[i];
                if (notesSelected.indexOf(obj._id) === -1) {
                  // Not Item to be removed found
                  newarray.push(obj);
                }
              }
              const updated = newarray.reverse();
              if (updated.length > 0) {
                updatedNotesLatestDate = updated[0].updatedAt;
              }
              return updated;
            } else {
              return null;
            }
          });
          if (
            updatedNotesLatestDate !== undefined &&
            this.notebookId !== undefined &&
            NotesLatestDate
          ) {
            if (
              new Date(updatedNotesLatestDate).getTime() !==
              new Date(NotesLatestDate).getTime()
            ) {
              let nID = String(this.notebookId);
              this.updateNotebookDate(nID, updatedNotesLatestDate);
            }
          }
          this.cancelEditNoteFormHandler();
        }
      } catch (err) {
        this.showNotification(`${err}`);
        return;
      }
    }
  };

  editNotebookDateHandler = async (
    notebookID: string,
    notebookUpdated: string
  ) => {
    if (this.token && notebookID && notebookUpdated) {
      try {
        const response = await editNotebookDate(
          this.token,
          notebookID,
          notebookUpdated
        );
        if (response.error) {
          this.showNotification(`${response.error}`);
          return;
        }
        if (response.success) {
        }
      } catch (err) {
        this.showNotification(`${err}`);
        return;
      }
    }
  };

  deleteNotebookHandler = async () => {
    const notebook_id = this.notebook()!._id;
    if (this.token && notebook_id && notebook_id.length > 0) {
      try {
        const response = await deleteNotebook(this.token, notebook_id);
        if (response.error) {
          this.showNotification(`${response.error}`);
          return;
        }
        if (response.success) {
          this.router.navigate([`/notebooks`]);
        }
      } catch (err) {
        this.showNotification(`${err}`);
        return;
      }
    }
  };

  editNotebookHandler = async (
    notebookID: string,
    notebookName: string,
    notebookCover: string,
    notebookUpdated: string
  ) => {
    if (
      this.token &&
      notebookID &&
      notebookName &&
      notebookCover &&
      notebookUpdated
    ) {
      try {
        const response = await editNotebook(
          this.token,
          notebookID,
          notebookName,
          notebookCover,
          notebookUpdated
        );
        if (response.error) {
          this.showNotification(`${response.error}`);
          return;
        }
        if (response.success) {
          this.notebook.update((prev) => response.notebook_edited);
          this.store.dispatch(NotebookEditActions.editing({ status: false }));
          this.store.dispatch(
            NotebookEditActions.edited(response.notebook_edited)
          );
          this.enableEditNotebook.update((prev) => false);
        }
      } catch (err) {
        this.showNotification(`${err}`);
        return;
      }
    }
  };

  getLatestUpdated = (selected: string[]) => {
    let found_notes = [];
    for (const i in selected) {
      if (this.notes() !== null) {
        var result = this.notes()!.filter((obj) => {
          return obj._id === selected[i];
        });
        found_notes.push(result[0]);
      }
    }
    let selected_notes = this.sortNotes(found_notes);
    return selected_notes[0].updatedAt;
  };

  moveNoteHandler = async (notebookID: string) => {
    let notesSelected: string[];
    if (
      this.token &&
      notebookID &&
      this.isSelected() !== null &&
      this.isSelected() !== undefined &&
      this.isSelected()?.selected !== null
    ) {
      notesSelected = this.isSelected()!.selected;
      const latestUpdatedDate = this.getLatestUpdated(notesSelected);
      try {
        const response = await moveNotes(
          this.token,
          notebookID,
          notesSelected,
          latestUpdatedDate
        );
        if (response.error) {
          this.showNotification(`${response.error}`);
          return;
        }
        if (response.success) {
          let updatedNotesLatestDate: string | undefined;
          // update the notes array to delete the notes from state
          this.notes.update((prev) => {
            let oldarray: Note[];
            let newarray: Note[] = [];
            if (prev) {
              oldarray = [...prev];
              let i = oldarray.length;
              while (i--) {
                var obj = oldarray[i];
                if (notesSelected.indexOf(obj._id) === -1) {
                  // Not Item to be removed found
                  newarray.push(obj);
                }
              }
              const updated = newarray.reverse();
              if (updated.length > 0) {
                updatedNotesLatestDate = updated[0].updatedAt;
              }
              return updated;
            } else {
              return null;
            }
          });

          if (
            updatedNotesLatestDate !== undefined &&
            this.notebookId !== undefined
          ) {
            let nID = String(this.notebookId);
            this.updateNotebookDate(nID, updatedNotesLatestDate);
          }
          // Close the dialogue
          this.moveNote.update((prev) => false);
          // Reset
          this.cancelEditNoteFormHandler();
        }
      } catch (err) {
        this.showNotification(`${err}`);
        return;
      }
    }
  };
}
