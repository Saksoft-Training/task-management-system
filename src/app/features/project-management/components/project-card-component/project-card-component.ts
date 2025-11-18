import { Component, Input } from '@angular/core';
import { Project } from '../../../../../types';
import { CommonModule } from '@angular/common';
import { TruncatePipePipe } from '../../../../shared/pipes/truncate-pipe-pipe';
import { Router } from '@angular/router';

@Component({
  selector: 'app-project-card-component',
  imports: [CommonModule, TruncatePipePipe],
  templateUrl: './project-card-component.html',
  styleUrl: './project-card-component.scss',
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
  // #endregion

  constructor(private router: Router){}
  // #region Computed Getters
  /**
   * @summary Returns a formatted CSS class based on project status.
   * Converts values like:
   * - "In Progress" → "in-progress"
   * - "On Hold"     → "on-hold"
   */
  public get statusClass(): string {
    return this.project.status
      .toLowerCase()
      .replace(/\s+/g, '-');
  }
  // #endregion
  public navigateToProject() :void{
  this.router.navigate(['/projects', this.project.id]);
}
}