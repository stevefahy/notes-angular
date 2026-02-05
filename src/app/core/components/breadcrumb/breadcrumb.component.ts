import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, RoutesRecognized } from '@angular/router';
import {
  NotebookCoverType,
  NotebookType,
  PageType,
} from 'src/app/core/model/global';
import { Store } from '@ngrx/store';
import { selectEdited } from 'src/app/store/selectors/notebook_edit.selector';
import { NotebookEditActions } from 'src/app/store/actions/notebook_edit.actions';
import { Subscription, takeUntil, Subject } from 'rxjs';
import { NotebooksLinkComponent } from '../breadcrumb-links/notebooks.link/notebooks.link.component';
import { NotebooksNolinkComponent } from '../breadcrumb-links/notebooks.nolink/notebooks.nolink.component';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'Breadcrumb',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NotebooksLinkComponent,
    NotebooksNolinkComponent,
    MatButtonModule,
  ],
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss'],
})
export class BreadcrumbComponent implements OnInit, OnDestroy {
  constructor(
    private router: Router,
    private store: Store,
  ) {}

  private routerEventsSubscription: Subscription;
  private onDestroy$ = new Subject<void>();

  ngOnDestroy(): void {
    if (this.routerEventsSubscription) {
      this.routerEventsSubscription.unsubscribe();
    }
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  ngOnInit(): void {
    // Subscribe to router events
    this.routerEventsSubscription = this.router.events.subscribe((event) => {
      if (event instanceof RoutesRecognized) {
        if (event.state.root.firstChild?.routeConfig?.path) {
          this.setPageLayout(event.state.root.firstChild.routeConfig.path);
        }
      }
    });

    // Subscribe to store with proper cleanup
    this.store
      .select(selectEdited)
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((edited) => {
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
  }

  pageLayout = signal<PageType>('other');
  notebook = signal<NotebookType>({
    name: '',
    cover: 'default',
    id: '',
  });
  notebookLoaded = signal<boolean>(false);

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
