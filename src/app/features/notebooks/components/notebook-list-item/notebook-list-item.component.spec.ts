import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotebookListItemComponent } from './notebook-list-item.component';

describe('NotebookListItemComponent', () => {
  let component: NotebookListItemComponent;
  let fixture: ComponentFixture<NotebookListItemComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NotebookListItemComponent]
    });
    fixture = TestBed.createComponent(NotebookListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
