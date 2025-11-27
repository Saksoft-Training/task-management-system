//#region Imports
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Task } from '../../../../../types/models/task';
import { TaskService } from '../../services/task-service';
import { ProjectService } from '../../../project-management/services/project.service';
import { ConfirmationDialogComponent } from "../../../../shared/components/confirmation-dialog/confirmation-dialog.component";
//#endregion

/**
 * @summary
 * Displays detailed information about a single task.
 * Supports edit, status/priority update, history tracking, and delete with confirmation.
 */
@Component({
  selector: 'app-task-detail-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmationDialogComponent, RouterModule],
  templateUrl: './task-detail-page.component.html',
  styleUrls: ['./task-detail-page.component.scss']
})
export class TaskDetailPageComponent implements OnInit {

  //#region Task & UI State

  /** The task currently being displayed */
  public task: Task | null = null;

  /** The project name of the task */
  public projectName: string = '';

  /** Status history for display */
  public statusHistory: { status: string; date: string }[] = [];

  /** Toggle delete confirmation modal */
  public isDeleteModalOpen: boolean = false;

  /** Task selected for deletion */
  public pendingDeleteTask: Task | null = null;

  /** Priority options */
  public readonly priorityOptions: string[] = ['Low', 'Medium', 'High', 'Urgent'];

  /** Status options */
  public readonly statusOptions: string[] = ['To Do', 'In Progress', 'Completed'];

  /** Stores project ID for routing */
  public projectId!: number;

  /** Loading flag to avoid blank UI flicker */
  public isLoading = true;

  //#endregion


  //#region Constructor

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly taskService: TaskService,
    private readonly projectService: ProjectService,
    private readonly cdr: ChangeDetectorRef
  ) {}
  //#endregion


  //#region Lifecycle

  /**
   * Loads task by ID and initializes project + status history.
   * Listens to live task stream to update UI dynamically.
   */
  ngOnInit(): void {
    const taskId = Number(this.route.snapshot.paramMap.get('id'));

    if (!taskId) {
      this.router.navigate(['/tasks']);
      return;
    }

    this.taskService.tasks$.subscribe(tasks => {
      this.task = tasks.find(t => Number(t.id) === taskId) ?? null;

      if (!this.task) return;

      this.projectId = this.task.projectId;

      const user =
        JSON.parse(localStorage.getItem('currentUser') || 'null') ||
        JSON.parse(sessionStorage.getItem('currentUser') || 'null');

      const email = user?.email || '';
      const project = this.projectService.getById(this.projectId, email);
      this.projectName = project?.name || 'Unknown Project';

      // Build history log if exists, else create initial entries
      this.statusHistory = this.task.statusHistory?.length
        ? [...this.task.statusHistory]
        : [
            { status: 'Created', date: this.task.createdAt },
            { status: this.task.status, date: this.task.updatedAt }
          ];

      this.isLoading = false;
      this.cdr.markForCheck();
    });
  }
  //#endregion


  //#region Actions

  /** Navigate to edit screen */
  public onEdit(): void {
    if (!this.task) return;
    this.router.navigate(['/tasks/edit', this.task.id]);
  }

  /** Trigger delete confirmation modal */
  public onDelete(): void {
    if (!this.task) return;
    this.pendingDeleteTask = this.task;
    this.isDeleteModalOpen = true;
  }

  /** Confirm delete and return to tasks */
  /** Confirm delete and go to the project detail page */
public onConfirmDelete(): void {
  if (this.pendingDeleteTask) {
    const projectId = this.pendingDeleteTask.projectId;

    // Delete task
    this.taskService.deleteTask(this.pendingDeleteTask.id);

    // Close dialog
    this.isDeleteModalOpen = false;
    this.pendingDeleteTask = null;

    // Navigate to that task's project detail page
    this.router.navigate([`/projects/${projectId}`]);
  }
}


  /** Cancel delete modal and stay on same task detail page */
public onCancelDelete(): void {
  this.isDeleteModalOpen = false;

  if (this.task) {
    this.router.navigate([`/tasks/${this.task.id}`]);  
  }
}


  /**
   * Updates status and logs history entry.
   */
  public updateStatus(newStatus: string): void {
    if (!this.task) return;

    const timestamp = new Date().toISOString();

    if (!this.task.statusHistory) {
      this.task.statusHistory = [{ status: 'Created', date: this.task.createdAt }];
    }

    this.task.statusHistory.unshift({ status: newStatus, date: timestamp });

    this.task.status = newStatus as any;
    this.task.updatedAt = timestamp;

    this.taskService.updateTask(this.task);
    this.statusHistory = [...this.task.statusHistory];

    this.cdr.detectChanges();
  }

  /**
   * Updates task priority with timestamp update.
   */
  public updatePriority(newPriority: string): void {
    if (!this.task) return;

    this.task.priority = newPriority as any;
    this.task.updatedAt = new Date().toISOString();

    this.taskService.updateTask(this.task);
    this.cdr.detectChanges();
  }

  /** Navigate to project list */
  public goToProjects(): void {
    this.router.navigate(['/projects']);
  }

  /** Navigate to parent project */
  public goToProject(projectId: number | undefined): void {
    if (!projectId) return;
    this.router.navigate(['/projects', projectId]);
  }

  //#endregion
}