import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingSessionDialogComponent } from './training-session-dialog.component';

describe('TrainingSessionDialogComponent', () => {
  let component: TrainingSessionDialogComponent;
  let fixture: ComponentFixture<TrainingSessionDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TrainingSessionDialogComponent]
    });
    fixture = TestBed.createComponent(TrainingSessionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
