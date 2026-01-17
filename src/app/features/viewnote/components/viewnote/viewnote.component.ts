import { Component, Input, OnInit, signal } from '@angular/core';
import { NoteEditorView } from 'src/app/core/model/global';
import * as matter from 'gray-matter';

// Required for gray-matter library
(window as any).global = window;
global.Buffer = global.Buffer || require('buffer').Buffer;
(window as any).process = {
  version: '',
};

@Component({
  selector: 'ViewNote',
  templateUrl: './viewnote.component.html',
  styleUrls: ['./viewnote.component.scss'],
})
export class ViewnoteComponent implements NoteEditorView, OnInit {
  @Input() visible: boolean;
  @Input() splitScreen: boolean;
  @Input()
  set viewText(val: string) {
    this.content = matter(val).content;
    if (this.content !== this.contextView()) {
      this.contextView.update((prev) => this.content);
      this.hideSkeleton();
    }
  }
  @Input() updatedViewText: (updatedEdit: string) => void;

  constructor() {}

  content: string;
  contextView = signal<string>('');
  isLoaded = signal<boolean>(false);

  ngOnInit(): void {}

  loadedTimer: NodeJS.Timeout;
  hideSkeleton = () => {
    this.loadedTimer = setTimeout(() => {
      this.isLoaded.set(true);
      clearTimeout(this.loadedTimer);
    }, 300);
  };

  readonly updateViewText = (a: any) => {
    this.updatedViewText(a);
  };
}
