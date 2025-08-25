import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingSessionsDeleteDialogComponent } from './training-sessions-delete-dialog.component';

describe('TrainingSessionsDeleteDialogComponent', () => {
  let component: TrainingSessionsDeleteDialogComponent;
  let fixture: ComponentFixture<TrainingSessionsDeleteDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TrainingSessionsDeleteDialogComponent]
    });
    fixture = TestBed.createComponent(TrainingSessionsDeleteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
