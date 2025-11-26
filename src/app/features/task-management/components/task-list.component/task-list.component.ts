//#region Imports
import {
  Component, Input, OnDestroy, OnInit, HostListener,
  OnChanges, SimpleChanges, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
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
    RouterLink,
    ConfirmationDialogComponent
  ],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent implements OnInit, OnDestroy, OnChanges {

  //#region Inputs

  /** 
   * @summary Receives project ID from parent page (if opened under a project). 
   * If null → the list displays global tasks. 
   */
  @Input() projectId?: number | null;

  //#endregion

  //#region View Mode

  /**
   * @summary Defines which layout is currently active.
   * - 'project': task list inside a project details page
   * - 'list': normal task list
   * - 'board': kanban view
   * - 'global': all tasks in the system
   */
  public viewMode: 'project' | 'list' | 'board' | 'global' = 'project';

  //#endregion

  //#region Task Data

  /** All tasks fetched from taskService */
  public tasks: Task[] = [];

  /** Tasks after filtering + sorting */
  public filteredTasks: Task[] = [];

  /** List of all possible assignees */
  public allUsers: string[] = [];

  /** Task currently opened in popup */
  public activeTask: Task | null = null;

  /** Logged in user email */
  public userEmail: string = '';

  //#endregion

  //#region Unsubscription Handler

  /** Emits when component should cleanup (instead of multiple subscriptions) */
  private destroy$ = new Subject<void>();

  //#endregion

  //#region Sorting

  /** Whether sort dropdown is open */
  public isSortMenuOpen = false;

  /** Field used for sorting (default = dueDate) */
  public sortField: keyof Task = 'dueDate';

  /** Sorting direction */
  public sortAsc = true;

  //#endregion

  //#region Constructor

  /**
   * @summary Constructor injecting required services.
   * @param route Provides route parameters such as projectId
   * @param taskService Handles all task CRUD/API operations
   * @param projectService Provides project metadata
   * @param userStorage Retrieves user list (assignees)
   * @param router Navigation
   * @param cdr Manually triggers Angular change detection when subscribing to async API data
   */
  constructor(
    private readonly route: ActivatedRoute,
    private readonly taskService: TaskService,
    public readonly projectService: ProjectService,
    private readonly userStorage: UserStorageService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) { }

  //#endregion

  //#region Lifecycle

  /**
   * @summary Initializes component:
   * - Loads logged-in user details
   * - Fetches user list from API
   * - Listens for projectId changes
   * - Subscribes to task stream from TaskService
   */
  public ngOnInit(): void {

    // Load current user safely
    const user =
      JSON.parse(localStorage.getItem('currentUser') || 'null') ||
      JSON.parse(sessionStorage.getItem('currentUser') || 'null');

    this.userEmail = user?.email || '';

    /**
     * NEW CODE:
     * Fetch all users from API instead of localStorage
     */
    this.userStorage.getAllUsersFromApi()
      .pipe(takeUntil(this.destroy$))
      .subscribe(users => {
        this.allUsers = users.map(u => u.name || u.email);
        this.cdr.detectChanges();
      });

    /**
     * Watch route changes → update projectId when project pages change.
     */
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const id = params.get('id');
        this.projectId = id ? Number(id) : null;
        this.loadTasks(this.taskService.getAllTasks());
        this.cdr.detectChanges();
      });

    // Determine initial visual mode (task list / board / project)
    this.detectViewMode();

    /**
     * Subscribe to task stream.
     * Whenever TaskService pushes an update, refresh list.
     */
    this.taskService.tasks$
      .pipe(takeUntil(this.destroy$))
      .subscribe(tasks => {
        this.loadTasks(tasks);
        this.cdr.detectChanges();
      });
  }

  /**
   * @summary Runs when input bindings change (like projectId).
   */
  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['projectId']) {
      this.loadTasks(this.taskService.getAllTasks());
      this.cdr.detectChanges();
    }
  }

  /**
   * @summary Cleanup observable streams on destroy.
   */
  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  //#endregion

  //#region View Mode Logic

  /**
   * @summary Detects current page structure based on URL.
   * Ensures correct view mode (list / board / project context).
   */
  private detectViewMode(): void {
    const url = this.router.url.toLowerCase();

    if (url.match(/^\/projects\/\d+\/board$/)) {
      this.viewMode = 'board';
      return;
    }

    if (url.match(/^\/projects\/\d+\/tasks$/)) {
      this.viewMode = 'list';
      this.projectId = Number(this.route.snapshot.paramMap.get('id'));
      return;
    }

    if (url.match(/^\/projects\/\d+$/)) {
      this.viewMode = 'list';
      this.projectId = Number(this.route.snapshot.paramMap.get('id'));
      return;
    }

    if (url === '/tasks/board') {
      this.viewMode = 'board';
      this.projectId = null;
      return;
    }

    if (url === '/tasks' || url.startsWith('/tasks?')) {
      this.viewMode = 'list';
      this.projectId = null;
      return;
    }
  }

  //#endregion

  //#region Load + Filter + Sort

  /**
   * @summary Loads tasks into component:
   * - Filters by project if projectId exists
   * - Then applies filtering + sorting
   */
  private loadTasks(allTasks: Task[]): void {
    this.tasks = this.projectId
      ? allTasks.filter(t => t.projectId === this.projectId)
      : allTasks.slice();

    this.sortTasks();
    this.cdr.detectChanges();
  }

  /**
   * @summary Applies filtering & sorting logic.
   * (Status, priority, assignee, date range)
   */
  private sortTasks(): void {
    let list = [...this.tasks];

    // Apply each filter
    if (this.appliedFilters.status.length > 0) {
      list = list.filter(t => this.appliedFilters.status.includes(t.status));
    }

    if (this.appliedFilters.priority.length > 0) {
      list = list.filter(t => this.appliedFilters.priority.includes(t.priority));
    }

    if (this.appliedFilters.assignee.length > 0) {
      list = list.filter(t => this.appliedFilters.assignee.includes(t.assignee));
    }

    if (this.appliedFilters.fromDate) {
      list = list.filter(t => new Date(t.dueDate) >= new Date(this.appliedFilters.fromDate));
    }

    if (this.appliedFilters.toDate) {
      list = list.filter(t => new Date(t.dueDate) <= new Date(this.appliedFilters.toDate));
    }

    /**
     * Sorting (NEW + OLD logic combined)
     */
    this.filteredTasks = [...list].sort((a, b) => {
      const A: any = a[this.sortField] ?? '';
      const B: any = b[this.sortField] ?? '';

      if (this.sortField === 'dueDate' || this.sortField === 'createdAt') {
        const dA = new Date(A).getTime();
        const dB = new Date(B).getTime();
        return this.sortAsc ? dA - dB : dB - dA;
      }

      if (typeof A === 'string' || typeof B === 'string') {
        return this.sortAsc
          ? String(A).localeCompare(String(B))
          : String(B).localeCompare(String(A));
      }

      return 0;
    });
  }

  //#endregion

  //#region Sorting Controls

  /** Toggles sort dropdown open/close */
  public toggleSortMenu(): void {
    this.isSortMenuOpen = !this.isSortMenuOpen;
  }

  /** User selects sort field (status / dueDate / priority / title) */
  public setSortField(field: keyof Task): void {
    this.sortField = field;
    this.sortTasks();
    this.isSortMenuOpen = false;
    this.cdr.detectChanges();
  }

  /** User selects ascending or descending sorting */
  public setSortDirection(isAscending: boolean): void {
    this.sortAsc = isAscending;
    this.sortTasks();
    this.isSortMenuOpen = false;
    this.cdr.detectChanges();
  }

  /** Returns friendly sort label for UI dropdown */
  public getSortLabel(): string {
    switch (this.sortField) {
      case 'dueDate': return 'Due Date';
      case 'priority': return 'Priority';
      case 'status': return 'Status';
      case 'title': return 'Title';
      default: return 'Sort';
    }
  }

  /**
   * @summary Closes sort menu when clicking outside
   */
  @HostListener('document:click', ['$event'])
  public handleOutsideClick(event: Event): void {
    const clickedInside = (event.target as HTMLElement)
      .closest('.tl-sort-box, .tl-sort-menu');

    if (!clickedInside) {
      this.isSortMenuOpen = false;
    }
  }

  //#endregion

  //#region Task Popup

  /** Opens task detail popup */
  public openCard(task: Task): void {
    this.activeTask = task;
    this.cdr.detectChanges();
  }

  /** Closes popup */
  public closeCard(): void {
    this.activeTask = null;
    this.cdr.detectChanges();
  }

  //#endregion

  //#region CRUD

  /** User confirmation dialog state */
  public isDeleteModalOpen = false;

  /** Task pending deletion */
  public pendingDeleteTask: Task | null = null;

  /** Opens confirmation dialog */
  public deleteTask(task: Task): void {
    this.pendingDeleteTask = task;
    this.isDeleteModalOpen = true;
    this.cdr.detectChanges();
  }

  /** Confirms deletion */
  public onConfirmDelete(): void {
    if (this.pendingDeleteTask) {
      this.taskService.deleteTask(this.pendingDeleteTask.id);
    }
    this.isDeleteModalOpen = false;
    this.pendingDeleteTask = null;
    this.cdr.detectChanges();
  }

  /** Cancels deletion */
  public onCancelDelete(): void {
    this.isDeleteModalOpen = false;
    this.pendingDeleteTask = null;
    this.cdr.detectChanges();
  }

  //#endregion

  //#region Mode Switch

  /**
   * @summary Switches between List and Board layout.
   * Ensures correct navigation based on project or global context.
   */
  public setMode(view: 'list' | 'board'): void {
    this.viewMode = view;

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

  /**
   * @summary Returns project name based on projectId
   */
  public getProjectName(id: number): string {

    // Same logic as TaskCardComponent
    const user =
      JSON.parse(localStorage.getItem('currentUser') || 'null') ||
      JSON.parse(sessionStorage.getItem('currentUser') || 'null');

    const email: string = user?.email || '';

    const project = this.projectService.getById(id, email);

    return project?.name || 'Unknown Project';
  }

  /** Text showing "x of y tasks" */
  public getShowingText(): string {
    return `Showing ${this.filteredTasks.length} of ${this.tasks.length} tasks`;
  }

  /** Returns tasks filtered by a given status */
  public getTasks(status: string): Task[] {
    return this.filteredTasks.filter(t => t.status === status);
  }

  /** Controls visibility of filter panel */
  public isFilterOpen = false;

  /** All active filters (used by filter panel) */
  public appliedFilters: any = {
    status: [],
    priority: [],
    assignee: [],
    fromDate: null,
    toDate: null,
  };

  /** Changing sort field by clicking on header row */
  public changeSort(field: keyof Task): void {
    if (this.sortField === field) {
      this.sortAsc = !this.sortAsc;
    } else {
      this.sortField = field;
      this.sortAsc = true;
    }
    this.sortTasks();
    this.isSortMenuOpen = false;
    this.cdr.detectChanges();
  }

  /** Navigates user to edit-task page */
  public editTask(task: Task): void {
    this.router.navigate(['/tasks/edit', task.id]);
  }

  /** Applies filters emitted by FilterPanelComponent */
  public applyFilters(f: any): void {
    this.appliedFilters = f;
    this.sortTasks();
    this.cdr.detectChanges();
  }

  /**
   * @summary Angular performance helper:
   * Ensures that when tasks update, *only changed tasks re-render*.
   */
  public trackByTask(index: number, item: Task): any {
    return item?.id ?? index;
  }

  //#endregion
}