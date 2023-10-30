import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotebookRoutingModule } from './notebook-routing.module';
import { NotebookComponent } from './notebook/notebook.component';
import { CoreModule } from '../../core/core.module';
import { NoteListComponent } from './components/note-list/note-list.component';
import { MaterialModule } from '../../core/material.module';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { ViewNoteModule } from '../viewnote/viewnote.module';

@NgModule({
  declarations: [NotebookComponent, NoteListComponent],
  imports: [
    CommonModule,
    NotebookRoutingModule,
    CoreModule,
    MaterialModule,
    NgxSkeletonLoaderModule,
    ViewNoteModule,
  ],
})
export class NotebookModule {}
