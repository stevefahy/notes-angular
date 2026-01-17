import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SnackbarViewComponent } from './snackbar-view.component';

describe('SnackbarViewComponent', () => {
  let component: SnackbarViewComponent;
  let fixture: ComponentFixture<SnackbarViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SnackbarViewComponent]
    });
    fixture = TestBed.createComponent(SnackbarViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
