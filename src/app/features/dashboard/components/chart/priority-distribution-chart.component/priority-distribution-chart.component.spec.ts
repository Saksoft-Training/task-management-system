import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriorityDistributionChartComponent } from './priority-distribution-chart.component';

describe('PriorityDistributionChartComponent', () => {
  let component: PriorityDistributionChartComponent;
  let fixture: ComponentFixture<PriorityDistributionChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PriorityDistributionChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PriorityDistributionChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
