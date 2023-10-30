import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from './components/layout/layout.component';
import { MainNavigationComponent } from './components/main-navigation/main-navigation.component';
import { SnackbarViewComponent } from './components/ui/snackbar-view/snackbar-view.component';
import { NotificationViewComponent } from './components/ui/notification-view/notification-view.component';
import { MaterialModule } from 'src/app/core/material.module';
import { MenuDropdownComponent } from './components/ui/menu-dropdown/menu-dropdown.component';
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { RouterModule } from '@angular/router';
import { NotebooksLinkComponent } from './components/breadcrumb-links/notebooks.link/notebooks.link.component';
import { NotebooksNolinkComponent } from './components/breadcrumb-links/notebooks.nolink/notebooks.nolink.component';
import { LoadingScreenComponent } from './components/ui/loading-screen/loading-screen.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { FooterComponent } from './components/footer/footer.component';
import { AddNotebookFormComponent } from '../features/notebooks/components/add-notebook-form/add-notebook-form.component';
import { SelectNotebookFormComponent } from '../features/notebook/components/select-notebook-form/select-notebook-form.component';

@NgModule({
  declarations: [
    BreadcrumbComponent,
    LayoutComponent,
    SnackbarViewComponent,
    NotificationViewComponent,
    MainNavigationComponent,
    MenuDropdownComponent,
    NotebooksLinkComponent,
    NotebooksNolinkComponent,
    LoadingScreenComponent,
    FooterComponent,
    AddNotebookFormComponent,
    SelectNotebookFormComponent,
  ],
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule,
    MaterialModule,
    NgxSkeletonLoaderModule,
  ],
  exports: [
    BreadcrumbComponent,
    LayoutComponent,
    SnackbarViewComponent,
    NotificationViewComponent,
    MainNavigationComponent,
    MenuDropdownComponent,
    NotebooksLinkComponent,
    NotebooksNolinkComponent,
    LoadingScreenComponent,
    FooterComponent,
    AddNotebookFormComponent,
    SelectNotebookFormComponent,
  ],
})
export class CoreModule {}
