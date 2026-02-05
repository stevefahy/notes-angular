import {
  Component,
  Input,
  OnInit,
  signal,
  ViewChild,
  AfterViewInit,
  ElementRef,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { NoteEditor } from 'src/app/core/model/global';

@Component({
    selector: 'EditNote',
    standalone: true,
    imports: [CommonModule, MatCardModule],
    templateUrl: './editnote.component.html',
    styleUrls: ['./editnote.component.scss'],
})
export class EditnoteComponent
  implements NoteEditor, OnInit, AfterViewInit, OnChanges
{
  @Input() visible: boolean;
  @Input() splitScreen: boolean;
  @Input() loadedText: string;
  @Input() updateViewText: (updatedView: string) => void;
  @Input()
  set passUpdatedViewText(updatedViewText: string) {
    if (this.noteInputRef && this.noteInputRef.nativeElement) {
      const current_edit_text = this.noteInputRef.nativeElement.innerText;
      if (current_edit_text !== updatedViewText) {
        this.noteInputRef.nativeElement.innerText = updatedViewText;
      }
    }
  }

  @ViewChild('noteInputRef') noteInputRef!: ElementRef<HTMLDivElement>;

  isVisible = signal<boolean>(false);
  isSplitscreen = signal<boolean>(false);

  ngOnChanges(changes: SimpleChanges) {
    if (changes['visible']) {
      this.isVisible.set(changes['visible'].currentValue);
    }
    if (changes['splitScreen']) {
      this.isSplitscreen.set(changes['splitScreen'].currentValue);
    }
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    if (this.loadedText === '' && this.noteInputRef.nativeElement) {
      this.noteInputRef.nativeElement.focus();
    }

    if (this.loadedText && this.noteInputRef.nativeElement) {
      this.noteInputRef.nativeElement.innerText = this.loadedText;
    }
  }

  readonly setText = (event: Event) => {
    this.updateViewText((event.currentTarget as HTMLDivElement).innerText);
  };
}
