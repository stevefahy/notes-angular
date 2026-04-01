import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNotebookFormComponent } from './add-notebook-form.component';

describe('AddNotebookFormComponent', () => {
  let component: AddNotebookFormComponent;
  let fixture: ComponentFixture<AddNotebookFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AddNotebookFormComponent]
    });
    fixture = TestBed.createComponent(AddNotebookFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
