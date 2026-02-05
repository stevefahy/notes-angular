import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'NotebooksLink',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './notebooks.link.component.html',
  styleUrls: [
    './notebooks.link.component.scss',
    '../../breadcrumb/breadcrumb.component.scss',
  ],
})
export class NotebooksLinkComponent {}
