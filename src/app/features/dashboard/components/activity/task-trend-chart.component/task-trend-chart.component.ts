import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChartComponent } from '../../chart/chart.component/chart.component';
import { Subject, takeUntil } from 'rxjs';
import { DashboardService } from '../../../services/dashboard-service';

@Component({
  selector: 'app-task-trend-chart',
  imports: [CommonModule,ChartComponent],
  templateUrl: './task-trend-chart.component.html',
  styleUrl: './task-trend-chart.component.scss',
})
export class TaskTrendChartComponent implements OnInit, OnDestroy {

  chartData:any=null;
  loading=false;
  private destroy$=new Subject<void>();
  constructor(private dashboardService:DashboardService){}
  ngOnInit():void{
    this.loadData();
    this.dashboardService.tasks$.pipe(takeUntil(this.destroy$)).subscribe(()=>{
      this.loadData();
    });
  }
  private loadData():void {
    this.loading=true;
    this.chartData=this.dashboardService.getTaskTrendData(14);
    this.loading=false;
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
