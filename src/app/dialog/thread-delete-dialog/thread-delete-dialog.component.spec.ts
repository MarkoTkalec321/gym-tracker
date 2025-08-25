import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreadDeleteDialogComponent } from './thread-delete-dialog.component';

describe('ThreadDeleteDialogComponent', () => {
  let component: ThreadDeleteDialogComponent;
  let fixture: ComponentFixture<ThreadDeleteDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ThreadDeleteDialogComponent]
    });
    fixture = TestBed.createComponent(ThreadDeleteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
