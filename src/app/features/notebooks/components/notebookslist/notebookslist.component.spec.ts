import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotebookslistComponent } from './notebookslist.component';
import {
  componentTestImports,
  componentTestProviders,
} from 'src/app/testing/component-test-defaults';

describe('NotebookslistComponent', () => {
  let component: NotebookslistComponent;
  let fixture: ComponentFixture<NotebookslistComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NotebookslistComponent, ...componentTestImports],
      providers: componentTestProviders,
    });
    fixture = TestBed.createComponent(NotebookslistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
