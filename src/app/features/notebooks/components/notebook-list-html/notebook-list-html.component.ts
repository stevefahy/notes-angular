import { Component, Input, signal } from '@angular/core';
import { Notebook } from 'src/app/core/model/global';
import DateFormat from '../../../../core/lib/date-format';

@Component({
  selector: 'NotebookListHtml',
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

  notebook_item$ = signal<Notebook | null>(null);
  notebookLoaded$ = signal<boolean>(false);

  dateFormat = DateFormat;
}
