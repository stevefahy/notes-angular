import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { NoteEditorView } from 'src/app/core/model/global';
import { ViewnoteMarkdownComponent } from '../viewnote-markdown/viewnote-markdown.component';
import fm from 'front-matter';

@Component({
  selector: 'ViewNote',
  standalone: true,
  imports: [CommonModule, MatCardModule, NgxSkeletonLoaderModule, ViewnoteMarkdownComponent],
  templateUrl: './viewnote.component.html',
  styleUrls: ['./viewnote.component.scss'],
})
export class ViewnoteComponent implements NoteEditorView, OnInit {
  @Input() visible: boolean;
  @Input() splitScreen: boolean;
  @Input()
  set viewText(val: string) {
    this.content = fm(val).body;
    if (this.content !== this.contextView()) {
      this.contextView.update((prev) => this.content);
      this.hideSkeleton();
    }
  }
  @Input() updatedViewText: (updatedEdit: string) => void;

  constructor() { }

  content: string;
  contextView = signal<string>('');
  isLoaded = signal<boolean>(false);

  ngOnInit(): void { }

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
