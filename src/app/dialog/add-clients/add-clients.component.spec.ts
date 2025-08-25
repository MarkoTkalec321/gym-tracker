import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddClientsComponent } from './add-clients.component';

describe('AddClientsComponent', () => {
  let component: AddClientsComponent;
  let fixture: ComponentFixture<AddClientsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddClientsComponent]
    });
    fixture = TestBed.createComponent(AddClientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
