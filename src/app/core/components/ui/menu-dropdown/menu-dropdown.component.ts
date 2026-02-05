import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import APPLICATION_CONSTANTS from 'src/app/core/application-constants/application-constants';
import { AuthService } from '../../../services/auth.service';
import { IAuthContext, IAuthDetails } from 'src/app/core/model/global';
import { Subject, takeUntil } from 'rxjs';

const AC = APPLICATION_CONSTANTS;

@Component({
  selector: 'MenuDropdown',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
  ],
  templateUrl: './menu-dropdown.component.html',
  styleUrls: ['./menu-dropdown.component.scss'],
})
export class MenuDropdownComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);

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

  updateContext = (context: IAuthContext) => {
    this.loading = context.loading;
    this.success = context.success;
    this.details = context.details;
    this.onLogout = context.onLogout;
  };

  handleProfile = async (event: Event) => {
    event.preventDefault();
    this.router.navigate([`/profile`]);
  };

  loginHandler = async (event: Event) => {
    event.preventDefault();
    this.router.navigate([`${AC.LOGIN_PAGE}`]);
  };
}
