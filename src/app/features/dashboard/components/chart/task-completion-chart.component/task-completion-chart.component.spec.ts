import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskCompletionChartComponent } from './task-completion-chart.component';

describe('TaskCompletionChartComponent', () => {
  let component: TaskCompletionChartComponent;
  let fixture: ComponentFixture<TaskCompletionChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskCompletionChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskCompletionChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
