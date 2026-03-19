import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class EditNotesService {
  active = signal(false);
  selectedCount = signal(0);

  showPill = computed(() => this.active() && this.selectedCount() > 0);

  set(active: boolean, count: number): void {
    this.active.set(active);
    this.selectedCount.set(count);
  }

  clear(): void {
    this.active.set(false);
    this.selectedCount.set(0);
  }
}
