import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverdueTasksAlertComponent } from './overdue-tasks-alert.component';

describe('OverdueTasksAlertComponent', () => {
  let component: OverdueTasksAlertComponent;
  let fixture: ComponentFixture<OverdueTasksAlertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverdueTasksAlertComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OverdueTasksAlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
