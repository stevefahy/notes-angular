import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuDropdownComponent } from '../ui/menu-dropdown/menu-dropdown.component';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { EditNotesService } from '../../services/edit-notes.service';

@Component({
  selector: 'MainNavigation',
  standalone: true,
  imports: [
    CommonModule,
    MenuDropdownComponent,
    BreadcrumbComponent,
  ],
  templateUrl: './main-navigation.component.html',
  styleUrls: ['./main-navigation.component.scss'],
})
export class MainNavigationComponent {
  editNotesService = inject(EditNotesService);
}
