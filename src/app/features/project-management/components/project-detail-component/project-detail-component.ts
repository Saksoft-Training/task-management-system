import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { AuthService } from '../../../user-account-management/services/auth-service';
import { Project } from '../../../../../types/models/project';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-project-detail-component',
  imports: [DatePipe, CommonModule],
  templateUrl: './project-detail-component.html',
  styleUrl: './project-detail-component.scss',
})
export class ProjectDetailComponent implements OnInit {
  public project?: Project;
  public currentUserEmail: string = '';


  // Static counters (user chose option A)
  public todoCount = 0;
  public inProgressCount = 0;
  public completedCount = 0;
  public overdueCount = 0;


  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    protected router: Router,
    private authService: AuthService
  ) { }


  public ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.currentUserEmail = user?.email || '';


    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.project = this.projectService.getById(id, this.currentUserEmail);
    if (!this.project) {
      alert('Project not found');
      this.router.navigate(['/projects']);
    }
  }


  public onCreateTask(): void {
    this.router.navigate(['/tasks/create']);
  }


  public onEditProject(): void {
    if (this.project) {
      this.router.navigate(['/projects/create', this.project.id]);
    }
  }


  public onDeleteProject(): void {
    if (this.project && confirm('Are you sure you want to delete this project?')) {
      this.projectService.delete(this.project.id, this.currentUserEmail);
      this.router.navigate(['/projects']);
    }
  }
  /**
  * @summary Navigates to the list of all projects.
  * @returns {void}
  */
  public goToProjects(): void {
    this.router.navigate(['/projects']);
  }
  // #region Computed Getters
  /**
   * @summary Returns a formatted CSS class based on project status.
   * Converts values like:
   * - "In Progress" → "in-progress"
   * - "On Hold"     → "on-hold"
   */
  public get statusClass(): string {
  return this.project?.status
    ?.toLowerCase()
    .replace(/\s+/g, '-') || '';
}


  // #endregion
}
