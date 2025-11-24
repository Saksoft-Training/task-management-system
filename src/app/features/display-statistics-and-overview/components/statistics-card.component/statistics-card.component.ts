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
  @Input() label!: string;
  @Input() value!: string | number;
  @Input() subValue?: string; // optional small text e.g. "of 100"
  @Input() icon?: string; // icon name or svg path
  @Input() colorClass: string = 'neutral'; // css class for color-coding
  @Input() route?: string; // optional route to navigate on click
  @Input() showTrend: boolean = false;
  @Input() loading: boolean = false;
  @Input() status?: string;

}