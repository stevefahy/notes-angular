import { bootstrapApplication } from '@angular/platform-browser';
import {
  provideRouter,
  withComponentInputBinding,
  withRouterConfig,
  withInMemoryScrolling,
} from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideZoneChangeDetection, isDevMode } from '@angular/core';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import {
  editingReducer,
  editedReducer,
} from './app/store/reducers/notebook_edit.reducer';
import { notificationReducer } from './app/store/reducers/notification.reducer';
import { snackReducer } from './app/store/reducers/snack.reducer';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(
      routes,
      withComponentInputBinding(),
      withRouterConfig({
        onSameUrlNavigation: 'reload',
      }),
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'enabled',
      }),
    ),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptorsFromDi()),
    provideStore({
      notification: notificationReducer,
      edited: editedReducer,
      editing: editingReducer,
      snack: snackReducer,
    }),
    ...(isDevMode() ? [provideStoreDevtools({ maxAge: 25 })] : []),
    provideZoneChangeDetection(),
  ],
}).catch((err) => console.error(err));
