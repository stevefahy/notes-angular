import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root',
})
export class AuthGuardService {
  public jwtHelper: JwtHelperService = new JwtHelperService();
  constructor(public auth: AuthService, public router: Router) {}

  public async canActivate(): Promise<boolean> {
    const token = await this.auth.authGuardVerify();
    if (!token) {
      this.router.navigate(['login']);
      return false;
    }
    return token;
  }

  deactivate = true;

  canDeactivate(): boolean {
    return this.deactivate;
  }
}
