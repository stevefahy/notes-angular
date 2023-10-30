import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NoteRoutingModule } from './note-routing.module';
import { NoteComponent } from './note/note.component';
import { CoreModule } from '../../core/core.module';
import { MaterialModule } from '../../core/material.module';
import { EditnoteComponent } from './componets/editnote/editnote.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { ViewNoteModule } from '../viewnote/viewnote.module';

@NgModule({
  declarations: [NoteComponent, EditnoteComponent],
  imports: [
    CommonModule,
    NoteRoutingModule,
    CoreModule,
    MaterialModule,
    NgxSkeletonLoaderModule,
    ViewNoteModule,
  ],
})
export class NoteModule {}
