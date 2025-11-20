//#region Imports
import {
  Component, Input, OnDestroy, OnInit, HostListener,
  OnChanges, SimpleChanges
} from '@angular/core';
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
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
//#endregion

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    TaskCardComponent,
    TaskBoardComponent,
    FilterPanelComponent,
    ConfirmationDialogComponent
  ],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent implements OnInit, OnDestroy, OnChanges {

  //#region Inputs
  /**
   * @summary The project ID passed from parent screens.
   * If present → shows project-specific tasks.
   * If absent → displays global task list/board.
   */
  @Input() projectId?: number | null;
  //#endregion

  //#region View Mode
  /**
   * @summary Controls the layout:
   * - project → tasks under a specific project
   * - list → global list mode
   * - board → Kanban board mode
   * - global → fallback mode
   */
  public mode: 'project' | 'list' | 'board' | 'global' = 'project';
  //#endregion

  //#region Task Data
  /** All loaded tasks (filtered by project when needed) */
  public tasks: Task[] = [];

  /** Result of sorting + filtering operations */
  public filtered: Task[] = [];

  /** All users list (for filter sidebar) */
  public allUsers: string[] = [];

  /** Task currently opened in popup (task-card modal) */
  public selectedTask: Task | null = null;
  //#endregion

  //#region Subscriptions
  /** Subscription to task observable for live updates */
  private taskSub!: Subscription;
  //#endregion

  //#region Sorting State
  /** Sort dropdown visibility */
  public showSortMenu = false;

  /** Current sort field */
  public sortField: keyof Task = 'dueDate';

  /** Sorting direction: true = ascending */
  public sortAsc = true;
  //#endregion

  //#region Constructor
  /**
   * @summary Inject services for task loading, routing, project lookup, filters & persistence.
   */
  constructor(
    private readonly route: ActivatedRoute,
    private readonly taskService: TaskService,
    private readonly projectService: ProjectService,
    private readonly userStorage: UserStorageService,
    private readonly router: Router
  ) { }
  //#endregion

  //#region Lifecycle Methods

  /**
   * @summary Initializes users, detects route-based mode,
   * subscribes to tasks stream and loads initial data.
   */
  public ngOnInit(): void {
    console.log('ROUTER URL =', this.router.url);

    // Load all users for Assignee filter
    const users = this.userStorage.getAllUsers();
    this.allUsers = users.map(u => u.name);

    // Watch route parameter changes (projectId updates)
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.projectId = id ? Number(id) : null;
      this.applyTaskLoad(this.taskService.getAllTasks());
    });

    // Detect active UI mode
    this.detectViewMode();

    // Subscribe to task updates
    this.taskSub = this.taskService.tasks$
      .subscribe(tasks => this.applyTaskLoad(tasks));
  }

  /** Cleanup subscription to avoid memory leaks */
  public ngOnDestroy(): void {
    this.taskSub?.unsubscribe();
  }

  /**
   * @summary React to changes in @Input() projectId
   * Ensures parent → child updates work correctly.
   */
  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['projectId']) {
      this.applyTaskLoad(this.taskService.getAllTasks());
    }
  }
  //#endregion

  //#region View Mode Detection
  /**
   * @summary Detects UI layout from URL pattern.
   * Supports:
   * - /projects/:id/board
   * - /projects/:id
   * - /tasks/board
   * - /tasks (global list)
   */
  private detectViewMode(): void {
    const url = this.router.url.toLowerCase();

    if (url.match(/^\/projects\/\d+\/board$/)) {
      this.mode = 'board';
      return;
    }

    if (url.match(/^\/projects\/\d+$/)) {
      this.mode = 'project';
      return;
    }

    if (url === '/tasks/board') {
      this.mode = 'board';
      this.projectId = null;
      return;
    }

    if (url === '/tasks' || url.startsWith('/tasks?')) {
      this.mode = 'list';
      this.projectId = null;
      return;
    }
  }
  //#endregion

  //#region Task Loading + Filtering

  /**
   * @summary Loads tasks & applies project filtering,
   * then passes list through sorting/filtering pipeline.
   */
  private applyTaskLoad(allTasks: Task[]): void {
    this.tasks = this.projectId
      ? allTasks.filter(t => t.projectId === this.projectId)
      : allTasks;

    this.applySorting();
  }
  //#endregion

  //#region Sorting Logic

  /** Toggle visibility of sort menu */
  public toggleSortMenu(): void {
    this.showSortMenu = !this.showSortMenu;
  }

  /** Update active sort field */
  public setSortField(field: keyof Task): void {
    this.sortField = field;
    this.applySorting();
    this.showSortMenu = false;
  }

  /** Set sort direction */
  public setSortDirection(isAscending: boolean): void {
    this.sortAsc = isAscending;
    this.applySorting();
    this.showSortMenu = false;
  }

  /** Returns readable label for sort button */
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

  /** Determines sort arrow shown in UI */
  public getArrow(field: keyof Task): string {
    if (this.sortField !== field) return '↕';
    return this.sortAsc ? '↑' : '↓';
  }

  /**
   * @summary Core sorting + filtering pipeline.
   * Handles:
   * - status / priority filters
   * - assignee filter
   * - date range filters
   * - sorting by date, string, or number
   */
  private applySorting(): void {
    let list = [...this.tasks];

    // ------------------ FILTERS ------------------

    if (this.activeFilters.status.length > 0) {
      list = list.filter(t => this.activeFilters.status.includes(t.status));
    }

    if (this.activeFilters.priority.length > 0) {
      list = list.filter(t => this.activeFilters.priority.includes(t.priority));
    }

    if (this.activeFilters.assignee.length > 0) {
      list = list.filter(t => this.activeFilters.assignee.includes(t.assignee));
    }

    if (this.activeFilters.fromDate) {
      list = list.filter(t => new Date(t.dueDate) >= new Date(this.activeFilters.fromDate));
    }

    if (this.activeFilters.toDate) {
      list = list.filter(t => new Date(t.dueDate) <= new Date(this.activeFilters.toDate));
    }

    // ------------------ SORTING ------------------

    this.filtered = [...list].sort((a, b) => {
      const A: any = a[this.sortField] ?? '';
      const B: any = b[this.sortField] ?? '';

      // Date-based fields
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

  /** Quick sort toggle for table headers */
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
  //#endregion

  //#region Task Popup Handling

  /** Open task detail popup */
  public openCard(task: Task): void {
    this.selectedTask = task;
  }

  /** Close task detail popup */
  public closeCard(): void {
    this.selectedTask = null;
  }
  //#endregion

  //#region Click Outside (Sort Menu)
  /** Automatically close sort menu when clicking outside */
  @HostListener('document:click', ['$event'])
  public handleOutsideClick(event: Event): void {
    const clickedInside = (event.target as HTMLElement)
      .closest('.tl-sort-box, .tl-sort-menu');

    if (!clickedInside) {
      this.showSortMenu = false;
    }
  }
  //#endregion

  //#region CRUD Operations
  /** Navigate to edit-task page */
  public editTask(task: Task): void {
    this.router.navigate(['/tasks/edit', task.id]);
  }

  /** Modal visibility for delete action */
  public showDeleteModal = false;

  /** Stores task selected for deletion */
  public taskToDelete: Task | null = null;

  /** Open delete confirmation dialog */
  public deleteTask(task: Task) {
    this.taskToDelete = task;
    this.showDeleteModal = true;
  }

  /** Deletes the task and refreshes list */
  public onConfirmDelete() {
    if (this.taskToDelete) {
      this.taskService.deleteTask(this.taskToDelete.id);
    }
    this.showDeleteModal = false;
    this.taskToDelete = null;
  }

  /** Cancels delete modal */
  public onCancelDelete(): void {
    this.showDeleteModal = false;
    this.taskToDelete = null;
  }
  //#endregion

  //#region Mode Switching

  /**
   * @summary Toggles between list and board mode.
   * Updates route accordingly.
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
  //#endregion

  //#region Helpers

  /** Get project name by ID */
  public getProjectName(id: number): string {
    const email = localStorage.getItem('loggedUserEmail') || '';
    return this.projectService.getById(id, email)?.name || 'Unknown';
  }

  /** Shows summary text like “Showing 8 of 13 tasks” */
  public getShowingText(): string {
    return `Showing ${this.filtered.length} of ${this.tasks.length} tasks`;
  }

  /** For board view → return tasks belonging to a column/status */
  public getTasks(status: string): Task[] {
    return this.filtered.filter(t => t.status === status);
  }

  /** Controls visibility of filter sidebar */
  public showFilter = false;

  /** Active filter configuration */
  public activeFilters: any = {
    status: [],
    priority: [],
    assignee: [],
    fromDate: null,
    toDate: null,
  };

  /** Update filters from child component */
  public applyFilters(f: any) {
    this.activeFilters = f;
    this.applySorting();
  }
  //#endregion

}
