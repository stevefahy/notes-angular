import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore } from '@ngrx/store/testing';
import type { Provider } from '@angular/core';

/** Router + HTTP + NgRx mock store for standalone components that use AuthService or Store. */
export const componentTestImports = [
  RouterTestingModule,
  HttpClientTestingModule,
] as const;

export const componentTestProviders: Provider[] = [provideMockStore()];
