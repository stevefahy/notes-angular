import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SnackService } from '../../services/snack.service';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'RouteLoadError',
  standalone: true,
  imports: [CommonModule, RouterLink, FooterComponent],
  templateUrl: './route-load-error.component.html',
  styleUrls: ['./route-load-error.component.scss'],
})
export class RouteLoadErrorComponent implements OnInit {
  private snack = inject(SnackService);

  ngOnInit(): void {
    this.snack.showErrorSnack('Unable to load this page. Please try again.', false);
  }

  retry(): void {
    window.location.reload();
  }
}
