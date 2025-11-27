import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
Chart.register(...registerables);
@Component({
  selector: 'app-chart',
  imports: [CommonModule],
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.scss',
})
export class ChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  // #region ViewChild & Inputs

  /**
   * Canvas reference used by Chart.js to draw the chart.
   */
  @ViewChild('canvas', { static: false }) canvas!: ElementRef<HTMLCanvasElement>;

  /**
   * Chart type (bar, line, pie, etc.).
   */
  @Input() type: ChartType = 'bar';
  /**
   * Chart data configuration.
   */
  @Input() data!: ChartConfiguration['data'];
  /**
  * Optional chart configuration settings.
  */
  @Input() options?: ChartConfiguration['options'];
  // #endregion

  // #region Private Properties

  /**
   * Holds the Chart.js instance so it can be destroyed or refreshed.
   */
  private chart?: Chart;
  // #endregion

  // #region Lifecycle Hooks

  /**
   * Called once the view is initialized.
   * @summary Initializes the chart rendering after view is ready.
   * @returns void
   */
  public ngAfterViewInit(): void {
    this.render();
  }
  /**
    * Called whenever input properties change.
    * @summary Re-renders chart when data, type, or options are updated.
    * @param changes - Object describing which inputs changed.
    * @returns void
    */
  public ngOnChanges(changes: SimpleChanges): void {
    if ((changes['data'] || changes['type'] || changes['options']) && this.canvas) {
      this.render();
    }
  }
  // #endregion

  // #region Chart Rendering

  /**
   * Renders or re-renders the chart.
   * @summary Creates a new Chart.js instance, destroying old one if needed.
   * @returns void
   */
  private render(): void {
    if (!this.canvas || !this.data) return;

    if (this.chart) {
      this.chart.destroy();
    }

    const ctx = this.canvas.nativeElement.getContext('2d');
    if (!ctx) return;

    this.chart = new Chart(ctx, {
      type: this.type,
      data: this.data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'bottom' },
          tooltip: { enabled: true }
        },
        ...(this.options || {})
      }
    });
  }
  /**
    * Cleanup hook to destroy chart instance.
    * @summary Ensures no memory leaks when component is destroyed.
    * @returns void
    */
  public ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}