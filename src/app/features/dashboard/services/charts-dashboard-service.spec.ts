import { TestBed } from '@angular/core/testing';

import { chartDashboardService } from './charts-dashboard-service';

describe('DashboardService', () => {
  let service: chartDashboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(chartDashboardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
