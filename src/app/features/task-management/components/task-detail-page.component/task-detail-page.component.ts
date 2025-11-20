import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Task } from '../../../../../types/models/task';
import { TaskService } from '../../services/task-service';
import { ProjectService } from '../../../project-management/services/project.service';
import { ConfirmationDialogComponent } from "../../../../shared/components/confirmation-dialog/confirmation-dialog.component";

/**
 * @summary
 * Displays detailed information about a single task, including:
 * - project name
 * - status and priority
 * - status history
 * Provides options to:
 * - edit the task
 * - update status or priority
 * - delete the task with confirmation
 */
@Component({
  selector: 'app-task-detail-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmationDialogComponent],
  templateUrl: './task-detail-page.component.html',
  styleUrls: ['./task-detail-page.component.scss']
})
export class TaskDetailPageComponent implements OnInit {

  // #region ─────────────── Component State ───────────────

  /** The task currently being displayed. Null if not found. */
  public task: Task | null = null;

  /** Name of the project this task belongs to. Loaded dynamically. */
  public projectName: string = '';

  /** Minimal history of task updates for UI display. */
  public statusHistory: { status: string; date: string }[] = [];

  /** Toggle for delete confirmation modal visibility. */
  public showDeleteModal: boolean = false;

  /** Stores task reference while the delete modal is open. */
  public taskToDelete: Task | null = null;

  /** Fixed set of task priority options. */
  public readonly priorityOptions: string[] = ['Low', 'Medium', 'High', 'Urgent'];

  /** Fixed set of task status options. */
  public readonly statusOptions: string[] = ['To Do', 'In Progress', 'Completed'];

  // #endregion

  // #region ─────────────── Constructor ───────────────

  /**
   * @summary Injects required services for task loading, navigation, and project lookup.
   */
  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly taskService: TaskService,
    private readonly projectService: ProjectService
  ) { }

  // #endregion

  // #region ─────────────── Lifecycle Hooks ───────────────

  /**
   * @summary
   * Loads task from the route parameter and initializes:
   * - project name
   * - status history
   */
  public ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;

    // Invalid or missing ID → redirect back
    if (Number.isNaN(id)) {
      this.router.navigate(['/tasks']);
      return;
    }

    // Load task
    this.task = this.taskService.getTaskById(id) ?? null;
    if (!this.task) {
      this.router.navigate(['/tasks']);
      return;
    }

    // Load project name based on logged user email
    const email = localStorage.getItem('loggedUserEmail') ?? '';
    const project = this.projectService.getById(this.task.projectId, email);
    this.projectName = project?.name ?? 'Unknown Project';

    // Build simple status history
    this.statusHistory = [
      { status: this.task.status ?? 'Unknown', date: this.task.updatedAt ?? this.task.createdAt ?? '' },
      { status: 'Created', date: this.task.createdAt ?? '' }
    ];
  }

  // #endregion

  // #region ─────────────── Edit / Delete Actions ───────────────

  /**
   * @summary Navigates to the Edit Task page.
   */
  public onEdit(): void {
    if (!this.task) return;
    this.router.navigate(['/tasks/edit', this.task.id]);
  }

  /**
   * @summary Opens modal asking user to confirm deletion.
   */
  public onDelete(): void {
    if (!this.task) return;
    this.taskToDelete = this.task;
    this.showDeleteModal = true;
  }

  /**
   * @summary Permanently deletes the task and redirects to task list.
   */
  public onConfirmDelete(): void {
    if (this.taskToDelete) {
      this.taskService.deleteTask(this.taskToDelete.id);
    }

    this.showDeleteModal = false;
    this.taskToDelete = null;

    this.router.navigate(['/tasks']);
  }

  /**
   * @summary Closes the deletion confirmation modal.
   */
  public onCancelDelete(): void {
    this.showDeleteModal = false;
    this.taskToDelete = null;
  }

  // #endregion

  // #region ─────────────── Task Updates (Status / Priority) ───────────────

  /**
   * @summary Updates the task's status and saves the change.
   * @param newStatus - The selected status value.
   */
  public updateStatus(newStatus: string): void {
    if (!this.task) return;

    this.task.status = newStatus as any;
    this.task.updatedAt = new Date().toISOString();
    this.taskService.updateTask(this.task);

    // Add new record to top of history list
    this.statusHistory.unshift({ status: newStatus, date: this.task.updatedAt });
  }

  /**
   * @summary Updates the task's priority level.
   * @param newPriority - New priority value.
   */
  public updatePriority(newPriority: string): void {
    if (!this.task) return;

    this.task.priority = newPriority as any;
    this.task.updatedAt = new Date().toISOString();
    this.taskService.updateTask(this.task);
  }

  // #endregion

  // #region ─────────────── Navigation Helpers ───────────────

  /** Navigate back to Projects list. */
  goToProjects() {
    this.router.navigate(['/projects']);
  }

  /** Navigate to parent project details page. */
  goToProject(projectId: number | undefined) {
    if (!projectId) return;
    this.router.navigate(['/projects', projectId]);
  }

  // #endregion
}
