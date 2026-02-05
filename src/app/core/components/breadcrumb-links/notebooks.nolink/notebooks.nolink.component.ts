import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'NotebooksNolink',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notebooks.nolink.component.html',
  styleUrls: [
    './notebooks.nolink.component.scss',
    '../../breadcrumb/breadcrumb.component.scss',
  ],
})
export class NotebooksNolinkComponent {}
