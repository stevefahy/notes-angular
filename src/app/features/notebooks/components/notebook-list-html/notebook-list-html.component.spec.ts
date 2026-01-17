import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotebookListHtmlComponent } from './notebook-list-html.component';

describe('NotebookListHtmlComponent', () => {
  let component: NotebookListHtmlComponent;
  let fixture: ComponentFixture<NotebookListHtmlComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NotebookListHtmlComponent]
    });
    fixture = TestBed.createComponent(NotebookListHtmlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
