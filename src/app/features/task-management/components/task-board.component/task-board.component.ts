//#region Imports
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { Task, TaskStatus } from '../../../../../types';
import { TaskService } from '../../services/task-service';
import { ProjectService } from '../../../project-management/services/project.service';
import { FilterPanelComponent } from "../filter-panel.component/filter-panel.component";
import { UserStorageService } from '../../../../shared/services/storage-service';
//#endregion

@Component({
  selector: 'app-task-board',
  standalone: true,
  imports: [CommonModule, RouterLink, FilterPanelComponent],
  templateUrl: './task-board.component.html',
  styleUrls: ['./task-board.component.scss']
})
export class TaskBoardComponent implements OnInit, OnDestroy {
  // #region Task Data

  /** All tasks fetched from the service. */
  public tasks: Task[] = [];
  /** Filtered tasks after filters & sorting. */
  public filteredTasks: Task[] = [];

  // #endregion

  // #region Project Info

  /** If board is for a specific project, this holds the projectId. */
  public projectId: number | null = null;
  /** Indicates if this view belongs to a specific project board. */
  public isProjectBoard = false;
  /** Holds project details when in project mode. */
  public projectDetails: any = null;
  /** Count of tasks belonging to this board (after filtering). */
  public projectTasksCount = 0;

  // #endregion

  // #region Sorting

  /** Current sorting field. */
  public sortField: keyof Task = 'dueDate';
  /** Sorting direction. */
  public sortAsc = true;
  /** Toggles the sort dropdown menu. */
  public isSortMenuOpen = false;

  // #endregion

  // #region Status Columns

  /** Available status categories for grouping. */
  public readonly statuses: TaskStatus[] = ['To Do', 'In Progress', 'Completed'];
  /** Grouped tasks by status. */
  public statusColumns: Record<TaskStatus, Task[]> = {
    'To Do': [],
    'In Progress': [],
    'Completed': []
  };

  // #endregion

  // #region Filters

  /** Controls the visibility of the filter panel. */
  public isFilterOpen = false;
  /** List of all possible users for filtering. */
  public allUsers: string[] = [];
  /** Currently applied filters. */
  public appliedFilters: any = {
    status: [],
    priority: [],
    assignee: [],
    fromDate: null,
    toDate: null,
  };

  // #endregion

  // #region Subscriptions

  /** Stores subscription to task observable. */
  private taskSubscription!: Subscription;
  // #endregion

  // #region Drag & Drop

  /** Currently dragged task. */
  public activeDragTask: Task | null = null;
  // #endregion

  // #region Constructor

  /**
   * Creates an instance of the TaskBoardComponent.
   * @param router Router for navigation.
   * @param route Activated route to determine project mode.
   * @param taskService Handles CRUD + streams of tasks.
   * @param projectService Provides project info.
   * @param userStorage Provides user-related data from storage.
   */
  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly taskService: TaskService,
    private readonly projectService: ProjectService,
    private readonly userStorage: UserStorageService,
  ) { }

  // #endregion

  // #region Lifecycle Hooks

  /**
   * Initializes task board, loads tasks, determines project mode.
   * @returns void
   */
  public ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.projectId = id ? Number(id) : null;
      this.isProjectBoard = !!this.projectId;
    });

    this.taskSubscription = this.taskService.tasks$.subscribe(tasks => {
      this.tasks = tasks;

      this.allUsers = this.userStorage.getAllUsers().map(u => u.name);

      if (this.isProjectBoard && this.projectId) {
        const user =
          JSON.parse(localStorage.getItem('currentUser') || 'null') ||
          JSON.parse(sessionStorage.getItem('currentUser') || 'null');

        const email = user?.email || '';
        const allProjects = this.projectService.getAll(email);

        this.projectDetails = allProjects.find(p => Number(p.id) === this.projectId);
      }

      this.applyFiltering();
    });
  }

  /**
   * Cleans up subscriptions on component destroy.
   * @returns void
   */
  public ngOnDestroy(): void {
    this.taskSubscription?.unsubscribe();
  }


  // #endregion

  // #region Filtering, Sorting & Grouping

  /**
   * Applies all filters then sorts & groups tasks.
   * @returns void
   */
  private applyFiltering(): void {
    let list = this.isProjectBoard
      ? this.tasks.filter(t => t.projectId === this.projectId)
      : [...this.tasks];

    if (this.appliedFilters.status.length > 0) list = list.filter(t => this.appliedFilters.status.includes(t.status));
    if (this.appliedFilters.priority.length > 0) list = list.filter(t => this.appliedFilters.priority.includes(t.priority));
    if (this.appliedFilters.assignee.length > 0) list = list.filter(t => this.appliedFilters.assignee.includes(t.assignee));

    if (this.appliedFilters.fromDate) {
      list = list.filter(t => new Date(t.dueDate) >= new Date(this.appliedFilters.fromDate));
    }

    if (this.appliedFilters.toDate) {
      list = list.filter(t => new Date(t.dueDate) <= new Date(this.appliedFilters.toDate));
    }

    this.filteredTasks = list;
    this.projectTasksCount = list.length;

    this.sortTasks();
    this.groupTasks();
  }
  /**
     * Groups filtered tasks by status.
     * @returns void
     */
  private groupTasks(): void {
    this.statusColumns = { 'To Do': [], 'In Progress': [], 'Completed': [] };
    this.filteredTasks.forEach(task => this.statusColumns[task.status].push(task));
  }
  /**
   * Sorts filtered tasks based on selected field & direction.
   * @returns void
   */
  private sortTasks(): void {
    this.filteredTasks.sort((a, b) => {
      let A: any = a[this.sortField] ?? '';
      let B: any = b[this.sortField] ?? '';

      if (this.sortField === 'dueDate') {
        return this.sortAsc
          ? new Date(A).getTime() - new Date(B).getTime()
          : new Date(B).getTime() - new Date(A).getTime();
      }

      return this.sortAsc
        ? String(A).localeCompare(String(B))
        : String(B).localeCompare(String(A));
    });
  }


  // #endregion

  // #region Sorting Controls

  /** Sets sorting field and re-applies sort & grouping. */

  setSortField(field: keyof Task): void {
    this.sortField = field;
    this.sortTasks();
    this.groupTasks();
    this.isSortMenuOpen = false;
  }
  /** Sets sorting direction and updates task list. */
  setSortDirection(asc: boolean): void {
    this.sortAsc = asc;
    this.sortTasks();
    this.groupTasks();
    this.isSortMenuOpen = false;
  }
  /** Human-readable sort label. */
  get sortLabel(): string {
    switch (this.sortField) {
      case 'dueDate': return 'Due Date';
      case 'priority': return 'Priority';
      case 'status': return 'Status';
      case 'title': return 'Title';
      default: return 'Sort';
    }
  }
  // #endregion

  // #region Drag & Drop
  onDragStart(event: DragEvent, task: Task) {
    this.activeDragTask = task;
    event.dataTransfer?.setData("text/plain", String(task.id));
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent, newStatus: TaskStatus) {
    event.preventDefault();

    if (!this.activeDragTask) return;

    this.activeDragTask.status = newStatus;
    this.taskService.updateTaskStatus(this.activeDragTask.id, newStatus);

    this.applyFiltering();
    this.activeDragTask = null;
  }

  onDragEnd() {
    this.activeDragTask = null;
  }
  // #endregion

  // #region Navigation

  /** Navigates back to list view or project page. */
  navigateToList(): void {
  if (this.isProjectBoard) {
    this.router.navigate([`/projects/${this.projectId}/tasks`]);
  } else {
    this.router.navigate(['/tasks']);
  }
}
  /** Opens task creation page. */
  createTask(): void {
    this.router.navigate(['/tasks/create'], {
      queryParams: { projectId: this.projectId ?? null }
    });
  }
  // #endregion

  // #region Helper Methods

  /** Returns two-letter initials from name. */
  initials(name: string): string {
    const parts = name.split(' ');
    return (parts[0][0] || '') + (parts[1]?.[0] || '');
  }
  /** Returns CSS class for priority styling. */
  priorityClass(priority: string): string {
    return priority.toLowerCase();
  }

  /** Formats date to locale string. */
  formatDate(date: any): string {
    return new Date(date).toLocaleDateString();
  }
  /** Closes sort menu when clicking outside. */
  @HostListener('document:click', ['$event'])
  public closeSortMenu(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.tl-sort-box') && !target.closest('.tl-sort-menu')) {
      this.isSortMenuOpen = false;
    }
  }
  /** Applies filters received from filter panel. */
  public applyFilters(f: any) {
    this.appliedFilters = f;
    this.applyFiltering();
  }
  /** Opens task details page. */
  public openTask(taskId: number): void {
    this.router.navigate(['/tasks', taskId]);
  }
  // #endregion
}