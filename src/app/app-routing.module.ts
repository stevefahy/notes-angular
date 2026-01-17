import { NgModule } from '@angular/core';
import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { PageNotFoundComponent } from './core/components/page-not-found/page-not-found.component';
import { AuthGuardService as authGuard } from './core/services/auth-guard.service';

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () =>
      import('./features/login/login.module').then((m) => m.LoginModule),
  },
  {
    path: 'profile',
    loadChildren: () =>
      import('./features/profile/profile.module').then((m) => m.ProfileModule),
    canActivate: [authGuard],
  },
  {
    path: 'notebooks',
    loadChildren: () =>
      import('./features/notebooks/notebooks.module').then(
        (m) => m.NotebooksModule
      ),
    canActivate: [authGuard],
  },
  {
    path: 'notebook/:notebookId',
    loadChildren: () =>
      import('./features/notebook/notebook.module').then(
        (m) => m.NotebookModule
      ),
    canActivate: [authGuard],
  },
  {
    path: 'notebook/:notebookId/:noteId',
    loadChildren: () =>
      import('./features/note/note.module').then((m) => m.NoteModule),
    canActivate: [authGuard],
    canDeactivate: [authGuard],
  },
  { path: '', redirectTo: '/notebooks', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent },
];

const routerOptions: ExtraOptions = {
  useHash: false,
  anchorScrolling: 'enabled',
  scrollPositionRestoration: 'enabled',
  onSameUrlNavigation: 'reload', //Must have if you want to be able to use the anchor more than once
};

@NgModule({
  imports: [RouterModule.forRoot(routes, routerOptions)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
