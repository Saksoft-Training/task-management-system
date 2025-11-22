import { CommonModule, NgClass, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-statistics-card',
  standalone: true,
  imports: [CommonModule, NgIf, NgClass],
  templateUrl: './statistics-card.component.html',
  styleUrl: './statistics-card.component.scss',
})
export class StatisticsCardComponent {
  // #region Inputs

  /**
   * Main title/label of the statistics card.
   */
  @Input() label!: string;
  /**
  * Primary numeric/statistical value to display.
  */
  @Input() value!: string | number;
  /**
  * Optional secondary text (e.g., "of 100").
  */
  @Input() subValue?: string;

  /**
   * Optional icon URL or name.
   */
  @Input() icon?: string;
  /**
   * Color class applied to the card (e.g., success, warning, danger).
   */
  @Input() colorClass: string = 'neutral';

  /**
   * Optional route to navigate when the card is clicked.
   */
  @Input() route?: string;

  /**
   * Whether to show an upward/downward trend indicator.
   */
  @Input() showTrend: boolean = false;

  /**
   * Whether the card is in loading (skeleton) mode.
   */
  @Input() loading: boolean = false;

  /**
   * Optional status label (e.g., “High”, “Low”, “Normal”).
   */
  @Input() status?: string;
  // #endregion
}
