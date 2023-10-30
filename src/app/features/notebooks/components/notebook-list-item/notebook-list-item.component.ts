import {
  Component,
  Input,
  OnInit,
  signal,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { Notebook, NotebookItem } from 'src/app/core/model/global';
import DateFormat from '../../../../core/lib/date-format';

@Component({
  selector: 'NotebookListItem',
  templateUrl: './notebook-list-item.component.html',
  styleUrls: ['../../styles_shared/notebook-list-shared-css.scss'],
})
export class NotebookListItemComponent
  implements NotebookItem, OnInit, OnChanges
{
  @Input() notebook_item: Notebook;

  notebookLoaded = signal<boolean>(false);

  ngOnChanges(changes: SimpleChanges) {
    if (changes['notebook_item']) {
      this.hideSkeleton();
    }
  }

  dateFormat = DateFormat;

  loadedTimer: NodeJS.Timeout;
  hideSkeleton = () => {
    this.loadedTimer = setTimeout(() => {
      this.notebookLoaded.set(true);
      clearTimeout(this.loadedTimer);
    }, 300);
  };

  ngOnInit() {}
}
