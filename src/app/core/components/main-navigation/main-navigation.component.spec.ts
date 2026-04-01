import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainNavigationComponent } from './main-navigation.component';
import {
  componentTestImports,
  componentTestProviders,
} from 'src/app/testing/component-test-defaults';

describe('MainNavigationComponent', () => {
  let component: MainNavigationComponent;
  let fixture: ComponentFixture<MainNavigationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MainNavigationComponent, ...componentTestImports],
      providers: componentTestProviders,
    });
    fixture = TestBed.createComponent(MainNavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
