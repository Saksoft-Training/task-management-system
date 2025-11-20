import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { AuthService } from '../../../user-account-management/services/auth-service';
import { Project } from '../../../../../types/models/project';
import { CommonModule, DatePipe } from '@angular/common';
import { TaskService } from '../../../task-management/services/task-service';
import { Task } from '../../../../../types/models/task';

@Component({
  selector: 'app-project-detail-component',
  imports: [DatePipe, CommonModule],
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.scss',
})
export class ProjectDetailComponent implements OnInit {
  // #region Properties
  /** The currently selected project details */
  public project?: Project;
  /** Logged-in user's email */
  public currentUserEmail: string = '';
  public tasks: Task[] = [];
  /** Total number of days between project start and end dates */
  public totalDays = 0;
  /** Number of days that have elapsed since the project started */
  public elapsedDays = 0;
  /** Percentage of project duration completed */
  public percentComplete = 0;
  /** Display text showing progress  */
  public progressText = '';
  /** Task statistics */
  public todoCount = 0;
  public inProgressCount = 0;
  public completedCount = 0;
  public overdueCount = 0;
  // #endregion

  // #region Constructor
  /**
   * @summary Initializes services required by the component.
   */
  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    protected router: Router,
    private authService: AuthService,
    private readonly taskService: TaskService
  ) { }
  // #endregion

  // #region Lifecycle Hooks
  /**
   * @summary Initializes component by loading the project and user details.
   * @returns {void}
   */
  public ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.currentUserEmail = user?.email || '';
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.project = this.projectService.getById(id, this.currentUserEmail);
    if (!this.project) {
      alert('Project not found');
      this.router.navigate(['/projects']);
    }
    if (!this.project) {
      alert('Project not found');
      this.router.navigate(['/projects']);
      return;
    }

    this.calculateProgress();
    this.loadTasks();
    this.calculateTaskStats();
  }
  // #endregion

  private loadTasks(): void {
    if (!this.project) return;

    this.tasks = this.taskService
      .getTasksByProjectId(this.project.id)
      .filter(t => t.createdBy === this.currentUserEmail);
  }
  private calculateTaskStats(): void {
    this.todoCount = this.tasks.filter(t => t.status === 'To Do').length;
    this.inProgressCount = this.tasks.filter(t => t.status === 'In Progress').length;
    this.completedCount = this.tasks.filter(t => t.status === 'Completed').length;

    this.overdueCount = this.tasks.filter(t => {
      const due = new Date(t.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return t.status !== 'Completed' && due < today;
    }).length;
  }

  // #region Utility Methods
  /**
   * @summary Converts a YYYY-MM-DD string to a local Date object.
   * @param dateString - Date formatted as "YYYY-MM-DD"
   * @returns {Date}
   */
  private toLocalDate(dateString: string): Date {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  // #endregion

  // #region Navigation
  /**
  * @summary Navigates to create-task page.
  * @returns {void}
  */
  public onCreateTask(): void {
    this.router.navigate(['/tasks/create'], {
      queryParams: { projectId: this.project?.id }
    });
  }
  /**
  * @summary Navigates to the list of all projects.
  * @returns {void}
  */
  public goToProjects(): void {
    this.router.navigate(['/projects']);
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

  // #endregion
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

  // #region Progress Calculation
  /**
   * @summary Calculates the project progress (elapsed days, total days, % complete).
   * @returns {void}
   */
  private calculateProgress(): void {
    console.log("RAW PROJECT DATES:", {
      startDate: this.project?.startDate,
      endDate: this.project?.endDate,
    });
    if (!this.project?.startDate || !this.project?.endDate) return;
    const start = this.toLocalDate(this.project.startDate);
    const end = this.toLocalDate(this.project.endDate);
    console.log("PARSED DATES:", {
      start,
      end
    });
    const today = new Date();
    const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startMid = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const endMid = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    const msPerDay = 24 * 60 * 60 * 1000;
    this.totalDays = Math.floor((endMid.getTime() - startMid.getTime()) / msPerDay) + 1;
    if (todayMid < startMid) this.elapsedDays = 0;
    else if (todayMid > endMid) this.elapsedDays = this.totalDays;
    else {
      this.elapsedDays = Math.floor((todayMid.getTime() - startMid.getTime()) / msPerDay) + 1;
    }
    this.percentComplete = Math.round((this.elapsedDays / this.totalDays) * 100);
    this.progressText = `Day ${this.elapsedDays} of ${this.totalDays} (${this.percentComplete}%)`;
    console.log("CALCULATED PROGRESS:", {
      totalDays: this.totalDays,
      elapsedDays: this.elapsedDays,
      percentComplete: this.percentComplete,
      progressText: this.progressText
    });
  }
  
  // #endregion
}
