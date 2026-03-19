import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import APPLICATION_CONSTANTS from 'src/app/core/application-constants/application-constants';
import { AuthService } from '../../../services/auth.service';
import { IAuthContext, IAuthDetails } from 'src/app/core/model/global';
import { Subject, takeUntil } from 'rxjs';

const AC = APPLICATION_CONSTANTS;

@Component({
  selector: 'MenuDropdown',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './menu-dropdown.component.html',
  styleUrls: ['./menu-dropdown.component.scss'],
  animations: [
    trigger('slideMenu', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-8px)' }),
        animate('150ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
        animate('100ms ease-in', style({ opacity: 0, transform: 'translateY(-4px)' })),
      ]),
    ]),
  ],
})
export class MenuDropdownComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);

  open = signal(false);
  rippleKey = signal(0);

  loading: boolean | null;
  success: boolean | null;
  details: IAuthDetails | null;
  onLogout: () => void;

  private onDestroy$ = new Subject<void>();

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  ngOnInit(): void {
    this.authService.authContext$
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((res: IAuthContext) => {
        this.updateContext(res);
      });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: MouseEvent): void {
    if (this.open() && !(e.target instanceof Element && (e.target as Element).closest('.dropdown'))) {
      this.open.set(false);
    }
  }

  updateContext = (context: IAuthContext) => {
    this.loading = context.loading;
    this.success = context.success;
    this.details = context.details;
    this.onLogout = context.onLogout;
  };

  toggleMenu = (): void => {
    this.open.update((v) => !v);
    if (this.open()) {
      this.rippleKey.update((k) => k + 1);
    }
  };

  onTriggerKeydown = (e: KeyboardEvent): void => {
    if (e.key === 'Escape') {
      this.open.set(false);
    }
  };

  handleProfile = async (event: Event): Promise<void> => {
    event.preventDefault();
    this.open.set(false);
    this.router.navigate(['/profile']);
  };

  loginHandler = async (event: Event): Promise<void> => {
    event.preventDefault();
    this.open.set(false);
    this.router.navigate([AC.LOGIN_PAGE]);
  };
}
