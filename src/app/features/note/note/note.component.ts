// import {
//   Component,
//   OnInit,
//   signal,
//   runInInjectionContext,
//   INJECTOR,
//   inject,
//   OnDestroy,
//   ChangeDetectionStrategy,
// } from '@angular/core';
// import { ActivatedRoute, NavigationStart } from '@angular/router';
// import { AuthService } from '../../../core/services/auth.service';
// import { IAuthContext, WindowDimensions } from '../../../core/model/global';
// import { NotificationActions } from '../../../store/actions/notification.actions';
// import { NotebookEditActions } from '../../../store/actions/notebook_edit.actions';
// import { SnackActions } from '../../../store/actions/snack.actions';
// import { Store } from '@ngrx/store';
// import useWindowDimensions from '../../../core/lib/useWindowDimension';
// import { Observable, Subject, takeUntil } from 'rxjs';
// import { toObservable } from '@angular/core/rxjs-interop';
// import { getNote } from '../../../core/helpers/getNote';
// import { getNotebook } from '../../../core/helpers/getNotebook';
// import { saveNote } from '../../../core/helpers/saveNote';
// import { createNote } from '../../../core/helpers/createNote';
// import { HttpClient } from '@angular/common/http';
// import {
//   initScrollSync,
//   removeScrollListeners,
// } from '../../../core/lib/scroll_sync';
// import { Router } from '@angular/router';
// import APPLICATION_CONSTANTS from '../../../core/application-constants/application-constants';
// import { AuthGuardService } from '../../../core/services/auth-guard.service';

// const AC = APPLICATION_CONSTANTS;

// @Component({
//     selector: 'Note',
//     templateUrl: './note.component.html',
//     styleUrls: ['./note.component.scss'],
//     changeDetection: ChangeDetectionStrategy.OnPush,
//     standalone: false
// })
// export class NoteComponent implements OnInit, OnDestroy {
//   constructor(
//     private activatedRoute: ActivatedRoute,
//     private authService: AuthService,
//     private store: Store,
//     private http: HttpClient,
//     private router: Router,
//     private authGuard: AuthGuardService
//   ) {
//     router.events.subscribe((event) => {
//       if (event instanceof NavigationStart) {
//         this.navigationUrl = event.url;
//         if (this.isChanged() && !this.isCreate()) {
//           authGuard.deactivate = false;
//           this.autoSave.update((prev) => true);
//         }
//       }
//     });
//   }

//   navigationUrl: string;
//   notebookId: string;
//   noteId: string;
//   loading: boolean | null;
//   token: string | null;
//   new_note = false;

//   width: number;
//   height: number;
//   resize: () => void;
//   addListener: () => void;
//   removeListener: () => void;

//   WELCOME_NOTE = signal<string>('');
//   viewText = signal<string>('');
//   loadedText = signal<string>('');
//   isMobile = signal<boolean>(false);
//   originalText = signal<string>('');
//   updateEditTextProp = signal<string>('');
//   noteLoaded = signal<boolean>(false);
//   notebookLoaded = signal<boolean>(false);
//   autoSave = signal<boolean>(false);
//   autoSave$ = toObservable(this.autoSave);
//   isChanged = signal<boolean>(false);
//   isChanged$ = toObservable(this.isChanged);
//   isCreate = signal<boolean>(this.new_note);
//   isCreate$ = toObservable(this.isCreate);
//   isView = signal<boolean>(this.new_note);
//   isView$ = toObservable(this.isView);
//   isSplitScreen = signal<boolean>(false);
//   isSplitScreen$ = toObservable(this.isSplitScreen);
//   unsavedChanges = signal<boolean>(true);

//   private injector = inject(INJECTOR);
//   windowDimensions$: Observable<WindowDimensions>;

//   onDestroy$: Subject<void> = new Subject();

//   ngOnDestroy(): void {
//     this.removeListener();
//     removeScrollListeners();

//     this.onDestroy$.next();
//     this.onDestroy$.complete();
//   }

//   ngOnInit(): void {
//     // Effects
//     runInInjectionContext(this.injector, () => {
//       this.windowDimensions$ = toObservable(useWindowDimensions());
//       this.windowDimensions$
//         .pipe(takeUntil(this.onDestroy$))
//         .subscribe((dims) => {
//           this.width = dims.width;
//           this.height = dims.height;
//           this.addListener = dims.addListener;
//           this.removeListener = dims.removeListener;
//           this.dimensionsChange();
//         });

//       this.autoSave$.pipe(takeUntil(this.onDestroy$)).subscribe((res) => {
//         if (res) {
//           this.saveNoteCheck();
//           this.showSnack();
//         }
//       });
//     });

//     this.activatedRoute.params
//       .pipe(takeUntil(this.onDestroy$))
//       .subscribe((data: any) => {
//         this.noteId = data.noteId;
//         this.notebookId = data.notebookId;
//       });

//     this.authService.authContext$
//       .pipe(takeUntil(this.onDestroy$))
//       .subscribe((res: IAuthContext) => {
//         this.updateContext(res);
//       });

//     this.loadNote();
//     this.loadNotebook();
//     this.loadMarkdown();

//     // Wait for the Markdown to load before initializing scroll sync
//     setTimeout(() => {
//       initScrollSync();
//     }, 500);

//     if (this.noteId === 'create-note') {
//       this.new_note = true;
//       this.isCreate.set(true);
//       this.isView.set(true);
//     }

//     this.isChanged$.pipe(takeUntil(this.onDestroy$)).subscribe((res) => {
//       if (res) {
//         this.saveNoteCheck();
//       }
//     });

//     this.isView$.pipe(takeUntil(this.onDestroy$)).subscribe((res) => {
//       if (res) {
//         this.saveNoteCheck();
//       }
//     });

//     this.isCreate$.pipe(takeUntil(this.onDestroy$)).subscribe((res) => {
//       if (res) {
//         this.saveNoteCheck();
//       }
//     });
//   }

//   readonly showSnack = () => {
//     this.store.dispatch(
//       SnackActions.showSnack({
//         snack: { n_status: true, message: 'Note Saved' },
//       })
//     );
//   };

//   readonly exampleNote = () => {
//     if (!this.isMobile()) {
//       this.isSplitScreen.set(true);
//     }
//     this.updatedViewTextHandler(this.WELCOME_NOTE());
//   };

//   readonly updatedViewTextHandler = (updatedViewText: string) => {
//     this.updateIsChanged(updatedViewText);
//     this.viewText.update((prev) => updatedViewText);
//     this.updateEditTextProp.set(updatedViewText);
//   };

//   readonly updateIsChanged = (content: string) => {
//     if (content !== this.originalText()) {
//       this.isChanged.update((prev) => true);
//     } else {
//       this.isChanged.update((prev) => false);
//     }
//   };

//   // Create Note
//   readonly createNotePost = async () => {
//     if (this.token && this.notebookId && this.viewText()) {
//       this.autoSave.set(false);
//       const note_obj = { notebookId: this.notebookId, note: this.viewText() };
//       try {
//         const response = await createNote(this.token, note_obj);
//         this.notebookLoaded.set(true);
//         if (response.error) {
//           this.showNotification(`${response.error}`);
//           return;
//         }
//         if (response.success) {
//           this.isCreate.set(false);
//           this.isChanged.set(false);
//           this.autoSave.set(false);
//           this.router.navigate([`/notebook/${this.notebookId}`]);
//         }
//       } catch (err) {
//         this.showNotification(`${err}`);
//         return;
//       }
//     }
//   };

//   readonly saveNoteCheck = async () => {
//     if (
//       this.autoSave() &&
//       this.isChanged() &&
//       (this.isView() || this.isChanged()) &&
//       !this.isCreate()
//     ) {
//       const noteSaved = async () => {
//         await this.saveNoteCallback();
//         this.autoSave.update((prev) => false);
//         this.isChanged.set(false);
//         this.authGuard.deactivate = true;
//         this.router.navigate([`${this.navigationUrl}`]);
//       };
//       noteSaved();
//     }
//   };

//   readonly toggleEditHandlerCallback = () => {
//     this.isView.set(!this.isView());
//   };

//   readonly toggleSplitHandlerCallback = () => {
//     this.isSplitScreen.set(!this.isSplitScreen());
//   };

//   readonly saveNoteCallback = async () => {
//     if (this.token && this.notebookId && this.noteId && this.viewText()) {
//       let response;
//       try {
//         response = await saveNote(
//           this.token,
//           this.notebookId,
//           this.noteId,
//           this.viewText()
//         );
//         if (response.error) {
//           this.showNotification(`${response.error}`);
//           return;
//         }
//         if (response.success) {
//           this.isChanged.update((prev) => false);
//           this.autoSave.update((prev) => false);
//           this.originalText.set(this.viewText());
//           // Change to View Mode
//           if (this.isView()) {
//             this.toggleEditHandlerCallback();
//           }
//           return response;
//         }
//       } catch (err) {
//         this.showNotification(`${err}`);
//         return;
//       }
//     } else {
//       return;
//     }
//     return;
//   };

//   dimensionsChange = () => {
//     this.addListener();
//     if (this.width < AC.SPLITSCREEN_MINIMUM_WIDTH) {
//       this.isSplitScreen.set(false);
//       this.isMobile.set(true);
//     } else {
//       this.isMobile.set(false);
//     }
//   };

//   loadMarkdown = async () => {
//     this.http
//       .get(`../../assets/markdown/welcome_markdown_angular.md`, {
//         responseType: 'text',
//       })
//       .subscribe((res) => {
//         this.WELCOME_NOTE.set(res);
//       });
//   };

//   loadNote = async () => {
//     if (
//       !this.isCreate() &&
//       this.notebookId &&
//       this.noteId &&
//       this.noteId !== 'create-note' &&
//       !this.noteLoaded() &&
//       this.token
//     ) {
//       this.noteLoaded.set(false);
//       try {
//         const response = await getNote(
//           this.token,
//           this.notebookId,
//           this.noteId
//         );
//         if (response.error) {
//           this.showNotification(`${response.error}`);
//           return;
//         }
//         if (response.success) {
//           this.viewText.set(response.note.note);
//           this.loadedText.set(response.note.note);
//           this.originalText.set(response.note.note);
//           this.noteLoaded.set(true);
//         }
//       } catch (err) {
//         this.showNotification(`${err}`);
//         return;
//       }
//     } else {
//       this.noteLoaded.set(true);
//     }
//   };

//   loadNotebook = async () => {
//     if (!this.notebookLoaded() && this.token && this.notebookId) {
//       this.notebookLoaded.set(false);
//       try {
//         const response = await getNotebook(this.token, this.notebookId);
//         this.notebookLoaded.set(true);
//         if (response.error) {
//           this.showNotification(`${response.error}`);
//           return;
//         }
//         if (response.success) {
//           this.store.dispatch(NotebookEditActions.edited(response.notebook));
//         }
//       } catch (err) {
//         this.showNotification(`${err}`);
//         this.notebookLoaded.set(true);
//         return;
//       }
//     }
//   };

//   updateContext = (context: IAuthContext) => {
//     this.loading = context.loading;
//     this.token = context.token;
//   };

//   readonly showNotification = (msg: string) => {
//     this.store.dispatch(
//       NotificationActions.showNotification({
//         notification: { n_status: 'error', title: 'Error!', message: msg },
//       })
//     );
//   };
// }

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
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { IAuthContext, WindowDimensions } from '../../../core/model/global';
import { NotificationActions } from '../../../store/actions/notification.actions';
import { NotebookEditActions } from '../../../store/actions/notebook_edit.actions';
import { SnackActions } from '../../../store/actions/snack.actions';
import { Store } from '@ngrx/store';
import useWindowDimensions from '../../../core/lib/useWindowDimension';
import { Observable, Subject, takeUntil } from 'rxjs';
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
import { AuthGuardService } from '../../../core/services/auth-guard.service';
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
  private authGuard = inject(AuthGuardService);

  navigationUrl: string;
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
  autoSave = signal<boolean>(false);
  autoSave$ = toObservable(this.autoSave);
  isChanged = signal<boolean>(false);
  isChanged$ = toObservable(this.isChanged);
  isCreate = signal<boolean>(this.new_note);
  isCreate$ = toObservable(this.isCreate);
  isView = signal<boolean>(this.new_note);
  isView$ = toObservable(this.isView);
  isSplitScreen = signal<boolean>(false);
  isSplitScreen$ = toObservable(this.isSplitScreen);
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
    // Subscribe to router events with proper cleanup
    this.router.events.pipe(takeUntil(this.onDestroy$)).subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.navigationUrl = event.url;
        if (this.isChanged() && !this.isCreate()) {
          this.authGuard.deactivate = false;
          this.autoSave.update((prev) => true);
        }
      }
    });
    // Effects
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

      this.autoSave$.pipe(takeUntil(this.onDestroy$)).subscribe((res) => {
        if (res) {
          this.saveNoteCheck();
          this.showSnack();
        }
      });
    });

    this.activatedRoute.params
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((data: any) => {
        this.noteId = data.noteId;
        this.notebookId = data.notebookId;
      });

    this.authService.authContext$
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((res: IAuthContext) => {
        this.updateContext(res);
      });

    this.loadNote();
    this.loadNotebook();
    this.loadMarkdown();

    // Wait for the Markdown to load before initializing scroll sync
    setTimeout(() => {
      initScrollSync();
    }, 500);

    if (this.noteId === 'create-note') {
      this.new_note = true;
      this.isCreate.set(true);
      this.isView.set(true);
    }

    this.isChanged$.pipe(takeUntil(this.onDestroy$)).subscribe((res) => {
      if (res) {
        this.saveNoteCheck();
      }
    });

    this.isView$.pipe(takeUntil(this.onDestroy$)).subscribe((res) => {
      if (res) {
        this.saveNoteCheck();
      }
    });

    this.isCreate$.pipe(takeUntil(this.onDestroy$)).subscribe((res) => {
      if (res) {
        this.saveNoteCheck();
      }
    });
  }

  readonly showSnack = () => {
    this.store.dispatch(
      SnackActions.showSnack({
        snack: { n_status: true, message: 'Note Saved' },
      }),
    );
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
      this.autoSave.set(false);
      const note_obj = { notebookId: this.notebookId, note: this.viewText() };
      try {
        const response = await createNote(this.token, note_obj);
        this.notebookLoaded.set(true);
        if (response.error) {
          this.showNotification(`${response.error}`);
          return;
        }
        if (response.success) {
          this.isCreate.set(false);
          this.isChanged.set(false);
          this.autoSave.set(false);
          this.router.navigate([`/notebook/${this.notebookId}`]);
        }
      } catch (err) {
        this.showNotification(`${err}`);
        return;
      }
    }
  };

  readonly saveNoteCheck = async () => {
    if (
      this.autoSave() &&
      this.isChanged() &&
      (this.isView() || this.isChanged()) &&
      !this.isCreate()
    ) {
      const noteSaved = async () => {
        await this.saveNoteCallback();
        this.autoSave.update((prev) => false);
        this.isChanged.set(false);
        this.authGuard.deactivate = true;
        this.router.navigate([`${this.navigationUrl}`]);
      };
      noteSaved();
    }
  };

  readonly toggleEditHandlerCallback = () => {
    this.isView.set(!this.isView());
  };

  readonly toggleSplitHandlerCallback = () => {
    this.isSplitScreen.set(!this.isSplitScreen());
  };

  readonly saveNoteCallback = async () => {
    if (this.token && this.notebookId && this.noteId && this.viewText()) {
      let response;
      try {
        response = await saveNote(
          this.token,
          this.notebookId,
          this.noteId,
          this.viewText(),
        );
        if (response.error) {
          this.showNotification(`${response.error}`);
          return;
        }
        if (response.success) {
          this.isChanged.update((prev) => false);
          this.autoSave.update((prev) => false);
          this.originalText.set(this.viewText());
          // Change to View Mode
          if (this.isView()) {
            this.toggleEditHandlerCallback();
          }
          return response;
        }
      } catch (err) {
        this.showNotification(`${err}`);
        return;
      }
    } else {
      return;
    }
    return;
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
          this.showNotification(`${response.error}`);
          return;
        }
        if (response.success) {
          this.viewText.set(response.note.note);
          this.loadedText.set(response.note.note);
          this.originalText.set(response.note.note);
          this.noteLoaded.set(true);
        }
      } catch (err) {
        this.showNotification(`${err}`);
        return;
      }
    } else {
      this.noteLoaded.set(true);
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
          this.store.dispatch(NotebookEditActions.edited(response.notebook));
        }
      } catch (err) {
        this.showNotification(`${err}`);
        this.notebookLoaded.set(true);
        return;
      }
    }
  };

  updateContext = (context: IAuthContext) => {
    this.loading = context.loading;
    this.token = context.token;
  };

  readonly showNotification = (msg: string) => {
    this.store.dispatch(
      NotificationActions.showNotification({
        notification: { n_status: 'error', title: 'Error!', message: msg },
      }),
    );
  };
}
