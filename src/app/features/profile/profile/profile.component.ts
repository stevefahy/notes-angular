import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserProfileComponent } from '../components/user-profile/user-profile.component';

@Component({
    selector: 'Profile',
    standalone: true,
    imports: [CommonModule, UserProfileComponent],
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent {}
