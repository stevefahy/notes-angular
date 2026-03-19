import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { PageNotFoundComponent } from './core/components/page-not-found/page-not-found.component';
import { RouteLoadErrorComponent } from './core/components/route-load-error/route-load-error.component';

const loadWithFallback = (loadFn: () => Promise<Routes>) => () =>
  loadFn().catch(() => [{ path: '', component: RouteLoadErrorComponent }]);

export const routes: Routes = [
  {
    path: 'login',
    loadChildren: loadWithFallback(() =>
      import('./features/login/login.routes').then((m) => m.loginRoutes),
    ),
  },
  {
    path: 'profile',
    loadChildren: loadWithFallback(() =>
      import('./features/profile/profile.routes').then((m) => m.profileRoutes),
    ),
    canActivate: [authGuard],
  },
  {
    path: 'notebooks',
    loadChildren: loadWithFallback(() =>
      import('./features/notebooks/notebooks.routes').then(
        (m) => m.notebooksRoutes,
      ),
    ),
    canActivate: [authGuard],
  },
  {
    path: 'notebook/:notebookId',
    loadChildren: loadWithFallback(() =>
      import('./features/notebook/notebook.routes').then(
        (m) => m.notebookRoutes,
      ),
    ),
    canActivate: [authGuard],
  },
  {
    path: 'notebook/:notebookId/:noteId',
    loadChildren: loadWithFallback(() =>
      import('./features/note/note.routes').then((m) => m.noteRoutes),
    ),
    canActivate: [authGuard],
  },
  { path: '', redirectTo: '/notebooks', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent },
];
