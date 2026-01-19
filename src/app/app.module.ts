// import { NgModule } from '@angular/core';
// import { BrowserModule } from '@angular/platform-browser';
// import { AppRoutingModule } from './app-routing.module';
// import { AppComponent } from './app.component';
// import { PageNotFoundComponent } from './core/components/page-not-found/page-not-found.component';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import { MaterialModule } from './core/material.module';
// import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
// import { StoreModule } from '@ngrx/store';
// import {
//   editingReducer,
//   editedReducer,
// } from './store/reducers/notebook_edit.reducer';
// import { notificationReducer } from './store/reducers/notification.reducer';
// import { CoreModule } from './core/core.module';
// import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
// import { snackReducer } from './store/reducers/snack.reducer';

// @NgModule({ declarations: [AppComponent, PageNotFoundComponent],
//     bootstrap: [AppComponent], imports: [NgxSkeletonLoaderModule.forRoot(),
//         CoreModule,
//         BrowserModule,
//         AppRoutingModule,
//         BrowserAnimationsModule,
//         MaterialModule,
//         StoreModule.forRoot({
//             notification: notificationReducer,
//             edited: editedReducer,
//             editing: editingReducer,
//             snack: snackReducer,
//         })], providers: [provideHttpClient(withInterceptorsFromDi())] })
// export class AppModule {}



import { provideZoneChangeDetection } from '@angular/core';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PageNotFoundComponent } from './core/components/page-not-found/page-not-found.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './core/material.module';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import {
  editingReducer,
  editedReducer,
} from './store/reducers/notebook_edit.reducer';
import { notificationReducer } from './store/reducers/notification.reducer';
import { CoreModule } from './core/core.module';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { snackReducer } from './store/reducers/snack.reducer';

@NgModule({ 
  declarations: [AppComponent, PageNotFoundComponent],
  bootstrap: [AppComponent], 
  imports: [
    NgxSkeletonLoaderModule.forRoot(),
    CoreModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    StoreModule.forRoot({
      notification: notificationReducer,
      edited: editedReducer,
      editing: editingReducer,
      snack: snackReducer,
    })
  ], 
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    provideZoneChangeDetection()
  ] 
})
export class AppModule {}
