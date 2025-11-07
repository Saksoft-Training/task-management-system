import { isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Inject, Input, OnDestroy, PLATFORM_ID } from '@angular/core';
import { Chart, ChartType, ChartData, ChartOptions, registerables } from 'chart.js';
@Component({
  selector: 'app-chartcomponent',
  imports: [],
   template: `
    <div class="chart-container" [class.loading]="loading" [class.empty]="isEmpty">
      @if (isBrowser) {
        <canvas [id]="chartId"></canvas>
      }
      
      @if (loading && isBrowser) {
        <div class="chart-loading">
          <div class="spinner"></div>
          <p>Loading chart...</p>
        </div>
      }
      
      @if (isEmpty) {
        <div class="chart-empty">
          <div class="empty-icon">📊</div>
          <p>No data available</p>
        </div>
      }
    </div>
  `,
  styleUrl: './chartcomponent.scss',
})
export class Chartcomponent implements AfterViewInit,OnDestroy{
 @Input() chartId!: string;
  @Input() type!: ChartType;
  @Input() data: ChartData = { labels: [], datasets: [] };
  @Input() options: ChartOptions = {};
  @Input() loading: boolean = false;

  private chart: Chart | null = null;
  isBrowser: boolean;

  constructor(
    private elementRef: ElementRef,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    if (this.isBrowser) {
      Chart.register(...registerables);
    }
  }

  ngAfterViewInit(): void {
    if (this.isBrowser && !this.loading && !this.isEmpty) {
      this.createChart();
    }
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  get isEmpty(): boolean {
    return this.data.datasets.length === 0 || 
           this.data.datasets.every(dataset => dataset.data.length === 0);
  }

  private createChart(): void {
    if (!this.isBrowser || this.isEmpty) return;

    const canvas = this.elementRef.nativeElement.querySelector('canvas');
    if (!canvas) return;

    try {
      // Default options
      const defaultOptions: ChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 15
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        }
      };

      // Merge with provided options
      const mergedOptions = { ...defaultOptions, ...this.options };

      this.chart = new Chart(canvas, {
        type: this.type,
        data: this.data,
        options: mergedOptions
      });
    } catch (error) {
      console.error(`Error creating chart ${this.chartId}:`, error);
    }
  }
}
