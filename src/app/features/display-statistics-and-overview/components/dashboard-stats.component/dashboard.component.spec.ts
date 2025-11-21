import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardComponentStats } from './dashboard.component';

describe('DashboardComponent', () => {
  let component: DashboardComponentStats;
  let fixture: ComponentFixture<DashboardComponentStats>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponentStats]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardComponentStats);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
