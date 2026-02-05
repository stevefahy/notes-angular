import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

@Component({
    selector: 'SnackbarView',
    standalone: true,
    imports: [CommonModule, MatIconModule],
    templateUrl: './snackbar-view.component.html',
    styleUrls: ['./snackbar-view.component.scss'],
})
export class SnackbarViewComponent {
  data = inject(MAT_SNACK_BAR_DATA);
}
