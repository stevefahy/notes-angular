import {
  Component,
  signal,
  OnInit,
  Input,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  NotebookAddEdit,
  Notebook,
  NotebookAddEditMethod,
  AlertInterface,
} from 'src/app/core/model/global';
import APPLICATION_CONSTANTS from 'src/app/core/application-constants/application-constants';
import {
  FolderOptions,
  mapLegacyCover,
  toLegacyCover,
  type NotebookCoverType as UICoverType,
} from '../../../../core/lib/folder-options';
import { Subject } from 'rxjs';
import { ErrorAlertComponent } from '../../../../core/components/ui/error-alert/error-alert.component';
const AC = APPLICATION_CONSTANTS;

@Component({
  selector: 'AddNotebookForm',
  standalone: true,
  imports: [CommonModule, FormsModule, ErrorAlertComponent],
  templateUrl: './add-notebook-form.component.html',
  styleUrls: ['./add-notebook-form.component.scss'],
})
export class AddNotebookFormComponent
  implements NotebookAddEdit, OnInit, OnDestroy, AfterViewInit
{
  @ViewChild('nameInput') nameInputRef: ElementRef<HTMLInputElement>;

  @Input() formData: {
    notebook?: Notebook;
    method: NotebookAddEditMethod;
    onCancel: () => void;
    onRequestClose?: () => void;
    addNotebook?: (
      notebook_name: string,
      notebook_cover: string,
    ) => Promise<void>;
    editNotebook?: (
      notebook_id: string,
      notebook_name: string,
      notebook_cover: string,
      notebook_updated: string,
    ) => void;
  };

  notebook?: Notebook | undefined;
  method: NotebookAddEditMethod;
  onCancel: () => void;
  onRequestClose?: () => void;
  addNotebook?:
    | ((notebook_name: string, notebook_cover: string) => Promise<void>)
    | undefined;
  editNotebook?: (
    notebook_id: string,
    notebook_name: string,
    notebook_cover: string,
    notebook_updated: string,
  ) => void;

  error = signal<AlertInterface>({ error_state: false, message: '' });

  selectedCover = signal<UICoverType>('forest');
  /** Plain property for [(ngModel)] - Svelte uses bind:value on a $state variable */
  currentName = '';
  isSubmitting = signal<boolean>(false);

  /** Uses currentName directly - called from template so change detection picks up ngModel updates */
  isCreateButtonDisabled(): boolean {
    const name = this.currentName;
    const nameValid =
      name.length >= AC.NOTEBOOK_NAME_MIN &&
      name.length <= AC.NOTEBOOK_NAME_MAX;
    if (this.method === 'create') {
      return !nameValid;
    }
    const hasChange =
      name !== this.originalName || this.selectedCover() !== this.originalCover;
    return !(hasChange && nameValid);
  }

  notebookName: string = '';
  notebookCover: UICoverType = 'forest';
  originalName: string = '';
  originalCover: UICoverType = 'forest';
  folderOptions = FolderOptions;

  onDestroy$: Subject<void> = new Subject();

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  ngOnInit(): void {
    const data = this.formData;
    if (!data) return;
    this.notebook = data.notebook;
    this.method = data.method;
    this.addNotebook = data.addNotebook;
    this.onCancel = data.onCancel;
    this.onRequestClose = data.onRequestClose;
    this.editNotebook = data.editNotebook;

    if (this.method === 'edit' && this.notebook) {
      this.originalName = this.notebookName = this.notebook.notebook_name;
      this.originalCover = this.notebookCover = mapLegacyCover(
        this.notebook.notebook_cover,
      );
    } else {
      this.originalName = this.notebookName;
      this.originalCover = 'forest'; // Svelte default for create mode
    }
    this.selectedCover.set(this.originalCover);
    this.currentName = this.originalName;
  }

  @HostListener('document:keydown.Escape')
  onEscapeKey(): void {
    this.cancelHandler(new KeyboardEvent('keydown'));
  }

  ngAfterViewInit(): void {
    // Focus name input after sheet animates in (matches Svelte focusNameInput)
    setTimeout(() => this.nameInputRef?.nativeElement?.focus(), 400);
  }

  trackfolderOptions = (
    index: number,
    folder: (typeof FolderOptions)[number],
  ) => {
    return folder ? folder.value : undefined;
  };

  getValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  getValueAsNotebookCoverType(event: Event): UICoverType {
    return (event.target as HTMLInputElement).value as UICoverType;
  }

  /** Clear error when user types - Svelte only shows length errors on submit */
  readonly nameChangeHandler = () => {
    this.resetError();
  };

  resetError = () => {
    this.error.update((prevState) => ({
      ...prevState,
      error_state: false,
      error_severity: '',
      message: '',
    }));
  };

  readonly coverChangeHandler = (cover: UICoverType) => {
    this.selectedCover.set(cover);
  };

  readonly cancelHandler = (event: Event) => {
    event.preventDefault();
    event.stopPropagation();
    this.error.set({ error_state: false, message: '' });
    if (this.onRequestClose) {
      this.onRequestClose();
    } else {
      this.onCancel();
    }
  };

  readonly submitHandler = async (event: Event) => {
    event.preventDefault();
    event.stopPropagation();
    this.error.set({ error_state: false, message: '' });
    const notebook_name = this.currentName.trim();
    if (!notebook_name || notebook_name.length < AC.NOTEBOOK_NAME_MIN) {
      this.error.set({
        error_state: true,
        message: `${AC.NOTEBOOK_NAME_MIN_ERROR}`,
      });
      return;
    }
    if (notebook_name.length > AC.NOTEBOOK_NAME_MAX) {
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
    if (this.method === 'edit' && this.notebook && this.editNotebook) {
      this.isSubmitting.set(true);
      try {
        const notebookId = this.notebook._id;
        let updated = new Date().toISOString();
        if (this.notebook.updatedAt) {
          updated = this.notebook.updatedAt;
        }
        await this.editNotebook(
          notebookId,
          notebook_name,
          toLegacyCover(this.selectedCover()),
          updated,
        );
        this.onCancel();
      } finally {
        this.isSubmitting.set(false);
      }
    } else if (this.method === 'create' && this.addNotebook) {
      this.isSubmitting.set(true);
      try {
        await this.addNotebook(
          notebook_name,
          toLegacyCover(this.selectedCover()),
        );
        this.onCancel();
      } finally {
        this.isSubmitting.set(false);
      }
    }
  };
}
