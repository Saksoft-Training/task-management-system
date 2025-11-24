import { TestBed } from '@angular/core/testing';

import { chartsDashboardService } from './charts-dashboard-service';

describe('DashboardService', () => {
  let service: chartsDashboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(chartsDashboardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
