import { Component, Input, OnDestroy, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { Task } from '../../../../../types';
import { TaskService } from '../../services/task-service';
import { ProjectService } from '../../../project-management/services/project-service';
import { TaskCardComponent } from '../task-card.component/task-card.component';
import { TaskBoardComponent } from "../task-board.component/task-board.component";

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, TaskCardComponent, TaskBoardComponent],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent implements OnInit, OnDestroy {

  /* --------------------------------------
   * Inputs
   * -------------------------------------- */
  @Input() projectId?: number | null;

  /* --------------------------------------
   * View Mode State
   * -------------------------------------- */
  public mode: 'project' | 'list' | 'board' | 'global' = 'project';

  /* --------------------------------------
   * Task Data
   * -------------------------------------- */
  public tasks: Task[] = [];
  public filtered: Task[] = [];
  public selectedTask: Task | null = null;

  /* --------------------------------------
   * Subscription
   * -------------------------------------- */
  private taskSub!: Subscription;

  /* --------------------------------------
   * Sorting Controls
   * -------------------------------------- */
  public showSortMenu = false;
  public sortField: keyof Task = 'dueDate';
  public sortAsc = true;

  constructor(
    private readonly taskService: TaskService,
    private readonly projectService: ProjectService,
    private readonly router: Router
  ) { }

  /** Initialize component, detect mode, and load tasks. */
  public ngOnInit(): void {
    this.detectViewMode();

    this.taskSub = this.taskService.tasks$
      .subscribe(tasks => this.applyTaskLoad(tasks));

    this.applyTaskLoad(this.taskService.getAll());
  }

  /** Clean up subscriptions to avoid memory leaks. */
  public ngOnDestroy(): void {
    this.taskSub?.unsubscribe();
  }

  /**
   * Determines whether the component is in:
   *  - project mode
   *  - global list mode
   *  - board mode
   */
  private detectViewMode(): void {
  const url = this.router.url.toLowerCase();

  // Project board: /projects/:id/board
  if (url.includes('/projects') && url.includes('/board')) {
    this.mode = 'board';
    return;
  }

  // Global board: /tasks/board
  if (url === '/tasks/board') {
    this.mode = 'board';
    this.projectId = null;   // IMPORTANT
    return;
  }

  // Global list
  if (url === '/tasks' || url.startsWith('/tasks?')) {
    this.mode = 'list';
    this.projectId = null;
    return;
  }

  // Project list
  if (url.includes('/projects')) {
    this.mode = 'project';
    return;
  }
}

  /**
   * Loads tasks and applies project filtering.
   */
  private applyTaskLoad(allTasks: Task[]): void {
    this.tasks = this.projectId
      ? allTasks.filter(t => t.projectId === this.projectId)
      : allTasks;

    this.applySorting();
  }

  /** Toggle the sort options popup menu. */
  public toggleSortMenu(): void {
    this.showSortMenu = !this.showSortMenu;
  }

  /** Update which field is used for sorting. */
  public setSortField(field: keyof Task): void {
    this.sortField = field;
    this.applySorting();
  }

  /** Update sorting direction (ascending/descending). */
  public setSortDirection(isAscending: boolean): void {
    this.sortAsc = isAscending;
    this.applySorting();
  }

  /** Returns human-friendly text for the currently selected sort field. */
  public getSortLabel(): string {
    switch (this.sortField) {
      case 'dueDate': return 'Due Date';
      case 'priority': return 'Priority';
      case 'status': return 'Status';
      case 'title': return 'Title';
      case 'createdAt': return 'Created Date';
      default: return 'Sort';
    }
  }

  /** Returns indicators for UI. */
  public getArrow(field: keyof Task): string {
    if (this.sortField !== field) return '↕';
    return this.sortAsc ? '↑' : '↓';
  }

  /**
   * Sort tasks using:
   *  - date sorting for dueDate / createdAt
   *  - localeCompare for strings
   *  - numeric comparison for numbers
   */
  private applySorting(): void {
    this.filtered = [...this.tasks].sort((a, b) => {
      let A: any = a[this.sortField] ?? '';
      let B: any = b[this.sortField] ?? '';

      // Date Sorting
      if (this.sortField === 'dueDate' || this.sortField === 'createdAt') {
        const dateA = new Date(A).getTime();
        const dateB = new Date(B).getTime();
        return this.sortAsc ? dateA - dateB : dateB - dateA;
      }

      // String Sorting
      if (typeof A === 'string' || typeof B === 'string') {
        return this.sortAsc
          ? String(A).localeCompare(String(B))
          : String(B).localeCompare(String(A));
      }

      // Numeric Sorting
      if (typeof A === 'number' && typeof B === 'number') {
        return this.sortAsc ? A - B : B - A;
      }

      return 0;
    });
  }

  /** Change sort field or toggle sort direction. Used by UI. */
  public changeSort(field: keyof Task): void {
    if (this.sortField === field) {
      this.sortAsc = !this.sortAsc;
    } else {
      this.sortField = field;
      this.sortAsc = true;
    }
    this.applySorting();
  }

  /** Opens the selected task card popup. */
  public openCard(task: Task): void {
    this.selectedTask = task;
  }

  /** Closes the popup card. */
  public closeCard(): void {
    this.selectedTask = null;
  }

  /** Hide sort menu when clicking outside. */
  @HostListener('document:click', ['$event'])
  public handleOutsideClick(event: Event): void {
    const clickedInside = (event.target as HTMLElement)
      .closest('.sort-box, .sort-menu');

    if (!clickedInside) {
      this.showSortMenu = false;
    }
  }


  /** Navigate to edit screen for a given task. */
  public editTask(task: Task): void {
    this.router.navigate(['/tasks/edit', task.id]);
  }

  /** Delete a task after confirmation. */
  public deleteTask(task: Task): void {
    if (!task) return;

    if (confirm(`Delete task "${task.title}"?`)) {
      this.taskService.delete(task.id);
    }
  }

  /* ======================================
   *   VIEW MODE SWITCHING
   * ====================================== */

  /**
   * Switch between list and board views,
   * and navigate accordingly.
   */
  public setMode(view: 'list' | 'board'): void {
    this.mode = view;

    if (view === 'board') {
      this.projectId
        ? this.router.navigate([`/projects/${this.projectId}/board`])
        : this.router.navigate(['/tasks/board']);
      return;
    }

    if (view === 'list') {
      this.projectId
        ? this.router.navigate([`/projects/${this.projectId}`])
        : this.router.navigate(['/tasks']);
    }
  }

  /** Navigate to create-task page with optional project ID. */
  public createTask(): void {
    this.router.navigate(['/tasks/create'], {
      queryParams: { projectId: this.projectId }
    });
  }

  /** Returns project name for display. */
  public getProjectName(id: number): string {
    const email = localStorage.getItem('loggedUserEmail') || '';
    return this.projectService.getById(id, email)?.name || 'Unknown';
  }

  /** Display text like "Showing X of Y tasks". */
  public getShowingText(): string {
    return `Showing ${this.filtered.length} of ${this.tasks.length} tasks`;
  }
  /** Used by the board to show tasks grouped by status */
  public getTasks(status: string) {
    return this.filtered.filter(t => t.status === status);
  }
}
