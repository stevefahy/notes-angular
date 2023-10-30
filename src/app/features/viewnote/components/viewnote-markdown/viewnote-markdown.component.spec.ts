import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewnoteMarkdownComponent } from './viewnote-markdown.component';

describe('ViewnoteMarkdownComponent', () => {
  let component: ViewnoteMarkdownComponent;
  let fixture: ComponentFixture<ViewnoteMarkdownComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewnoteMarkdownComponent]
    });
    fixture = TestBed.createComponent(ViewnoteMarkdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
