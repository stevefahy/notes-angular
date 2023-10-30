import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotebooksNolinkComponent } from './notebooks.nolink.component';

describe('NotebooksNolinkComponent', () => {
  let component: NotebooksNolinkComponent;
  let fixture: ComponentFixture<NotebooksNolinkComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NotebooksNolinkComponent]
    });
    fixture = TestBed.createComponent(NotebooksNolinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
