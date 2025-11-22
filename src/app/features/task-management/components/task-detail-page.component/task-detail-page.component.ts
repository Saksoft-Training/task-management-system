import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Task } from '../../../../../types/models/task';
import { TaskService } from '../../services/task-service';
import { ProjectService } from '../../../project-management/services/project.service';
import { ConfirmationDialogComponent } from "../../../../shared/components/confirmation-dialog/confirmation-dialog.component";
 
/**
 * @summary
 * Displays detailed information about a single task.
 * Supports edit, status/priority update, and delete with confirmation.
 */
@Component({
  selector: 'app-task-detail-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmationDialogComponent, RouterModule],
  templateUrl: './task-detail-page.component.html',
  styleUrls: ['./task-detail-page.component.scss']
})
export class TaskDetailPageComponent implements OnInit {
 
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
 
  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly taskService: TaskService,
    private readonly projectService: ProjectService
  ) { }
 
  /**
   * Loads task by ID and initializes project name + history
   */
  public projectId!: number;
 
ngOnInit(): void {
  const idParam = this.route.snapshot.paramMap.get('id');
  const id = idParam ? Number(idParam) : null;
 
  if (Number.isNaN(id)) {
    this.router.navigate(['/tasks']);
    return;
  }
 
  const taskId: number = id!;
  this.task = this.taskService.getTaskById(taskId) ?? null;
  if (!this.task) {
    this.router.navigate(['/tasks']);
    return;
  }
 
  this.projectId = this.task.projectId; 
 
  const email = localStorage.getItem('loggedUserEmail') ?? '';
  const project = this.projectService.getById(this.task.projectId, email);
  this.projectName = project?.name ?? 'Unknown Project';
 
  this.statusHistory = [
    {
      status: this.task.status ?? 'Unknown',
      date: this.task.updatedAt ?? this.task.createdAt ?? ''
    },
    {
      status: 'Created',
      date: this.task.createdAt ?? ''
    }
  ];
}
 
  /**
   * Navigate to Edit Task page
   */
  public onEdit(): void {
    if (!this.task) return;
    this.router.navigate(['/tasks/edit', this.task.id]);
  }
 
  /**
   * Open delete confirmation modal
   */
  public onDelete(): void {
    if (!this.task) return;
    this.pendingDeleteTask = this.task;
    this.isDeleteModalOpen = true;
  }
 
  /**
   * Confirm delete + go back to list
   */
  public onConfirmDelete(): void {
    if (this.pendingDeleteTask) {
      this.taskService.deleteTask(this.pendingDeleteTask.id);
    }
 
    this.isDeleteModalOpen = false;
    this.pendingDeleteTask = null;
 
    this.router.navigate(['/tasks']);
  }
 
  /**
   * Cancel delete modal
   */
  public onCancelDelete(): void {
    this.isDeleteModalOpen = false;
    this.pendingDeleteTask = null;
  }
 
  /**
   * Update status
   */
  public updateStatus(newStatus: string): void {
    if (!this.task) return;
 
    this.task.status = newStatus as any;
    this.task.updatedAt = new Date().toISOString();
    this.taskService.updateTask(this.task);
 
    this.statusHistory.unshift({
      status: newStatus,
      date: this.task.updatedAt
    });
  }
 
  /**
   * Update priority
   */
  public updatePriority(newPriority: string): void {
    if (!this.task) return;
 
    this.task.priority = newPriority as any;
    this.task.updatedAt = new Date().toISOString();
    this.taskService.updateTask(this.task);
  }
 
  /** Navigate to projects list */
  public goToProjects() {
    this.router.navigate(['/projects']);
  }
 
  /** Navigate to parent project */
  public goToProject(projectId: number | undefined) {
    if (!projectId) return;
    this.router.navigate(['/projects', projectId]);
  }
}
 