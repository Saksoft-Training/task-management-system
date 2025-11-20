//#region Imports
import { Component, Input, OnDestroy, OnInit, HostListener, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { Task } from '../../../../../types';
import { TaskCardComponent } from '../task-card.component/task-card.component';
import { TaskBoardComponent } from '../task-board.component/task-board.component';
import { ProjectService } from '../../../project-management/services/project.service';
import { TaskService } from '../../services/task-service';
import { FilterPanelComponent } from "../filter-panel.component/filter-panel.component";
import { UserStorageService } from '../../../../shared/services/storage-service';
import { DeleteConfirmModalComponent } from "../delete-confirm-modal.component/delete-confirm-modal.component";
//#endregion

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, TaskCardComponent, TaskBoardComponent, FilterPanelComponent, DeleteConfirmModalComponent],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent implements OnInit, OnDestroy, OnChanges {

  /* --------------------------------------
   * INPUTS
   * -------------------------------------- */

  /** Incoming project ID (optional: used in all project-specific views) */
  @Input() projectId?: number | null;

  /* --------------------------------------
   * VIEW MODE STATE
   * -------------------------------------- */

  /**
   * Determines which UI layout to render:
   * - "project": tasks under a specific project
   * - "list": global list mode
   * - "board": board/Kanban mode
   * - "global": fallback for all tasks
   */
  public mode: 'project' | 'list' | 'board' | 'global' = 'project';

  /* --------------------------------------
   * TASK DATA
   * -------------------------------------- */

  /** All tasks (filtered by project when applicable) */
  public tasks: Task[] = [];

  /** Tasks after sorting + filtering applied */
  public filtered: Task[] = [];

  public allUsers: string[] = [];

  /** Currently opened task card in popup */
  public selectedTask: Task | null = null;

  /* --------------------------------------
   * DATA SUBSCRIPTIONS
   * -------------------------------------- */

  /** Task observable subscription for live updates */
  private taskSub!: Subscription;

  /* --------------------------------------
   * SORTING STATE
   * -------------------------------------- */

  /** Controls dropdown visibility */
  public showSortMenu = false;

  /** Current sorting field */
  public sortField: keyof Task = 'dueDate';

  /** Sorting direction: true = ascending */
  public sortAsc = true;

  /* --------------------------------------
   * CONSTRUCTOR
   * -------------------------------------- */
  constructor(
    private readonly route: ActivatedRoute,
    private readonly taskService: TaskService,
    private readonly projectService: ProjectService,
    private readonly userStorage: UserStorageService,
    private readonly router: Router
  ) { }

  //#region Lifecycle Methods

  /** OnInit → detect route, determine mode, load tasks, subscribe for updates */
  public ngOnInit(): void {
    console.log('ROUTER URL =', this.router.url);

    // Load users for Assignee filter
    const users = this.userStorage.getAllUsers();
    this.allUsers = users.map(u => u.name);

    // Listen for route param changes
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.projectId = id ? Number(id) : null;
      this.applyTaskLoad(this.taskService.getAllTasks());
    });

    this.detectViewMode();

    this.taskSub = this.taskService.tasks$
      .subscribe(tasks => this.applyTaskLoad(tasks));
  }


  /** Unsubscribe to prevent memory leaks */
  public ngOnDestroy(): void {
    this.taskSub?.unsubscribe();
  }

  /** React to input changes like new projectId from parent component */
  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['projectId']) {
      this.applyTaskLoad(this.taskService.getAllTasks());
    }
  }

  //#endregion

  /* --------------------------------------
   * VIEW MODE DETECTION
   * -------------------------------------- */

  /**
   * Detects the correct display mode based on the current URL.
   * Handles:
   * - /projects/:id/board
   * - /projects/:id
   * - /tasks/board
   * - /tasks (global)
   */
  private detectViewMode(): void {
    const url = this.router.url.toLowerCase();

    // Project board mode
    if (url.match(/^\/projects\/\d+\/board$/)) {
      this.mode = 'board';
      return;
    }

    // Project list mode
    if (url.match(/^\/projects\/\d+$/)) {
      this.mode = 'project';
      return;
    }

    // Global board
    if (url === '/tasks/board') {
      this.mode = 'board';
      this.projectId = null;
      return;
    }

    // Global list
    if (url === '/tasks' || url.startsWith('/tasks?')) {
      this.mode = 'list';
      this.projectId = null;
      return;
    }
  }

  /* --------------------------------------
   * LOADING & FILTERING TASKS
   * -------------------------------------- */

  /**
   * Loads all tasks and applies project filtering
   * when projectId is active.
   */
  private applyTaskLoad(allTasks: Task[]): void {
    this.tasks = this.projectId
      ? allTasks.filter(t => t.projectId === this.projectId)
      : allTasks;

    this.applySorting();
  }

  /* --------------------------------------
   * SORTING CONTROLS
   * -------------------------------------- */

  /** Toggle sort dropdown menu */
  public toggleSortMenu(): void {
    this.showSortMenu = !this.showSortMenu;
  }

  /** Set sorting field and close dropdown */
  public setSortField(field: keyof Task): void {
    this.sortField = field;
    this.applySorting();
    this.showSortMenu = false;
  }

  /** Set sorting direction and close dropdown */
  public setSortDirection(isAscending: boolean): void {
    this.sortAsc = isAscending;
    this.applySorting();
    this.showSortMenu = false;
  }

  /** Returns readable label for sort controls */
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

  /** Arrow indicator for active sort field in UI */
  public getArrow(field: keyof Task): string {
    if (this.sortField !== field) return '↕';
    return this.sortAsc ? '↑' : '↓';
  }

  /**
   * Sorting logic:
   * - Date sorting for dueDate / createdAt
   * - Lexical sorting for strings
   * - Numeric sorting for numbers
   */
  private applySorting(): void {
    let list = [...this.tasks];

    // ---------------- FILTERS -------------------

    // Status filters
    if (this.activeFilters.status.length > 0) {
      list = list.filter(t =>
        this.activeFilters.status.includes(t.status)
      );
    }

    // Priority filters
    if (this.activeFilters.priority.length > 0) {
      list = list.filter(t =>
        this.activeFilters.priority.includes(t.priority)
      );
    }

    // Assignee filters
    if (this.activeFilters.assignee.length > 0) {
      list = list.filter(t =>
        this.activeFilters.assignee.includes(t.assignee)
      );
    }

    // From date filter
    if (this.activeFilters.fromDate) {
      list = list.filter(t =>
        new Date(t.dueDate) >= new Date(this.activeFilters.fromDate)
      );
    }

    // To date filter
    if (this.activeFilters.toDate) {
      list = list.filter(t =>
        new Date(t.dueDate) <= new Date(this.activeFilters.toDate)
      );
    }

    // ---------------- SORTING -------------------
    this.filtered = [...list].sort((a, b) => {
      const A: any = a[this.sortField] ?? '';
      const B: any = b[this.sortField] ?? '';

      // Date sorting
      if (this.sortField === 'dueDate' || this.sortField === 'createdAt') {
        const dA = new Date(A).getTime();
        const dB = new Date(B).getTime();
        return this.sortAsc ? dA - dB : dB - dA;
      }

      // String sorting
      if (typeof A === 'string' || typeof B === 'string') {
        return this.sortAsc
          ? String(A).localeCompare(String(B))
          : String(B).localeCompare(String(A));
      }

      // Number sorting
      if (typeof A === 'number' && typeof B === 'number') {
        return this.sortAsc ? A - B : B - A;
      }

      return 0;
    });
  }

  /** Quick sort toggle for UI list headers */
  public changeSort(field: keyof Task): void {
    if (this.sortField === field) {
      this.sortAsc = !this.sortAsc;
    } else {
      this.sortField = field;
      this.sortAsc = true;
    }

    this.applySorting();
    this.showSortMenu = false;
  }

  /* --------------------------------------
   * TASK CARD POPUP HANDLING
   * -------------------------------------- */

  /** Open task card modal */
  public openCard(task: Task): void {
    this.selectedTask = task;
  }

  /** Close task card modal */
  public closeCard(): void {
    this.selectedTask = null;
  }

  /* --------------------------------------
   * CLICK OUTSIDE HANDLING
   * -------------------------------------- */

  /** Auto-close sort dropdown when clicked outside */
  @HostListener('document:click', ['$event'])
  public handleOutsideClick(event: Event): void {
    const clickedInside = (event.target as HTMLElement)
      .closest('.sort-box, .sort-menu');

    if (!clickedInside) {
      this.showSortMenu = false;
    }
  }

  /* --------------------------------------
   * CRUD OPERATIONS
   * -------------------------------------- */

  /** Navigate to edit screen */
  public editTask(task: Task): void {
    this.router.navigate(['/tasks/edit', task.id]);
  }

  /** Delete task after confirmation */

  /* --------------------------------------
   * MODE SWITCHING
   * -------------------------------------- */

  /**
   * Switch between list mode and board mode,
   * and navigate to appropriate route.
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

  /** Navigate to create-task page */
  public createTask(): void {
    this.router.navigate(['/tasks/create'], {
      queryParams: { projectId: this.projectId }
    });
  }

  /** Returns readable project name */
  public getProjectName(id: number): string {
    const email = localStorage.getItem('loggedUserEmail') || '';
    return this.projectService.getById(id, email)?.name || 'Unknown';
  }

  /* --------------------------------------
   * DISPLAY HELPERS
   * -------------------------------------- */

  /** Returns text like "Showing X of Y tasks" */
  public getShowingText(): string {
    return `Showing ${this.filtered.length} of ${this.tasks.length} tasks`;
  }

  /** Used by task board → returns tasks under specific status */
  public getTasks(status: string): Task[] {
    return this.filtered.filter(t => t.status === status);
  }

  public showFilter = false;

  public activeFilters: any = {
    status: [],
    priority: [],
    assignee: [],
    fromDate: null,
    toDate: null,
  };
  public applyFilters(f: any) {
    this.activeFilters = f;
    this.applySorting();  // refresh after filters
  }

  public showDeleteModal = false;
public taskToDelete: Task | null = null;

public deleteTask(task: Task) {
  this.taskToDelete = task;
  this.showDeleteModal = true;
}

public onConfirmDelete() {
  if (this.taskToDelete) {
    this.taskService.deleteTask(this.taskToDelete.id);
  }
  this.showDeleteModal = false;
  this.taskToDelete = null;
}


public onCancelDelete(): void {
  this.showDeleteModal = false;
  this.taskToDelete = null;
  this.selectedTask = null;  
  this.router.navigate(['/tasks']);
}

}
