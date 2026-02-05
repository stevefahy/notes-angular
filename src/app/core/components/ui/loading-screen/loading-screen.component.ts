import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
    selector: 'LoadingScreen',
    standalone: true,
    imports: [CommonModule, MatProgressSpinnerModule],
    templateUrl: './loading-screen.component.html',
    styleUrls: ['./loading-screen.component.scss'],
})
export class LoadingScreenComponent {}
