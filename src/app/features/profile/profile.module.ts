import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileComponent } from './profile/profile.component';
import { CoreModule } from '../../core/core.module';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { ProfileFormComponent } from './components/profile-form/profile-form.component';
import { MaterialModule } from '../../core/material.module';

@NgModule({
  declarations: [ProfileComponent, UserProfileComponent, ProfileFormComponent],
  imports: [CommonModule, ProfileRoutingModule, CoreModule, MaterialModule],
})
export class ProfileModule {}
