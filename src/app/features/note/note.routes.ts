import { Routes } from '@angular/router';
import { canDeactivateGuard } from '../../core/guards/auth.guard';
import { NoteComponent } from './note/note.component';

export const noteRoutes: Routes = [
  {
    path: '',
    component: NoteComponent,
    canDeactivate: [canDeactivateGuard],
  },
];
