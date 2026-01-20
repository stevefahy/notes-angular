import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  signal,
} from '@angular/core';
import matter from 'gray-matter';
import { Buffer } from 'buffer';

// Required for gray-matter library
(window as any).global = window;
global.Buffer = global.Buffer || Buffer;
(window as any).process = {
  version: '',
};

@Component({
  selector: 'ViewNoteThumb',
  templateUrl: './viewnotethumb.component.html',
  styleUrls: ['./viewnotethumb.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class ViewnotethumbComponent implements OnInit {
  @Input()
  set text(val: string) {
    this.content = matter(val).content;
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
