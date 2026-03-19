import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  signal,
  computed,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Notebook } from 'src/app/core/model/global';
import { mapLegacyCover } from 'src/app/core/lib/folder-options';

@Component({
  selector: 'SelectNotebookForm',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './select-notebook-form.component.html',
  styleUrls: ['./select-notebook-form.component.scss'],
})
export class SelectNotebookFormComponent implements OnInit, AfterViewInit {
  @Input() notebooks: Notebook[] = [];
  @Input() notebookId = '';
  @Output() cancel = new EventEmitter<void>();
  @Output() moveNotes = new EventEmitter<string>();

  @ViewChild('sheetRef') sheetRef: ElementRef<HTMLElement>;

  selectedNotebook = signal<string>('');
  formIsValid = computed(
    () =>
      this.selectedNotebook() !== '' && this.selectedNotebook() !== 'default',
  );

  notebooksSorted = computed(() => {
    const copy = [...(this.notebooks || [])];
    copy.sort((a, b) => {
      const aDate =
        a.updatedAt === 'No date' || !a.updatedAt
          ? 'December 17, 1995'
          : a.updatedAt;
      const bDate =
        b.updatedAt === 'No date' || !b.updatedAt
          ? 'December 17, 1995'
          : b.updatedAt;
      return new Date(aDate) > new Date(bDate) ? -1 : 1;
    });
    return copy;
  });

  notebooksFiltered = computed(() =>
    (this.notebooksSorted() || []).filter((n) => n._id !== this.notebookId),
  );

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    setTimeout(() => this.focusFirstOption(), 0);
  }

  getDisplayCover(legacy: string): string {
    return mapLegacyCover(legacy || 'default');
  }

  focusFirstOption(): void {
    const first =
      this.sheetRef?.nativeElement?.querySelector<HTMLButtonElement>(
        '.notebook-option',
      );
    if (first) first.focus();
  }

  selectNotebook(id: string): void {
    this.selectedNotebook.set(id);
  }

  cancelHandler(e: Event): void {
    e.preventDefault();
    e.stopPropagation();
    this.cancel.emit();
  }

  submitHandler = async (e: Event): Promise<void> => {
    e.preventDefault();
    e.stopPropagation();
    const id = this.selectedNotebook();
    if (!id || !this.formIsValid()) return;
    this.moveNotes.emit(id);
  };

  onOverlayKeydown(e: KeyboardEvent): void {
    if (e.key === 'Enter' || e.key === ' ') {
      if (
        e.target instanceof HTMLElement &&
        e.target.closest('.bottom-sheet')
      ) {
        return;
      }
      e.preventDefault();
      this.cancel.emit();
    }
  }

  onSheetKeydown(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      e.preventDefault();
      this.cancel.emit();
    }
  }

  handleOptionsKeydown(e: KeyboardEvent): void {
    const options = Array.from(
      (e.currentTarget as HTMLElement).querySelectorAll<HTMLButtonElement>(
        '.notebook-option',
      ),
    );
    const current = options.indexOf(
      document.activeElement as HTMLButtonElement,
    );
    if (e.key === 'ArrowDown' && current < options.length - 1) {
      e.preventDefault();
      options[current + 1].focus();
    } else if (e.key === 'ArrowUp' && current > 0) {
      e.preventDefault();
      options[current - 1].focus();
    }
  }
}
