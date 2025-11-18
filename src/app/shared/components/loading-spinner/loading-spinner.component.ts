import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading-spinner.component.html',
  styleUrls: ['./loading-spinner.component.scss']
})
export class LoadingSpinnerComponent {
  //#region Inputs
  /**
   * @summary Controls whether the loading spinner is visible.
   * @param boolean show - true to display spinner.
   */
  @Input() show: boolean = false;
  /**
   * @summary Message displayed below the spinner.
   * @param string message - Text shown to the user.
   */
  @Input() message: string = 'Loading...';
  //#endregion
}
