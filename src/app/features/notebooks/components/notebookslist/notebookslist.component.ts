import {
  Component,
  signal,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { trigger, transition, style, animate } from '@angular/animations';
import { MatIconModule } from '@angular/material/icon';
import {
  GetNotebooks,
  IAuthContext,
  Notebook,
} from '../../../../core/model/global';
import { AuthService } from '../../../../core/services/auth.service';
import { Store } from '@ngrx/store';
import { SnackService } from '../../../../core/services/snack.service';
import { addNotebook } from 'src/app/core/helpers/addNotebook';
import { AddNotebookFormComponent } from '../add-notebook-form/add-notebook-form.component';
import { Subject, takeUntil } from 'rxjs';
import { LoadingScreenComponent } from '../../../../core/components/ui/loading-screen/loading-screen.component';
import { FooterComponent } from '../../../../core/components/footer/footer.component';
import { NotebookListItemComponent } from '../notebook-list-item/notebook-list-item.component';

@Component({
  selector: 'NotebooksList',
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
    MatButtonModule,
    MatIconModule,
    LoadingScreenComponent,
    FooterComponent,
    NotebookListItemComponent,
    AddNotebookFormComponent,
  ],
  templateUrl: './notebookslist.component.html',
  styleUrls: ['../../styles_shared/notebook-list-shared-css.scss'],
})
export class NotebookslistComponent implements OnInit, OnDestroy {
  @Input() notebooks: GetNotebooks;
  @Output() notebookAdded = new EventEmitter<Notebook>();

  enableAddNotebook = signal<boolean>(false);
  userNotebooks = signal<Notebook[] | []>([]);
  isLoaded = signal<boolean>(false);
  showAddNotebookForm = signal<boolean>(false);
  isClosingAddNotebook = signal<boolean>(false);

  loading: boolean | null;
  token: string | null;

  private authService = inject(AuthService);
  private snack = inject(SnackService);

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
      this.showErrorSnack(notebooks.error, notebooks.fromServer === true);
    }
  };

  addNotebookFormHandler = () => {
    this.showAddNotebookForm.set(true);
  };

  cancelHandler = () => {
    this.showAddNotebookForm.set(false);
    this.isClosingAddNotebook.set(false);
  };

  requestCloseHandler = () => {
    this.isClosingAddNotebook.set(true);
  };

  onAddNotebookOverlayClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      this.isClosingAddNotebook.set(true);
    }
  };

  onAddNotebookSheetDone = (e: { toState: string }) => {
    if (e.toState === 'void') {
      this.isClosingAddNotebook.set(false);
      this.cancelHandler();
    }
  };

  readonly showErrorSnack = (err: unknown, fromServer = false) => {
    this.snack.showErrorSnack(err, fromServer);
  };

  addNotebookHandler = async (
    notebook_name: string,
    notebook_cover: string,
  ) => {
    if (this.token) {
      try {
        const response = await addNotebook(
          this.token,
          notebook_name,
          notebook_cover,
        );
        if (response.error) {
          this.showErrorSnack(response.error, response.fromServer === true);
          return;
        }
        if (response.success) {
          const newNotebook: Notebook = {
            _id: response.notebook._id,
            notebook_name: response.notebook.notebook_name,
            notebook_cover: response.notebook.notebook_cover,
            updatedAt: response.notebook.updatedAt,
            createdAt: response.notebook.createdAt,
          };
          this.userNotebooks.update((prevNotebooks) => [
            newNotebook,
            ...prevNotebooks,
          ]);
          this.notebookAdded.emit(newNotebook);
        }
      } catch (err) {
        this.showErrorSnack(err, false);
        return;
      }
    }
  };
}
