import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingSessionsDialogViewComponent } from './training-sessions-dialog-view.component';

describe('TrainingSessionsDialogViewComponent', () => {
  let component: TrainingSessionsDialogViewComponent;
  let fixture: ComponentFixture<TrainingSessionsDialogViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TrainingSessionsDialogViewComponent]
    });
    fixture = TestBed.createComponent(TrainingSessionsDialogViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
