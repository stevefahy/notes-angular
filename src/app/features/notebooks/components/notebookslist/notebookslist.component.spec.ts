import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotebookslistComponent } from './notebookslist.component';

describe('NotebookslistComponent', () => {
  let component: NotebookslistComponent;
  let fixture: ComponentFixture<NotebookslistComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NotebookslistComponent]
    });
    fixture = TestBed.createComponent(NotebookslistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
