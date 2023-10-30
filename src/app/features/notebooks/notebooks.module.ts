import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotebooksComponent } from './notebooks/notebooks.component';
import { NotebooksRoutingModule } from './notebooks-routing.module';
import { CoreModule } from '../../core/core.module';
import { NotebookslistComponent } from './components/notebookslist/notebookslist.component';
import { NotebookListItemComponent } from './components/notebook-list-item/notebook-list-item.component';
import { NotebookListHtmlComponent } from './components/notebook-list-html/notebook-list-html.component';
import { MaterialModule } from '../../core/material.module';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { ViewNoteModule } from '../viewnote/viewnote.module';

@NgModule({
  declarations: [
    NotebooksComponent,
    NotebookslistComponent,
    NotebookListItemComponent,
    NotebookListHtmlComponent,
  ],
  imports: [
    CommonModule,
    NotebooksRoutingModule,
    CoreModule,
    MaterialModule,
    NgxSkeletonLoaderModule,
    ViewNoteModule,
  ],
})
export class NotebooksModule {}
