import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskTrendChartComponent } from './task-trend-chart.component';

describe('TaskTrendChartComponent', () => {
  let component: TaskTrendChartComponent;
  let fixture: ComponentFixture<TaskTrendChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskTrendChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskTrendChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
