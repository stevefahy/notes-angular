import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, RoutesRecognized } from '@angular/router';
import {
  NotebookCoverType,
  NotebookType,
  PageType,
} from 'src/app/core/model/global';
import { mapLegacyCover } from 'src/app/core/lib/folder-options';
import { Store } from '@ngrx/store';
import { selectEdited } from 'src/app/store/selectors/notebook_edit.selector';
import { NotebookEditActions } from 'src/app/store/actions/notebook_edit.actions';
import { Subscription, takeUntil, Subject } from 'rxjs';
import { NotebooksLinkComponent } from '../breadcrumb-links/notebooks.link/notebooks.link.component';
import { NotebooksNolinkComponent } from '../breadcrumb-links/notebooks.nolink/notebooks.nolink.component';

@Component({
  selector: 'Breadcrumb',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NotebooksLinkComponent,
    NotebooksNolinkComponent,
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
    this.syncPageLayoutFromUrl(this.router.url);

    // Lazy-loaded routes often expose an empty `path` on the first child, so
    // `firstChild.routeConfig.path` is falsy and pageLayout never leaves 'other'.
    this.routerEventsSubscription = this.router.events.subscribe((event) => {
      if (event instanceof RoutesRecognized) {
        this.syncPageLayoutFromUrl(event.url);
      }
    });

    // Subscribe to store with proper cleanup
    this.store
      .select(selectEdited)
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((edited) => {
        if (edited.notebook_name !== null && edited._id !== null) {
          const cover = (edited.notebook_cover ||
            'default') as NotebookCoverType;
          this.notebook.set({
            id: edited._id,
            name: edited.notebook_name,
            cover,
          });
          this.notebookLoaded.set(true);
        }
      });
  }

  /** Derive breadcrumb mode from the URL (works with lazy children where routeConfig.path is ''). */
  private syncPageLayoutFromUrl(rawUrl: string): void {
    const path = rawUrl.split('?')[0].split('#')[0];
    const segments = path.split('/').filter((s) => s.length > 0);

    if (segments[0] === 'notebooks' && segments.length === 1) {
      this.setPageLayout('notebooks');
    } else if (segments[0] === 'notebook' && segments.length === 2) {
      this.setPageLayout('notebook/:notebookId');
    } else if (segments[0] === 'notebook' && segments.length === 3) {
      this.setPageLayout('notebook/:notebookId/:noteId');
    } else if (segments[0] === 'profile') {
      this.setPageLayout('profile');
    } else {
      this.setPageLayout('other');
    }
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

  readonly mapLegacyCover = mapLegacyCover;
}
