import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import {
  NotebookCoverType,
  NotebookType,
  PageType,
} from 'src/app/core/model/global';
import { Router, RoutesRecognized } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectEdited } from 'src/app/store/selectors/notebook_edit.selector';
import { NotebookEditActions } from 'src/app/store/actions/notebook_edit.actions';

@Component({
    selector: 'Breadcrumb',
    templateUrl: './breadcrumb.component.html',
    styleUrls: ['./breadcrumb.component.scss'],
    standalone: false
})
export class BreadcrumbComponent implements OnInit, OnDestroy {
  constructor(private router: Router, private store: Store) {
    this.router.events.subscribe((event) => {
      if (event instanceof RoutesRecognized) {
        if (event.state.root.firstChild?.routeConfig?.path) {
          this.setPageLayout(event.state.root.firstChild.routeConfig.path);
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.edited$.unsubscribe();
  }

  ngOnInit(): void {}

  pageLayout = signal<PageType>('other');
  notebook = signal<NotebookType>({
    name: '',
    cover: 'default',
    id: '',
  });
  notebookLoaded = signal<boolean>(false);

  edited$ = this.store.select(selectEdited).subscribe((edited) => {
    if (edited.notebook_name !== null && edited._id !== null) {
      if (edited && edited.notebook_cover) {
        this.notebook.set({
          id: edited._id,
          name: edited.notebook_name,
          cover: edited.notebook_cover as NotebookCoverType,
        });
        this.notebookLoaded.set(true);
      }
    }
  });

  readonly resetNotebook = () => {
    this.notebook.set({
      id: '',
      name: '',
      cover: 'default',
    });
  };

  setPageLayout = (url: string) => {
    if (url === 'notebooks') {
      this.pageLayout.update(() => 'notebooks');
      this.resetNotebook();
    } else if (url === 'notebook/:notebookId') {
      this.pageLayout.update(() => 'notebook');
    } else if (url === 'notebook/:notebookId/:noteId') {
      this.pageLayout.update(() => 'note');
    } else if (url === 'profile') {
      this.pageLayout.update(() => 'profile');
    } else {
      this.pageLayout.update(() => 'other');
    }
  };

  readonly editNotebook = () => {
    this.store.dispatch(NotebookEditActions.editing({ status: true }));
  };
}
