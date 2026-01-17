import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationViewComponent } from './notification-view.component';

describe('NotificationViewComponent', () => {
  let component: NotificationViewComponent;
  let fixture: ComponentFixture<NotificationViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NotificationViewComponent]
    });
    fixture = TestBed.createComponent(NotificationViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
