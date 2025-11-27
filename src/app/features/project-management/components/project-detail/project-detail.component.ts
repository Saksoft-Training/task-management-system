import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { AuthService } from '../../../user-account-management/services/auth-service';
import { Project } from '../../../../../types/models/project';
import { CommonModule, DatePipe } from '@angular/common';
import { TaskService } from '../../../task-management/services/task-service';
import { Task } from '../../../../../types/models/task';
import { DialogDeleteComponent } from '../../../../shared/components/dialog-delete/dialog-delete.component';
import { TaskCardComponent } from "../../../task-management/components/task-card.component/task-card.component";
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-project-detail-component',
  imports: [DatePipe, CommonModule, DialogDeleteComponent, TaskCardComponent],
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.scss',
})
export class ProjectDetailComponent implements OnInit, OnDestroy {
  // #region Properties
  /** The currently selected project details (loaded via async subscription) */
  public project?: Project;
  /** Logged-in user’s email */
  public currentUserEmail: string = '';
  /** All tasks belonging to this project */
  public tasks: Task[] = [];
  /** Total number of days between project start and end dates */
  public totalDays = 0;
  /** Number of days passed since project start */
  public elapsedDays = 0;
  /** Percentage of total duration completed */
  public percentComplete = 0;
  /** Formatted project progress text */
  public progressText = '';
  /** Controls delete confirmation dialog visibility */
  public showDeleteDialog = false;
  /** Stores selected task for viewing full details */
  public activeTask: Task | null = null;
  /** Task statistics */
  public todoCount = 0;
  public inProgressCount = 0;
  public completedCount = 0;
  public overdueCount = 0;
  /** Prevents false “Project not found” alert after deletion */
  public isDeleting = false;
  /** Data passed to the delete confirmation dialog */
  public deleteDialogData = {
    title: 'DELETE PROJECT',
    message: '',
    confirmText: 'Delete',
    cancelText: 'Cancel'
  };
  /** Project ID extracted from route */
  private projectId!: number;
  /** Stores all stream subscriptions */
  private subs = new Subscription();
  // #endregion

  // #region Constructor
  /**
   * @summary Initializes required services for loading project, tasks, and handling navigation.
   */
  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    protected router: Router,
    private authService: AuthService,
    private readonly taskService: TaskService,
    private cdr: ChangeDetectorRef,
  ) { }
  // #endregion

  // #region Lifecycle Hooks
  /**
   * @summary Loads user info, subscribes to project & task streams, and initializes stats & progress.
   * All data loads asynchronously from API streams.
   */
  public ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.currentUserEmail = user?.email || '';
    this.projectId = Number(this.route.snapshot.paramMap.get('id'));
    const projectSub = this.projectService.projects$.subscribe(allProjects => {
      if (allProjects.length === 0) return;
      const projectFound = allProjects.find(p => Number(p.id) === this.projectId);
      const isProjectDetailPage = this.router.url.startsWith('/projects/');
      if (!projectFound) {
        if (!this.isDeleting && isProjectDetailPage) {
          this.router.navigate(['/projects']);
        }
        return;
      }
      this.project = projectFound;
      this.calculateProgress();
      this.loadTasks();
      this.calculateTaskStats();
      this.cdr.detectChanges();
    });
    this.subs.add(projectSub);
    const taskSub = this.taskService.tasks$.subscribe(() => {
      if (this.project) {
        this.loadTasks();
        this.calculateTaskStats();
        this.cdr.detectChanges();
      }
    });
    this.subs.add(taskSub);
  }
  /**
   * @summary Clean up subscriptions on destroy to prevent memory leaks.
   */
  public ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
  // #endregion

  // #region Data Loading
  /**
   * @summary Loads all tasks belonging to this project.
   * Shows tasks for **all users**, not only creator.
   */
  private loadTasks(): void {
    if (!this.project) return;
    this.tasks = this.taskService.getTasksByProjectId(this.project.id);
  }
  /**
   * @summary Calculates task statistics (To Do / In Progress / Completed / Overdue).
   */
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
  // #endregion

  // #region Utility Methods
  /**
   * @summary Converts a "YYYY-MM-DD" string into a JS `Date` object.
   * @param dateString — The string date from backend.
   */
  private toLocalDate(dateString: string): Date {
    const [year, month, day] = (dateString ?? '').split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  // #endregion

  // #region Navigation
  /**
    * @summary Navigates to task creation page with project ID.
    */
  public onCreateTask(): void {
    this.router.navigate(['/tasks/create'], { queryParams: { projectId: this.project?.id } });
  }
  /**
   * @summary Navigates back to project list.
   */
  public goToProjects(): void {
    this.router.navigate(['/projects']);
  }
  /**
    * @summary Opens edit page for this project.
    */
  public onEditProject(): void {
    if (this.project) {
      this.router.navigate(['/projects/create', this.project.id]);
    }
  }
  /**
   * @summary Navigates to Kanban board view.
   */
  public goToBoard(): void {
    if (!this.project?.id) return;
    this.router.navigate([`/projects/${this.project.id}/board`]);
  }
  /**
   * @summary Navigates to task list view.
   */
  public goToList(): void {
    if (!this.project?.id) return;
    this.router.navigate([`/projects/${this.project.id}/tasks`]);
  }
  // #endregion

  // #region Delete Project Flow
  /**
   * @summary Opens confirmation dialog for deleting the project & related tasks.
   */
  public onDeleteProject(): void {
    if (!this.project) return;
    const taskCount = this.tasks.length;
    this.deleteDialogData.message =
      `Are you sure you want to delete “${this.project.name}”?`
      + `\n\nThis action cannot be undone.\n\n`
      + `⚠️ This will also permanently delete ${taskCount} related task(s).`;
    this.showDeleteDialog = true;
  }
  /**
   * @summary Confirms deletion — deletes both project and tasks.
   */
  public handleDeleteConfirm(): void {
    if (!this.project) return;
    this.isDeleting = true;
    this.projectService.delete(this.project.id, this.currentUserEmail);
    this.taskService.deleteTasksByProjectId(this.project.id);
    this.router.navigate(['/projects']).then(() => {
      this.isDeleting = false;
    });
    this.showDeleteDialog = false;
  }
  /**
   * @summary Cancels deletion.
   */
  public handleDeleteCancel(): void {
    this.showDeleteDialog = false;
  }
  // #endregion

  // #region Computed Getters
  /**
   * @summary Converts project status to CSS class.
   */
  public get statusClass(): string {
    return this.project?.status?.toLowerCase().replace(/\s+/g, '-') || '';
  }
  // #endregion

  // #region Progress Calculation
  /**
   * @summary Calculates total days, elapsed days, percent completion and formatted text.
   */
  private calculateProgress(): void {
    if (!this.project?.startDate || !this.project?.endDate) {
      this.totalDays = 0;
      this.elapsedDays = 0;
      this.percentComplete = 0;
      this.progressText = '';
      return;
    }
    const start = this.toLocalDate(this.project.startDate);
    const end = this.toLocalDate(this.project.endDate);
    const today = new Date();
    const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startMid = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const endMid = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    const msPerDay = 24 * 60 * 60 * 1000;
    this.totalDays = Math.floor((endMid.getTime() - startMid.getTime()) / msPerDay) + 1;
    if (todayMid < startMid) this.elapsedDays = 0;
    else if (todayMid > endMid) this.elapsedDays = this.totalDays;
    else this.elapsedDays = Math.floor((todayMid.getTime() - startMid.getTime()) / msPerDay) + 1;
    this.percentComplete = this.totalDays > 0
      ? Math.round((this.elapsedDays / this.totalDays) * 100)
      : 0;
    this.progressText = `Day ${this.elapsedDays} of ${this.totalDays} (${this.percentComplete}%)`;
  }
  // #endregion

  // #region Task Card Actions
  /**
     * @summary Opens a task in modal view.
     * @param task Task to open
     */
  public openTaskCard(task: Task): void {
    this.activeTask = task;
  }
  /**
   * @summary Closes the task modal card.
   */
  public closeTaskCard(): void {
    this.activeTask = null;
  }
  // #endregion
}