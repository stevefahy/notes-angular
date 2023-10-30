import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

@Component({
  selector: 'SnackbarView',
  templateUrl: './snackbar-view.component.html',
  styleUrls: ['./snackbar-view.component.scss'],
})
export class SnackbarViewComponent {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) {}
}
