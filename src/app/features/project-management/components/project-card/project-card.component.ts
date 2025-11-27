import { Component, Input } from '@angular/core';
import { Project } from '../../../../../types';
import { CommonModule } from '@angular/common';
import { TruncatePipePipe } from '../../../../shared/pipes/truncate-pipe-pipe';

@Component({
  selector: 'app-project-card-component',
  imports: [CommonModule, TruncatePipePipe],
  templateUrl: './project-card.component.html',
  styleUrl: './project-card.component.scss',
})
export class ProjectCardComponent {
  // #region Properties
  /**
   * @summary The index of the project in the displayed list.
   */
  @Input() index!: number;
  /**
  * @summary The full project data object passed from the parent component.
  */
  @Input() project!: Project;
  /**
   * @summary The number of tasks linked to the project.
   * Defaults to 0 if not provided.
   */
  @Input() taskCount: number = 0;
  // #endregion

  // #region Computed Getters
  /**
   * @summary Returns a formatted CSS class based on project status.
   * Converts values like:
   * - "In Progress" → "in-progress"
   * - "On Hold"     → "on-hold"
   */
  public get statusClass(): string {
    const status = this.project?.status;
    if (!status || typeof status !== 'string') {
      return 'unknown'; // fallback CSS class
    }
    return status
      .toLowerCase()
      .replace(/\s+/g, '-');
  }
  // #endregion
}