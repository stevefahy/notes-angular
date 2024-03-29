import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NotebooksComponent } from './notebooks/notebooks.component';

const routes: Routes = [
  {
    path: '',
    component: NotebooksComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NotebooksRoutingModule {}
