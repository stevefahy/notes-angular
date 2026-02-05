import { Routes } from '@angular/router';
import { authGuard, canDeactivateGuard } from './core/guards/auth.guard';
import { PageNotFoundComponent } from './core/components/page-not-found/page-not-found.component';

export const routes: Routes = [
  {
    path: 'login',
    loadChildren: () =>
      import('./features/login/login.routes').then((m) => m.loginRoutes),
  },
  {
    path: 'profile',
    loadChildren: () =>
      import('./features/profile/profile.routes').then((m) => m.profileRoutes),
    canActivate: [authGuard],
  },
  {
    path: 'notebooks',
    loadChildren: () =>
      import('./features/notebooks/notebooks.routes').then(
        (m) => m.notebooksRoutes,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'notebook/:notebookId',
    loadChildren: () =>
      import('./features/notebook/notebook.routes').then(
        (m) => m.notebookRoutes,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'notebook/:notebookId/:noteId',
    loadChildren: () =>
      import('./features/note/note.routes').then((m) => m.noteRoutes),
    canActivate: [authGuard],
    canDeactivate: [canDeactivateGuard],
  },
  { path: '', redirectTo: '/notebooks', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent },
];
