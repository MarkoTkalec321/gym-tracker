import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupClientsComponent } from './group-clients.component';

describe('GroupClientsComponent', () => {
  let component: GroupClientsComponent;
  let fixture: ComponentFixture<GroupClientsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GroupClientsComponent]
    });
    fixture = TestBed.createComponent(GroupClientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
