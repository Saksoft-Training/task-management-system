import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Task } from '../../../../../types/models/task';
import { TaskService } from '../../services/task-service';
import { ProjectService } from '../../../project-management/services/project.service';
import { DeleteConfirmModalComponent } from "../delete-confirm-modal.component/delete-confirm-modal.component";

/**
 * @summary
 * Task detail page component — shows a single task, allows editing,
 * status/priority updates and deletion via a confirmation modal.
 */
@Component({
  selector: 'app-task-detail-page',
  standalone: true,
  imports: [CommonModule, FormsModule, DeleteConfirmModalComponent],
  templateUrl: './task-detail-page.component.html',
  styleUrls: ['./task-detail-page.component.scss']
})
export class TaskDetailPageComponent implements OnInit {

  //#region ─────────────── Component State / Inputs ───────────────

  /** The currently displayed task. `null` when not found. */
  public task: Task | null = null;

  /** Human-readable project name for the task. */
  public projectName: string = '';

  /** Lightweight status change history for UI display. */
  public statusHistory: { status: string; date: string }[] = [];

  /** Controls the visibility of the delete confirmation modal. */
  public showDeleteModal: boolean = false;

  /** Holds a reference to the task being deleted while modal is open. */
  public taskToDelete: Task | null = null;

  /** Allowed priority options for select controls. */
  public readonly priorityOptions: string[] = ['Low', 'Medium', 'High', 'Urgent'];

  /** Allowed status options for select controls. */
  public readonly statusOptions: string[] = ['To Do', 'In Progress', 'Completed'];

  //#endregion

  //#region ─────────────── Constructor / DI ───────────────

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly taskService: TaskService,
    private readonly projectService: ProjectService
  ) { }

  //#endregion

  //#region ─────────────── Lifecycle Hooks ───────────────

  /**
   * Initialize component: read route id, fetch task and project information,
   * and build a minimal status history for display.
   */
  public ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;

    if (Number.isNaN(id)) {
      // If id is invalid, navigate back to list (defensive fallback).
      this.router.navigate(['/tasks']);
      return;
    }

    this.task = this.taskService.getTaskById(id) ?? null;

    if (!this.task) {
      // Task not found — navigate back to tasks list.
      this.router.navigate(['/tasks']);
      return;
    }

    // Load project name (safely retrieve logged user email if present)
    const email = localStorage.getItem('loggedUserEmail') ?? '';
    const project = this.projectService.getById(this.task.projectId, email);
    this.projectName = project?.name ?? 'Unknown Project';

    // Build a lightweight status history (most recent first)
    this.statusHistory = [
      { status: this.task.status ?? 'Unknown', date: this.task.updatedAt ?? this.task.createdAt ?? '' },
      { status: 'Created', date: this.task.createdAt ?? '' }
    ];
  }

  //#endregion

  //#region ─────────────── Navigation / Edit / Delete Handlers ───────────────

  /**
   * Navigate to edit page for the current task.
   */
  public onEdit(): void {
    if (!this.task) {
      return;
    }

    // Using navigate without awaiting; it returns a Promise<boolean>.
    this.router.navigate(['/tasks/edit', this.task.id]);
  }

  /**
   * Open delete confirmation modal for the current task.
   */
  public onDelete(): void {
    if (!this.task) {
      return;
    }
    this.taskToDelete = this.task;
    this.showDeleteModal = true;
  }

  /**
   * Confirm deletion, call the service to delete and navigate away.
   */
  public onConfirmDelete(): void {
    if (this.taskToDelete) {
      this.taskService.deleteTask(this.taskToDelete.id);
    }

    // Reset modal state and navigate back to tasks list.
    this.showDeleteModal = false;
    this.taskToDelete = null;
    this.router.navigate(['/tasks']);
  }

  /**
   * Close the delete modal without deleting.
   */
  public onCancelDelete(): void {
    this.showDeleteModal = false;
    this.taskToDelete = null;
  }

  //#endregion

  //#region ─────────────── Task Updates (Status / Priority) ───────────────

  /**
   * Update task status and persist change.
   * @param newStatus New status string selected by the user.
   */
  public updateStatus(newStatus: string): void {
    if (!this.task) {
      return;
    }

    this.task.status = newStatus as any;
    this.task.updatedAt = new Date().toISOString();
    this.taskService.updateTask(this.task);

    // update local status history (prepend new status)
    this.statusHistory.unshift({ status: newStatus, date: this.task.updatedAt });
  }

  /**
   * Update task priority and persist change.
   * @param newPriority New priority string selected by the user.
   */
  public updatePriority(newPriority: string): void {
    if (!this.task) {
      return;
    }

    this.task.priority = newPriority as any;
    this.task.updatedAt = new Date().toISOString();
    this.taskService.updateTask(this.task);
  }

  goToProjects() {
    this.router.navigate(['/projects']);
  }

  goToProject(projectId: number | undefined) {
    if (!projectId) return;
    this.router.navigate(['/projects', projectId]);
  }

  //#endregion
}
