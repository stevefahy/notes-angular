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
import { SnackService } from '../../../core/services/snack.service';
import { NotebookEditActions } from '../../../store/actions/notebook_edit.actions';
import { selectEditing } from 'src/app/store/selectors/notebook_edit.selector';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
import { AddNotebookFormComponent } from '../../notebooks/components/add-notebook-form/add-notebook-form.component';
import { Subscription, Subject, takeUntil } from 'rxjs';
import { LoadingScreenComponent } from '../../../core/components/ui/loading-screen/loading-screen.component';
import { FooterComponent } from '../../../core/components/footer/footer.component';
import { NoteListComponent } from '../components/note-list/note-list.component';
import { EditNotesService } from '../../../core/services/edit-notes.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'Notebook',
  standalone: true,
  animations: [
    trigger('sheetSlide', [
      transition(':enter', [
        style({ transform: 'translateY(100%)' }),
        animate(
          '380ms cubic-bezier(0.33, 1, 0.68, 1)',
          style({ transform: 'translateY(0)' }),
        ),
      ]),
      transition(':leave', [
        animate(
          '300ms cubic-bezier(0.33, 1, 0.68, 1)',
          style({ transform: 'translateY(100%)' }),
        ),
      ]),
    ]),
  ],
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    LoadingScreenComponent,
    FooterComponent,
    NoteListComponent,
    SelectNotebookFormComponent,
    AddNotebookFormComponent,
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
  private editNotesService = inject(EditNotesService);
  private snack = inject(SnackService);

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
  loadError = signal<string | null>(null);
  userNotebooks = signal<Notebook[] | null>(null);
  isSelected = signal<SelectedNote | null>(null);
  moveNote = signal(false);
  enableEditNotebook = signal(false);
  showEditNotebookForm = signal(false);
  isClosingEditNotebook = signal(false);
  editNotes = signal(false);
  clearEditNotes = signal(false);

  loadingTimer: NodeJS.Timeout;

  onDestroy$: Subject<void> = new Subject();

  ngOnDestroy(): void {
    this.editNotesService.clear();
    this.store.dispatch(NotebookEditActions.editing({ status: false }));
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

    this.store
      .select(selectEditing)
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

  readonly showErrorSnack = (err: unknown, fromServer = false) => {
    this.snack.showErrorSnack(err, fromServer);
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
    if (
      !this.notesLoaded() &&
      !this.loadError() &&
      this.token &&
      this.notebookId
    ) {
      this.notesLoadedDelay.set(false);
      this.notesLoaded.set(false);
      try {
        const response = await getNotes(this.token, this.notebookId);
        this.notebookLoaded.set(true);
        if (response.error) {
          this.loadError.set(response.error);
          this.showErrorSnack(response.error, response.fromServer === true);
          this.notesLoaded.set(true);
          this.notesLoadedDelay.set(true);
          return;
        }
        if (response.success) {
          const notes_sorted = this.sortNotes(response.notes);
          this.notes.set(notes_sorted);
          this.notesLoadedDelay.set(true);
        }
      } catch (err) {
        this.loadError.set(
          err instanceof Error ? err.message : String(err ?? ''),
        );
        this.showErrorSnack(err, false);
        this.notebookLoaded.set(true);
        this.notesLoaded.set(true);
        this.notesLoadedDelay.set(true);
        return;
      }
    }
  };

  loadNotebook = async () => {
    if (
      !this.notebookLoaded() &&
      !this.loadError() &&
      this.token &&
      this.notebookId
    ) {
      this.notebookLoaded.set(false);
      try {
        const response = await getNotebook(this.token, this.notebookId);
        this.notebookLoaded.set(true);
        if (response.error) {
          this.loadError.set(response.error);
          this.showErrorSnack(response.error, response.fromServer === true);
          this.notesLoaded.set(true);
          return;
        }
        if (response.success) {
          this.notebook.set(response.notebook);
          this.store.dispatch(NotebookEditActions.edited(response.notebook));
        }
      } catch (err) {
        this.loadError.set(
          err instanceof Error ? err.message : String(err ?? ''),
        );
        this.showErrorSnack(err, false);
        this.notebookLoaded.set(true);
        this.notesLoaded.set(true);
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
          this.showErrorSnack(response.error, response.fromServer === true);
          return;
        }
        if (response.success) {
          this.userNotebooks.set(response.notebooks);
        }
      } catch (err) {
        this.showErrorSnack(err, false);
        this.notebooksLoaded.set(true);
        return;
      }
    }
  };

  updateSelected = (selected: SelectedNote) => {
    this.isSelected.update((prev) => selected);
    this.editNotesService.set(
      this.editNotes(),
      selected?.selected?.length ?? 0,
    );
  };

  openEditNotebookForm(): void {
    this.showEditNotebookForm.set(true);
  }

  moveNoteFormHandler = () => {
    this.moveNote.update((prevState) => true);
  };

  cancelMoveHandler = () => {
    this.moveNote.update((prevState) => false);
  };
  cancelEditHandler = () => {
    this.enableEditNotebook.update((prevState) => false);
    this.showEditNotebookForm.set(false);
    this.isClosingEditNotebook.set(false);
    this.store.dispatch(NotebookEditActions.editing({ status: false }));
  };

  requestCloseEditHandler = () => {
    this.isClosingEditNotebook.set(true);
  };

  onEditNotebookSheetDone = (e: { toState: string }) => {
    if (e.toState === 'void') {
      this.isClosingEditNotebook.set(false);
      this.cancelEditHandler();
    }
  };

  onEditNotebookOverlayClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      this.isClosingEditNotebook.set(true);
    }
  };

  editNotebookBtnHandler = () => {
    this.enableEditNotebook.update((prevState) => true);
    this.openEditNotebookForm();
  };

  addNoteFormHandler = () => {
    this.router.navigate([`/notebook/${this.notebookId}/create-note`]);
  };

  editNoteFormHandler = () => {
    this.editNotes.set(true);
    this.clearEditNotes.set(false);
    this.editNotesService.set(true, this.isSelected()?.selected?.length ?? 0);
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
    this.editNotesService.clear();
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
          this.showErrorSnack(response.error, response.fromServer === true);
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
        this.showErrorSnack(err, false);
        return;
      }
    }
  };

  editNotebookDateHandler = async (
    notebookID: string,
    notebookUpdated: string,
  ) => {
    if (this.token && notebookID && notebookUpdated) {
      try {
        const response = await editNotebookDate(
          this.token,
          notebookID,
          notebookUpdated,
        );
        if (response.error) {
          this.showErrorSnack(response.error, response.fromServer === true);
          return;
        }
        if (response.success) {
        }
      } catch (err) {
        this.showErrorSnack(err, false);
        return;
      }
    }
  };

  deleteNotebookHandler = async () => {
    if (!navigator.onLine) {
      this.showErrorSnack('Please check your network and try again.', false);
      return;
    }
    const notebook_id = this.notebook()!._id;
    if (this.token && notebook_id && notebook_id.length > 0) {
      try {
        const response = await deleteNotebook(this.token, notebook_id);
        if (response.error) {
          this.showErrorSnack(response.error, response.fromServer === true);
          return;
        }
        if (response.success) {
          this.router.navigate([`/notebooks`]);
        }
      } catch (err) {
        this.showErrorSnack(err, false);
        return;
      }
    }
  };

  editNotebookHandler = async (
    notebookID: string,
    notebookName: string,
    notebookCover: string,
    notebookUpdated: string,
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
          notebookUpdated,
        );
        if (response.error) {
          this.showErrorSnack(response.error, response.fromServer === true);
          return;
        }
        if (response.success) {
          this.notebook.update((prev) => response.notebook_edited);
          this.store.dispatch(NotebookEditActions.editing({ status: false }));
          this.store.dispatch(
            NotebookEditActions.edited(response.notebook_edited),
          );
          this.enableEditNotebook.update((prev) => false);
        }
      } catch (err) {
        this.showErrorSnack(err, false);
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
          latestUpdatedDate,
        );
        if (response.error) {
          this.showErrorSnack(response.error, response.fromServer === true);
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
        this.showErrorSnack(err, false);
        return;
      }
    }
  };
}
