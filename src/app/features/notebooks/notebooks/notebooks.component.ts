import { Component, OnDestroy, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  GetNotebooks,
  IAuthContext,
  Notebook,
} from '../../../core/model/global';
import { AuthService } from '../../../core/services/auth.service';
import { Store } from '@ngrx/store';
import { SnackService } from '../../../core/services/snack.service';
import { getNotebooks } from '../../../core/helpers/getNotebooks';
import { Subject, takeUntil } from 'rxjs';
import { LoadingScreenComponent } from '../../../core/components/ui/loading-screen/loading-screen.component';
import { NotebookslistComponent } from '../components/notebookslist/notebookslist.component';

@Component({
  selector: 'Notebooks',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LoadingScreenComponent,
    NotebookslistComponent,
  ],
  templateUrl: './notebooks.component.html',
  styleUrls: ['./notebooks.component.scss'],
})
export class NotebooksComponent implements OnInit, OnDestroy {
  notebooksLoaded = signal<boolean>(false);
  loadError = signal<string | null>(null);
  userNotebooks = signal<GetNotebooks>({ success: false, notebooks: [] });

  loading: boolean | null;
  token: string | null;

  private authService = inject(AuthService);
  private store = inject(Store);
  private snack = inject(SnackService);

  onDestroy$: Subject<void> = new Subject();

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  ngOnInit(): void {
    this.authService.authContext$
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((res: IAuthContext) => {
        this.updateContext(res);
        this.loadNotebooks();
      });
  }

  updateContext = (context: IAuthContext) => {
    this.loading = context.loading;
    this.token = context.token;
  };

  readonly showErrorSnack = (err: unknown, fromServer = false) => {
    this.snack.showErrorSnack(err, fromServer);
  };

  onNotebookAdded = (notebook: Notebook) => {
    const current = this.userNotebooks();
    if (current.success && current.notebooks) {
      this.userNotebooks.set({
        success: true,
        notebooks: [notebook, ...current.notebooks],
      });
    }
  };

  // Get the Notebooks
  loadNotebooks = async () => {
    if (!this.notebooksLoaded() && !this.loadError() && this.token) {
      try {
        const response = await getNotebooks(this.token);
        if (response.error) {
          this.loadError.set(response.error);
          this.showErrorSnack(response.error, response.fromServer === true);
          this.notebooksLoaded.set(true);
          return;
        }
        if (response.success) {
          this.userNotebooks.set(response);
          this.filterNotebooks();
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err ?? '');
        this.loadError.set(msg);
        this.showErrorSnack(err, false);
        this.notebooksLoaded.set(true);
        return;
      }
    }
  };

  // Filter Notebooks
  filterNotebooks = async () => {
    const notebooks_found = this.userNotebooks().notebooks;
    const error_found = this.userNotebooks().error;
    if (notebooks_found && notebooks_found.length > 0) {
      // Set an old date for those notes without any updatedAt
      notebooks_found.map((x) => {
        if (x.updatedAt === 'No date' || undefined) {
          x.updatedAt = 'December 17, 1995 03:24:00';
        }
        return x;
      });
      // Sort the notebooks by updatedAt
      notebooks_found
        .sort((a, b) => {
          if (a.updatedAt !== undefined && b.updatedAt !== undefined) {
            return new Date(a.updatedAt) > new Date(b.updatedAt) ? 1 : -1;
          } else {
            return a.updatedAt !== undefined ? 1 : -1;
          }
        })
        .reverse();
      this.userNotebooks.set({ success: true, notebooks: notebooks_found });
      this.notebooksLoaded.set(true);
    }
    if (error_found) {
      const response = this.userNotebooks();
      const fromServer =
        'fromServer' in response && response.fromServer === true;
      this.showErrorSnack(error_found, fromServer);
    }
  };
}
