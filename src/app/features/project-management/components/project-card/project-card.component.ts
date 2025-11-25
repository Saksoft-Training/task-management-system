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
   * Used mainly for list rendering and animations.
   */
  @Input() index!: number;

  /**
   * @summary The full project data object passed from the parent component.
   * Contains title, description, status, dates, and other metadata.
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
   * @summary Returns a formatted and safe CSS class based on project status.
   *
   * Maintains old behaviour:
   * - "In Progress" → "in-progress"
   * - "On Hold"     → "on-hold"
   *
   * NEW: Added safety checks to avoid undefined/null issues.
   *
   * @returns {string} A CSS-safe class name.
   */
  public get statusClass(): string {
    const status = this.project?.status;

    // New Validation:
    // Ensures the class never breaks even if project.status is missing.
    if (!status || typeof status !== 'string') {
      return 'unknown'; // fallback CSS class
    }

    // Converts spaces → hyphens & lowercase formatting
    return status
      .toLowerCase()
      .replace(/\s+/g, '-');
  }

  // #endregion
}
