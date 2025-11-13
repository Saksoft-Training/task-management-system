import { TestBed } from '@angular/core/testing';

import { NotificationGeneratorService } from './notification-generator-service';

describe('NotificationGeneratorService', () => {
  let service: NotificationGeneratorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationGeneratorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
