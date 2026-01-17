import {
  Component,
  signal,
  OnInit,
  Inject,
  ViewChild,
  ViewContainerRef,
  ComponentRef,
  OnDestroy,
} from '@angular/core';
import {
  NotebookCoverType,
  NotebookAddEdit,
  Notebook,
  FolderOptionsInterface,
  NotebookAddEditMethod,
  AlertInterface,
} from 'src/app/core/model/global';
import APPLICATION_CONSTANTS from 'src/app/core/application-constants/application-constants';
import { FolderOptions } from '../../../../core/lib/folder-options';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { toObservable } from '@angular/core/rxjs-interop';
import { Subject, takeUntil } from 'rxjs';
import { ErrorAlertComponent } from '../../../../core/components/ui/error-alert/error-alert.component';

const AC = APPLICATION_CONSTANTS;

@Component({
  selector: 'AddNotebookForm',
  templateUrl: './add-notebook-form.component.html',
  styleUrls: ['./add-notebook-form.component.scss'],
})
export class AddNotebookFormComponent
  implements NotebookAddEdit, OnInit, OnDestroy
{
  @ViewChild('errorcontainer', { read: ViewContainerRef })
  errorcontainer: ViewContainerRef;

  notebook?: Notebook | undefined;
  method: NotebookAddEditMethod;
  onCancel: () => void;
  addNotebook?:
    | ((notebook_name: string, notebook_cover: NotebookCoverType) => void)
    | undefined;
  editNotebook: (
    notebook_id: string,
    notebook_name: string,
    notebook_cover: NotebookCoverType,
    notebook_updated: string
  ) => void;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      notebook: Notebook;
      method: NotebookAddEditMethod;
      onCancel: () => void;
      addNotebook: (
        notebook_name: string,
        notebook_cover: string
      ) => Promise<void>;
      editNotebook: (
        notebook_id: string,
        notebook_name: string,
        notebook_cover: NotebookCoverType,
        notebook_updated: string
      ) => void;
    }
  ) {}

  error = signal<AlertInterface>({ error_state: false, message: '' });
  error$ = toObservable(this.error);

  selectedCover = signal<NotebookCoverType>('default');
  selectedName = signal<string>('');
  formChanged = signal<boolean>(false);

  notebookName: string = '';
  notebookCover: NotebookCoverType = 'default';
  originalName: string = '';
  originalCover: NotebookCoverType = 'default';
  folderOptions: FolderOptionsInterface[] = FolderOptions;

  onDestroy$: Subject<void> = new Subject();

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  ngOnInit(): void {
    this.notebook = this.data.notebook;
    this.method = this.data.method;
    this.addNotebook = this.data.addNotebook;
    this.onCancel = this.data.onCancel;
    this.editNotebook = this.data.editNotebook;

    if (this.method === 'edit' && this.notebook) {
      this.originalName = this.notebookName = this.notebook.notebook_name;
      this.originalCover = this.notebookCover = this.notebook.notebook_cover;
    } else {
      this.originalName = this.notebookName;
      this.originalCover = this.notebookCover;
    }
    this.selectedCover.update((prev) => this.originalCover);
    this.selectedName.update((prev) => this.originalName);

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

  trackfolderOptions = (index: number, folder: FolderOptionsInterface) => {
    return folder ? folder.value : undefined;
  };

  getValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  getValueAsNotebookCoverType(event: Event) {
    return (event.target as HTMLInputElement).value as NotebookCoverType;
  }

  readonly checkForm = () => {
    if (!this.formChanged()) {
      return true;
    } else {
      return false;
    }
  };

  readonly nameChangeHandler = (name: string) => {
    this.resetError();
    this.selectedName.update((prev) => name);
    if (
      name !== this.originalName ||
      this.selectedCover() !== this.originalCover
    ) {
      if (
        !this.selectedName() ||
        this.selectedName().length < AC.NOTEBOOK_NAME_MIN
      ) {
        this.formChanged.update((prev) => false);
        return;
      } else {
        this.formChanged.update((prev) => true);
      }
      if (this.selectedName().length > AC.NOTEBOOK_NAME_MAX) {
        this.formChanged.update((prev) => false);
        this.error.set({
          error_state: true,
          message: `${AC.NOTEBOOK_NAME_MAX_ERROR}`,
        });
        return;
      }
    } else {
      this.formChanged.update((prev) => false);
    }
  };

  resetError = () => {
    if (this.componentRef) {
      this.componentRef.destroy();
    }
    this.error.update((prevState) => ({
      ...prevState,
      error_state: false,
      error_severity: '',
      message: '',
    }));
  };

  readonly coverChangeHandler = (cover: NotebookCoverType) => {
    this.selectedCover.update((prev) => cover);
    if (
      this.selectedName() !== this.originalName ||
      (this.selectedName() !== '' && cover !== this.originalCover)
    ) {
      this.formChanged.update((prev) => true);
    } else {
      this.formChanged.update((prev) => false);
    }
  };

  readonly cancelHandler = (event: Event) => {
    event.preventDefault();
    event.stopPropagation();
    this.error.set({ error_state: false, message: '' });
    this.onCancel();
  };

  readonly submitHandler = async (event: Event) => {
    event.preventDefault();
    event.stopPropagation();
    this.error.set({ error_state: false, message: '' });
    if (
      !this.selectedName() ||
      this.selectedName().length < AC.NOTEBOOK_NAME_MIN
    ) {
      this.error.set({
        error_state: true,
        message: `${AC.NOTEBOOK_NAME_MIN_ERROR}`,
      });
      return;
    }
    if (this.selectedName().length > AC.NOTEBOOK_NAME_MAX) {
      this.error.set({
        error_state: true,
        message: `${AC.NOTEBOOK_NAME_MAX_ERROR}`,
      });
      return;
    }
    if (!this.selectedCover() || this.selectedCover().length === 0) {
      this.error.set({ error_state: true, message: AC.NOTEBOOK_COVER_EMPTY });
      return;
    }
    const notebook_name = this.selectedName();
    if (this.method === 'edit' && this.notebook && this.editNotebook) {
      const notebookId = this.notebook._id;
      let updated = new Date().toISOString();
      if (this.notebook.updatedAt) {
        updated = this.notebook.updatedAt;
      }
      this.editNotebook(
        notebookId,
        notebook_name,
        this.selectedCover(),
        updated
      );
      this.onCancel();
    } else if (this.method === 'create' && this.addNotebook) {
      this.addNotebook(notebook_name, this.selectedCover());
      this.onCancel();
    }
  };
}
