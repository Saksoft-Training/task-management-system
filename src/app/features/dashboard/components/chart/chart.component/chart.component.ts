import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, OnChanges, OnInit, AfterViewInit, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { Chart, ChartConfiguration } from 'chart.js';
export interface BaseChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    [key: string]: any;
  }>;
}
@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.scss',
})
export class ChartComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy{
@Input() data: BaseChartData | null = null;
  @Input() type: 'doughnut' | 'pie' | 'line' | 'bar' = 'doughnut';
  @Input() options: Partial<ChartConfiguration> = {};
  @Input() loading = false;
  @ViewChild('chartCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private chart: Chart | null = null;
  private currentType: 'doughnut' | 'pie' | 'line' | 'bar' = 'doughnut';
  ngOnInit(): void {
  }
  ngAfterViewInit(): void {
    if (this.data && this.canvasRef && this.hasData()) {
      this.currentType = this.type;
      this.createChart();
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['data'] ||
      changes['type'] ||
      changes['options'] ||
      changes['loading']
    ) {
      if (this.chart) {
        this.updateChart();
      } else if (this.data && this.canvasRef && this.hasData() && this.canvasRef.nativeElement) {
        this.currentType = this.type;
        this.createChart();
      }
    }
  }
  hasData(): boolean {
    return !!(
      this.data &&
      this.data.datasets &&
      this.data.datasets.length > 0 &&
      this.data.datasets[0]?.data &&
      this.data.datasets[0].data.length > 0
    );
  }
  private createChart(): void {
    if (!this.canvasRef || !this.data) return;
    const ctx = this.canvasRef.nativeElement.getContext('2d');
    if (!ctx) return;
    const config: ChartConfiguration = {
      type: this.type,
      data: this.data as any,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: this.type === 'doughnut' ? 0 : undefined,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 15,
              font: { size: 12 },
            },
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleFont: { size: 14 },
            bodyFont: { size: 12 },
            padding: 10,
            cornerRadius: 4,
          },
        },
        ...this.options,
      } as any,
    };
    this.chart = new Chart(ctx, config);
  }
  private updateChart(): void {
    if (!this.chart || !this.data) return;
    this.chart.data = this.data as any;
    if (this.currentType !== this.type) {
      this.chart.destroy();
      this.currentType = this.type;
      this.createChart();
    } else {
      this.chart.update();
    }
  }
  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}
