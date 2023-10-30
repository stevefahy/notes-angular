import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/core/material.module';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { ViewnotethumbComponent } from './components/viewnotethumb/viewnotethumb.component';
import { ViewnoteMarkdownComponent } from './components/viewnote-markdown/viewnote-markdown.component';
import { EscapeHtmlPipe } from '../../core/pipes/keep-html.pipe';
import { ViewnoteComponent } from './components/viewnote/viewnote.component';

@NgModule({
  declarations: [
    ViewnoteComponent,
    ViewnoteMarkdownComponent,
    ViewnotethumbComponent,
    EscapeHtmlPipe,
  ],
  imports: [CommonModule, MaterialModule, NgxSkeletonLoaderModule],
  exports: [
    ViewnoteComponent,
    ViewnoteMarkdownComponent,
    ViewnotethumbComponent,
    EscapeHtmlPipe,
  ],
})
export class ViewNoteModule {}
