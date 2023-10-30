import {
  Component,
  Input,
  OnInit,
  signal,
  INJECTOR,
  inject,
  runInInjectionContext,
  ChangeDetectionStrategy,
  OnDestroy,
} from '@angular/core';
import {
  Note,
  NotesProps,
  SelectedNote,
  CheckedNote,
} from 'src/app/core/model/global';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable, of, Subject, takeUntil } from 'rxjs';
import DateFormat from 'src/app/core/lib/date-format';

@Component({
  selector: 'NoteList',
  templateUrl: './note-list.component.html',
  styleUrls: ['./note-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoteListComponent implements NotesProps, OnInit, OnDestroy {
  @Input()
  set notes(val: Note[]) {
    this.userNotes.set(val);
    const props_notes = val;
    if (props_notes) {
      // Set the initial notes array
      this.userNotes.update((prev) => {
        let newarray: Note[] = props_notes;
        return newarray;
      });
      let newarray: CheckedNote[] = [];
      props_notes.forEach((note) => {
        // Set the checkboxes initial value to false
        this.isChecked.update((prev) => {
          let newnote = { id: note._id, selected: false };
          newarray.push(newnote);
          return newarray;
        });
      });
    }
  }
  @Input() onNotesSelected: (selected: SelectedNote) => void;
  @Input() onNotesEdit: boolean;
  @Input() onClearNotesEdit: boolean;

  dateFormat = DateFormat;

  userNotes = signal<Note[] | []>([]);
  isChecked = signal<CheckedNote[]>([]);
  isSelected = signal<SelectedNote>({ selected: [] });

  onClearNotesEdit$: Observable<boolean>;
  isSelected$: Observable<SelectedNote>;

  private injector = inject(INJECTOR);

  onDestroy$: Subject<void> = new Subject();

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  ngOnInit(): void {
    // Effects
    runInInjectionContext(this.injector, () => {
      this.isSelected$ = toObservable(this.isSelected);
      this.isSelected$
        .pipe(takeUntil(this.onDestroy$))
        .subscribe((isSelected) => {
          if (isSelected) {
            this.onNotesSelected(isSelected);
          }
        });
    });

    this.onClearNotesEdit$ = of(this.onClearNotesEdit);
    this.onClearNotesEdit$
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((onClearNotesEdit: boolean) => {
        if (onClearNotesEdit) {
          this.isSelected.update((state) => {
            return { ...state, selected: [] };
          });
        }
      });
  }

  trackuserNotes = (index: number, note: Note) => {
    return note ? note._id : undefined;
  };

  updateCheckbox = (checked_id: string, checked: boolean) => {
    this.isChecked.update((prev) => {
      // Update the checkbox selected status for each note
      let newarray: CheckedNote[] = [...prev];
      const is = this.isChecked()?.findIndex((x) => x.id === checked_id);
      if (is >= 0 && newarray.length > 0) {
        newarray[is].selected = checked;
      }
      return newarray;
    });

    this.isSelected.update((state) => {
      // Replace the selected note array with the currently selected notes
      let newarray: SelectedNote = { selected: [] };
      this.isChecked()?.forEach((x) => {
        if (x.selected) {
          newarray.selected.push(x.id);
        }
      });
      return { ...state, selected: newarray.selected };
    });
  };

  checkboxStatus = (event: Event) => {
    const target = event.currentTarget! as HTMLInputElement;
    const { checked } = target;
    const checked_id = target.value;
    this.updateCheckbox(checked_id, checked);
  };

  divStatus = (id: any) => {
    const target: HTMLInputElement = document.getElementById(
      `input_${id}`
    ) as HTMLInputElement;
    let { checked } = target;
    const checked_id = target.value;
    target.checked = !checked;
    checked = target.checked;
    this.updateCheckbox(checked_id, checked);
  };

  NoteLinkHandler = (event: Event) => {
    if (this.onNotesEdit) {
      event.preventDefault();
    }
  };

  EditLinkHandler = (noteid: string) => {
    if (this.onNotesEdit) {
      this.divStatus(noteid);
    }
  };
}
