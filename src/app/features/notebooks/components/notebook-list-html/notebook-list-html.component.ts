import { Component, Input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { Notebook } from 'src/app/core/model/global';
import DateFormat from '../../../../core/lib/date-format';
import {
  mapLegacyCover,
  type NotebookCoverType,
} from '../../../../core/lib/folder-options';

@Component({
  selector: 'NotebookListHtml',
  standalone: true,
  imports: [CommonModule, NgxSkeletonLoaderModule],
  templateUrl: './notebook-list-html.component.html',
  styleUrls: ['../../styles_shared/notebook-list-shared-css.scss'],
})
export class NotebookListHtmlComponent {
  @Input()
  set notebookLoaded(val: boolean) {
    this.notebookLoaded$.set(val);
  }
  @Input()
  set notebook_item(val: Notebook | null) {
    if (val !== null) {
      this.notebook_item$.set(val);
    }
  }
  @Input() noteCount?: number;

  notebook_item$ = signal<Notebook | null>(null);
  notebookLoaded$ = signal<boolean>(false);

  displayCover = computed((): NotebookCoverType => {
    const item = this.notebook_item$();
    return item ? mapLegacyCover(item.notebook_cover) : 'sage';
  });

  dateFormat = DateFormat;
}
