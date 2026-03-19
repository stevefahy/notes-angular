import { Component, signal, OnDestroy, OnInit, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectSnack } from 'src/app/store/selectors/snack.selector';
import { Snack } from 'src/app/store/models/snack.model';
import { SnackbarViewComponent } from '../ui/snackbar-view/snackbar-view.component';
import { CommonModule } from '@angular/common';
import { MainNavigationComponent } from '../main-navigation/main-navigation.component';
import { Subject, takeUntil } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

// Set the CSS variable --jsvh (Javascript Vertical Height)
const setScreenHeight = () => {
  const jsvh = window?.innerHeight;
  const headerEl = document.getElementById('header_height');
  const header_height = headerEl?.getBoundingClientRect().height ?? 0;
  document?.documentElement.style.setProperty('--jsvh', `${jsvh}px`);
  document?.documentElement.style.setProperty('--jsheader-height', `${header_height}`);
};

@Component({
  selector: 'Layout',
  standalone: true,
  imports: [CommonModule, MainNavigationComponent, SnackbarViewComponent],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent implements OnDestroy, OnInit {
  private store = inject(Store);
  private router = inject(Router);
  private onDestroy$ = new Subject<void>();

  private resizeListener: () => void;

  isLoginPage = signal(false);

  private checkLoginPage = () => {
    const url = this.router.url;
    this.isLoginPage.set(url === '/login' || url.startsWith('/login'));
  };

  ngOnDestroy(): void {
    if (this.resizeListener && window) {
      window.removeEventListener('resize', this.resizeListener);
    }
    this.snack$.unsubscribe();
  }

  ngOnInit(): void {
    this.checkLoginPage();

    const runSetScreenHeight = () => {
      if (!this.isLoginPage()) {
        setTimeout(setScreenHeight, 0);
      }
    };
    runSetScreenHeight();

    this.resizeListener = () => {
      this.checkLoginPage();
      runSetScreenHeight();
    };
    window?.addEventListener('resize', this.resizeListener);

    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntil(this.onDestroy$)
      )
      .subscribe(() => {
        this.checkLoginPage();
        runSetScreenHeight();
      });
  }

  snackbar = signal<Snack | null>(null);

  snack$ = this.store.select(selectSnack).subscribe((res) => {
    this.snackbar.set(res);
  });
}
