import {
  Component,
  OnInit,
  Input,
  signal,
  inject,
  ViewContainerRef,
  ComponentRef,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  AlertInterface,
  Notebook,
  SelectNotebookFormProps,
} from 'src/app/core/model/global';
import { Observable, of, Subject, takeUntil } from 'rxjs';
import { ErrorAlertComponent } from '../../../../core/components/ui/error-alert/error-alert.component';
import { toObservable } from '@angular/core/rxjs-interop';

@Component({
    selector: 'SelectNotebookForm',
    standalone: true,
    imports: [
      CommonModule,
      FormsModule,
      MatDialogModule,
      MatButtonModule,
      MatIconModule,
    ],
    templateUrl: './select-notebook-form.component.html',
    styleUrls: ['./select-notebook-form.component.scss'],
})
export class SelectNotebookFormComponent
  implements SelectNotebookFormProps, OnInit, OnDestroy
{
  @Input() notebooks: Notebook[];
  @Input() onCancel: () => void;
  @Input() moveNotes: (notebook_id: string) => void;

  @ViewChild('errorcontainer', { read: ViewContainerRef })
  errorcontainer: ViewContainerRef;

  notebookId: string;

  selectedNotebook = signal<string>('');
  formIsValid = signal<boolean>(false);
  notebooksSorted = signal<Notebook[] | null>(null);
  error = signal<AlertInterface>({
    error_state: false,
    error_severity: '',
    message: '',
  });

  error$ = toObservable(this.error);
  notebooks$: Observable<Notebook[]>;

  data = inject(MAT_DIALOG_DATA) as {
    notebooks: Notebook[];
    onCancel: () => void;
    moveNotes: (notebook_id: string) => void;
    notebookId: string;
  };

  onDestroy$: Subject<void> = new Subject();

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  ngOnInit(): void {
    this.onCancel = this.data.onCancel;
    this.moveNotes = this.data.moveNotes;
    this.notebooks = this.data.notebooks;
    this.notebookId = this.data.notebookId;

    this.notebooks$ = of(this.notebooks);

    this.notebooks$.pipe(takeUntil(this.onDestroy$)).subscribe((notebooks) => {
      if (notebooks) {
        let sorted = this.sortNotes(notebooks);
        this.notebooksSorted.set(sorted);
      }
    });

    this.error$.pipe(takeUntil(this.onDestroy$)).subscribe((err) => {
      if (err.error_state) {
        this.addErrorComponent();
      }
    });
  }

  componentRef: ComponentRef<ErrorAlertComponent>;
  public addErrorComponent(): void {
    import('../../../../core/lazy-error-alert.module').then((importedFile) => {
      const componentToOpen =
        importedFile.LazyLoadedModule.components.dynamicComponent;
      this.componentRef = this.errorcontainer.createComponent(componentToOpen);
      this.componentRef.instance.error_state = this.error().error_state!;
      this.componentRef.instance.error_severity = this.error().error_severity!;
      this.componentRef.instance.message = this.error().message!;
    });
  }

  trackByNotebooks = (index: number, notebook: Notebook) => {
    return notebook ? notebook._id : undefined;
  };

  readonly findNotebook = (notebook_id: string) => {
    const index = this.notebooks.findIndex((x) => x._id === notebook_id);
    return this.notebooks[index];
  };

  readonly sortNotes = (notebooks: Notebook[]) => {
    // Add an update date for sorting if one does not exist
    notebooks.forEach((x) => {
      if (x.updatedAt === 'No date' || undefined) {
        x.updatedAt = 'December 17, 1995 03:24:00';
      }
      if (x.createdAt === 'No date' || undefined) {
        x.createdAt = 'December 17, 1995 03:24:00';
      }
    });
    notebooks
      .sort((a, b) => {
        if (a.updatedAt !== undefined && b.updatedAt !== undefined) {
          return new Date(a.updatedAt) > new Date(b.updatedAt) ? 1 : -1;
        } else {
          return a.updatedAt !== undefined ? 1 : -1;
        }
      })
      .reverse();
    return notebooks;
  };

  readonly cancelHandler = (event: Event) => {
    event.preventDefault();
    event.stopPropagation();
    if (this.error().error_state) {
      this.resetError();
    }
    this.onCancel();
  };

  readonly submitHandler = async (event: Event) => {
    event.preventDefault();
    event.stopPropagation();
    if (this.error().error_state) {
      this.resetError();
    }
    this.findNotebook(this.selectedNotebook());
    if (!this.selectedNotebook()) {
      this.formIsValid.set(false);
      return;
    }
    this.moveNotes(this.selectedNotebook());
    this.onCancel();
  };

  resetError = () => {
    if (this.componentRef) {
      this.componentRef.destroy();
    }
    this.formIsValid.set(true);
    this.error.update((prevState) => ({
      ...prevState,
      error_state: false,
      error_severity: '',
      message: '',
    }));
  };

  readonly handleChange = (event: Event) => {
    this.selectedNotebook.update(
      (prev) => (event.target as HTMLSelectElement).value
    );
    if ((event.target as HTMLSelectElement).value === 'default') {
      this.formIsValid.set(false);
    } else {
      this.formIsValid.set(true);
    }
  };
}
