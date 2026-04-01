import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotebookComponent } from './notebook.component';
import {
  componentTestImports,
  componentTestProviders,
} from 'src/app/testing/component-test-defaults';

describe('NotebookComponent', () => {
  let component: NotebookComponent;
  let fixture: ComponentFixture<NotebookComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NotebookComponent, ...componentTestImports],
      providers: componentTestProviders,
    });
    fixture = TestBed.createComponent(NotebookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
