import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { ViewnoteMarkdownComponent } from '../viewnote-markdown/viewnote-markdown.component';
import fm from 'front-matter';

@Component({
  selector: 'ViewNoteThumb',
  standalone: true,
  imports: [CommonModule, NgxSkeletonLoaderModule, ViewnoteMarkdownComponent],
  templateUrl: './viewnotethumb.component.html',
  styleUrls: ['./viewnotethumb.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewnotethumbComponent implements OnInit {
  @Input()
  set text(val: string) {
    this.content = fm(val).body;
    this.hideSkeleton();
  }
  @Input() updatedViewText: (updatedEdit: string) => void;

  isLoaded = signal<boolean>(false);

  content: string;
  updateViewText: (updatedEdit: string) => void;

  ngOnInit(): void { }

  loadedTimer: NodeJS.Timeout;
  hideSkeleton = () => {
    this.loadedTimer = setTimeout(() => {
      this.isLoaded.set(true);
      clearTimeout(this.loadedTimer);
    }, 600);
  };
}
