import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuDropdownComponent } from '../ui/menu-dropdown/menu-dropdown.component';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';

@Component({
  selector: 'MainNavigation',
  standalone: true,
  imports: [
    CommonModule,
    MenuDropdownComponent, // Template uses <MenuDropdown />
    BreadcrumbComponent, // Template uses <Breadcrumb />
  ],
  templateUrl: './main-navigation.component.html',
  styleUrls: ['./main-navigation.component.scss'],
})
export class MainNavigationComponent {}
