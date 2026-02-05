import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorAlertComponent } from './components/ui/error-alert/error-alert.component';

@NgModule({
  imports: [CommonModule, ErrorAlertComponent],
})
export class LazyLoadedModule {
  public static components = {
    dynamicComponent: ErrorAlertComponent,
  };
}
