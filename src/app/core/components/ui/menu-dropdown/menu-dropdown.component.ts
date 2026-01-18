import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import APPLICATION_CONSTANTS from 'src/app/core/application-constants/application-constants';
import { IAuthContext, IAuthDetails } from 'src/app/core/model/global';
import { Subject, takeUntil } from 'rxjs';

const AC = APPLICATION_CONSTANTS;

@Component({
    selector: 'MenuDropdown',
    templateUrl: './menu-dropdown.component.html',
    styleUrls: ['./menu-dropdown.component.scss'],
    standalone: false
})
export class MenuDropdownComponent implements OnInit, OnDestroy {
  constructor(private authService: AuthService, private router: Router) {}

  loading: boolean | null;
  success: boolean | null;
  details: IAuthDetails | null;
  onLogout: () => void;

  onDestroy$: Subject<void> = new Subject();

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
