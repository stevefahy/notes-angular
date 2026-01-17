import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewnotethumbComponent } from './viewnotethumb.component';

describe('ViewnotethumbComponent', () => {
  let component: ViewnotethumbComponent;
  let fixture: ComponentFixture<ViewnotethumbComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewnotethumbComponent]
    });
    fixture = TestBed.createComponent(ViewnotethumbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
