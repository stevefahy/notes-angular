import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ViewnoteMarkdownComponent } from './viewnote-markdown.component';

describe('ViewnoteMarkdownComponent', () => {
  let component: ViewnoteMarkdownComponent;
  let fixture: ComponentFixture<ViewnoteMarkdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewnoteMarkdownComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(ViewnoteMarkdownComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('updatedViewText', () => {});
    fixture.componentRef.setInput('disableLinks', false);
    fixture.detectChanges();
  });

  it('should create', fakeAsync(() => {
    expect(component).toBeTruthy();
    tick();
    fixture.detectChanges();
  }));
});
