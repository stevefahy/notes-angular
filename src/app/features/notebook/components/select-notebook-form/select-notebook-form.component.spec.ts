import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectNotebookFormComponent } from './select-notebook-form.component';

describe('SelectNotebookFormComponent', () => {
  let component: SelectNotebookFormComponent;
  let fixture: ComponentFixture<SelectNotebookFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SelectNotebookFormComponent]
    });
    fixture = TestBed.createComponent(SelectNotebookFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
