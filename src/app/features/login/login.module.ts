import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/core/material.module';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { LoginPageComponent } from './login-page/login-page.component';
import { LoginRoutingModule } from './login-routing.module';

@NgModule({
  declarations: [LoginPageComponent],
  imports: [
    CommonModule,
    MaterialModule,
    NgxSkeletonLoaderModule,
    LoginRoutingModule,
  ],
})
export class LoginModule {}
