import {
  Component,
  OnInit,
  signal,
  runInInjectionContext,
  INJECTOR,
  inject,
  OnDestroy,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { IAuthContext, WindowDimensions } from '../../../core/model/global';
import { SnackService } from '../../../core/services/snack.service';
import { NotebookEditActions } from '../../../store/actions/notebook_edit.actions';
import { Store } from '@ngrx/store';
import useWindowDimensions from '../../../core/lib/useWindowDimension';
import {
  Observable,
  Subject,
  combineLatest,
  distinctUntilChanged,
  filter,
  map,
  takeUntil,
} from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { getNote } from '../../../core/helpers/getNote';
import { getNotebook } from '../../../core/helpers/getNotebook';
import { saveNote } from '../../../core/helpers/saveNote';
import { createNote } from '../../../core/helpers/createNote';
import {
  initScrollSync,
  removeScrollListeners,
} from '../../../core/lib/scroll_sync';
import APPLICATION_CONSTANTS from '../../../core/application-constants/application-constants';
import { LoadingScreenComponent } from '../../../core/components/ui/loading-screen/loading-screen.component';
import { FooterComponent } from '../../../core/components/footer/footer.component';
import { ViewnoteComponent } from '../../viewnote/components/viewnote/viewnote.component';
import { EditnoteComponent } from '../componets/editnote/editnote.component';

const AC = APPLICATION_CONSTANTS;

@Component({
  selector: 'Note',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    LoadingScreenComponent,
    FooterComponent,
    ViewnoteComponent,
    EditnoteComponent,
  ],
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoteComponent implements OnInit, OnDestroy {
  private activatedRoute = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private store = inject(Store);
  private http = inject(HttpClient);
  private router = inject(Router);
  private snack = inject(SnackService);

  notebookId: string;
  noteId: string;
  loading: boolean | null;
  token: string | null;
  new_note = false;

  width: number;
  height: number;
  resize: () => void;
  addListener: () => void;
  removeListener: () => void;

  WELCOME_NOTE = signal<string>('');
  viewText = signal<string>('');
  loadedText = signal<string>('');
  isMobile = signal<boolean>(false);
  originalText = signal<string>('');
  updateEditTextProp = signal<string>('');
  noteLoaded = signal<boolean>(false);
  notebookLoaded = signal<boolean>(false);
  loadError = signal<string | null>(null);
  isChanged = signal<boolean>(false);
  isCreate = signal<boolean>(this.new_note);
  isView = signal<boolean>(true);
  isSplitScreen = signal<boolean>(false);
  unsavedChanges = signal<boolean>(true);

  private injector = inject(INJECTOR);
  windowDimensions$: Observable<WindowDimensions>;

  onDestroy$: Subject<void> = new Subject();

  ngOnDestroy(): void {
    this.removeListener();
    removeScrollListeners();

    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  ngOnInit(): void {
    runInInjectionContext(this.injector, () => {
      this.windowDimensions$ = toObservable(useWindowDimensions());
      this.windowDimensions$
        .pipe(takeUntil(this.onDestroy$))
        .subscribe((dims) => {
          this.width = dims.width;
          this.height = dims.height;
          this.addListener = dims.addListener;
          this.removeListener = dims.removeListener;
          this.dimensionsChange();
        });
    });

    this.authService.authContext$
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((res: IAuthContext) => {
        this.updateContext(res);
      });

    combineLatest([
      this.activatedRoute.paramMap,
      this.authService.authContext$,
    ])
      .pipe(
        takeUntil(this.onDestroy$),
        map(([params, ctx]) => ({
          notebookId: params.get('notebookId'),
          noteId: params.get('noteId'),
          ctx,
        })),
        filter(
          (x): x is { notebookId: string; noteId: string; ctx: IAuthContext } =>
            !!x.notebookId && !!x.noteId && !!x.ctx.token,
        ),
        distinctUntilChanged(
          (a, b) =>
            a.notebookId === b.notebookId &&
            a.noteId === b.noteId &&
            a.ctx.token === b.ctx.token,
        ),
      )
      .subscribe(({ notebookId, noteId, ctx }) => {
        const notebookChanged = notebookId !== this.notebookId;
        const noteIdentityChanged =
          notebookId !== this.notebookId || noteId !== this.noteId;

        this.updateContext(ctx);
        this.notebookId = notebookId;
        this.noteId = noteId;
        this.isView.set(noteId !== 'create-note');
        this.isCreate.set(noteId === 'create-note');
        this.new_note = noteId === 'create-note';

        if (notebookChanged) {
          this.notebookLoaded.set(false);
        }
        if (noteIdentityChanged) {
          this.noteLoaded.set(false);
        }

        void this.loadNote();
        void this.loadNotebook();
      });

    this.loadMarkdown();

    // Wait for the Markdown to load before initializing scroll sync
    setTimeout(() => {
      initScrollSync();
    }, 500);
  }

  /**
   * Called by canDeactivateGuard before leaving the note route when there are unsaved edits.
   */
  async confirmNavigateAway(): Promise<boolean> {
    if (!this.isChanged() || this.isCreate()) return true;
    if (!this.token || !this.notebookId || !this.noteId || !this.viewText()) {
      return true;
    }
    const ok = await this.persistNote({ skipViewToggle: true });
    if (ok) this.showSnack();
    return ok;
  }

  readonly showSnack = () => {
    this.snack.showSnack('Note Saved');
  };

  readonly exampleNote = () => {
    if (!this.isMobile()) {
      this.isSplitScreen.set(true);
    }
    this.updatedViewTextHandler(this.WELCOME_NOTE());
  };

  readonly updatedViewTextHandler = (updatedViewText: string) => {
    this.updateIsChanged(updatedViewText);
    this.viewText.update((prev) => updatedViewText);
    this.updateEditTextProp.set(updatedViewText);
  };

  readonly updateIsChanged = (content: string) => {
    if (content !== this.originalText()) {
      this.isChanged.update((prev) => true);
    } else {
      this.isChanged.update((prev) => false);
    }
  };

  // Create Note
  readonly createNotePost = async () => {
    if (this.token && this.notebookId && this.viewText()) {
      const note_obj = { notebookId: this.notebookId, note: this.viewText() };
      try {
        const response = await createNote(this.token, note_obj);
        this.notebookLoaded.set(true);
        if (response.error) {
          this.showErrorSnack(response.error, response.fromServer === true);
          return;
        }
        if (response.success) {
          this.isCreate.set(false);
          this.isChanged.set(false);
          this.router.navigate([`/notebook/${this.notebookId}`]);
        }
      } catch (err) {
        this.showErrorSnack(err, false);
        return;
      }
    }
  };

  readonly toggleEditHandlerCallback = () => {
    this.isView.set(!this.isView());
  };

  readonly toggleSplitHandlerCallback = () => {
    this.isSplitScreen.set(!this.isSplitScreen());
  };

  private async persistNote(options?: {
    skipViewToggle?: boolean;
  }): Promise<boolean> {
    if (!this.token || !this.notebookId || !this.noteId || !this.viewText()) {
      return false;
    }
    try {
      const response = await saveNote(
        this.token,
        this.notebookId,
        this.noteId,
        this.viewText(),
      );
      if (response.error) {
        this.showErrorSnack(response.error, response.fromServer === true);
        return false;
      }
      if (response.success) {
        this.isChanged.set(false);
        this.originalText.set(this.viewText());
        if (!options?.skipViewToggle && this.isView()) {
          this.toggleEditHandlerCallback();
        }
        return true;
      }
    } catch (err) {
      this.showErrorSnack(err, false);
      return false;
    }
    return false;
  }

  readonly saveNoteCallback = async () => {
    const ok = await this.persistNote();
    if (ok) this.showSnack();
  };

  dimensionsChange = () => {
    this.addListener();
    if (this.width < AC.SPLITSCREEN_MINIMUM_WIDTH) {
      this.isSplitScreen.set(false);
      this.isMobile.set(true);
    } else {
      this.isMobile.set(false);
    }
  };

  loadMarkdown = async () => {
    this.http
      .get(`../../assets/markdown/welcome_markdown_angular.md`, {
        responseType: 'text',
      })
      .subscribe((res) => {
        this.WELCOME_NOTE.set(res);
      });
  };

  loadNote = async () => {
    if (
      !this.isCreate() &&
      this.notebookId &&
      this.noteId &&
      this.noteId !== 'create-note' &&
      !this.noteLoaded() &&
      !this.loadError() &&
      this.token
    ) {
      this.noteLoaded.set(false);
      try {
        const response = await getNote(
          this.token,
          this.notebookId,
          this.noteId,
        );
        if (response.error) {
          this.loadError.set(response.error);
          this.showErrorSnack(response.error, response.fromServer === true);
          this.noteLoaded.set(true);
          return;
        }
        if (response.success) {
          this.viewText.set(response.note.note);
          this.loadedText.set(response.note.note);
          this.originalText.set(response.note.note);
          this.noteLoaded.set(true);
        }
      } catch (err) {
        this.loadError.set(
          err instanceof Error ? err.message : String(err ?? ''),
        );
        this.showErrorSnack(err, false);
        this.noteLoaded.set(true);
        return;
      }
    } else {
      this.noteLoaded.set(true);
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
          return;
        }
        if (response.success) {
          this.store.dispatch(NotebookEditActions.edited(response.notebook));
        }
      } catch (err) {
        this.loadError.set(
          err instanceof Error ? err.message : String(err ?? ''),
        );
        this.showErrorSnack(err, false);
        this.notebookLoaded.set(true);
        return;
      }
    }
  };

  updateContext = (context: IAuthContext) => {
    this.loading = context.loading;
    this.token = context.token;
  };

  readonly showErrorSnack = (err: unknown, fromServer = false) => {
    this.snack.showErrorSnack(err, fromServer);
  };
}
