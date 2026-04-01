import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { NotebooksLinkComponent } from './notebooks.link.component';

describe('NotebooksLinkComponent', () => {
  let component: NotebooksLinkComponent;
  let fixture: ComponentFixture<NotebooksLinkComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NotebooksLinkComponent, RouterTestingModule],
    });
    fixture = TestBed.createComponent(NotebooksLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
