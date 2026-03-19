import { Component, Input, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'SnackbarView',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './snackbar-view.component.html',
  styleUrls: ['./snackbar-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SnackbarViewComponent {
  @Input() set snack(val: { n_status: boolean | null; message: string | null; variant?: 'success' | 'error' | 'warning' } | null) {
    if (val?.n_status && val?.message) {
      this.message.set(val.message);
      this.variant.set(val.variant ?? 'success');
      this.visible.set(true);
      if (this.timer) clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.visible.set(false);
        this.timer = null;
      }, 4000);
    }
  }

  message = signal('');
  variant = signal<'success' | 'error' | 'warning'>('success');
  visible = signal(false);
  private timer: ReturnType<typeof setTimeout> | null = null;
}
