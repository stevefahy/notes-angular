import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewnoteComponent } from './viewnote.component';

describe('ViewnoteComponent', () => {
  let component: ViewnoteComponent;
  let fixture: ComponentFixture<ViewnoteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewnoteComponent]
    });
    fixture = TestBed.createComponent(ViewnoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
