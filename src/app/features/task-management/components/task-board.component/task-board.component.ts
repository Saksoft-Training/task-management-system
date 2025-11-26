//#region Imports
import { Component, OnInit, OnDestroy, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Task, TaskStatus } from '../../../../../types';
import { TaskService } from '../../services/task-service';
import { ProjectService } from '../../../project-management/services/project.service';
import { FilterPanelComponent } from "../filter-panel.component/filter-panel.component";
import { UserStorageService } from '../../../../shared/services/storage-service';
import { Subject, takeUntil } from 'rxjs';
//#endregion

@Component({
  selector: 'app-task-board',
  standalone: true,
  imports: [CommonModule, RouterLink, FilterPanelComponent],
  templateUrl: './task-board.component.html',
  styleUrls: ['./task-board.component.scss']
})
export class TaskBoardComponent implements OnInit, OnDestroy {

  //#region Destroy
  /** Emits destroy signal to automatically unsubscribe from all streams */
  private destroy$ = new Subject<void>();
  //#endregion

  //#region Task Data

  /** All tasks fetched from the service. */
  public tasks: Task[] = [];

  /** Filtered tasks after filters & sorting. */
  public filteredTasks: Task[] = [];

  //#endregion

  //#region Project Info

  /** If board is for a specific project, this holds the projectId. */
  public projectId: number | null = null;

  /** Indicates if this view belongs to a specific project board. */
  public isProjectBoard = false;

  /** Holds project details when in project mode. */
  public projectDetails: any = null;

  /** Count of tasks belonging to this board (after filtering). */
  public projectTasksCount = 0;

  //#endregion

  //#region Sorting

  /** Current sorting field. */
  public sortField: keyof Task = 'dueDate';

  /** Sorting direction. */
  public sortAsc = true;

  /** Toggles the sort dropdown menu. */
  public isSortMenuOpen = false;

  //#endregion

  //#region Status Columns

  /** Available status categories for grouping. */
  public readonly statuses: TaskStatus[] = ['To Do', 'In Progress', 'Completed'];

  /** Grouped tasks by status. */
  public statusColumns: Record<TaskStatus, Task[]> = {
    'To Do': [],
    'In Progress': [],
    'Completed': []
  };

  //#endregion

  //#region Filters

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

  //#endregion

  //#region Drag & Drop

  /** Currently dragged task. */
  public activeDragTask: Task | null = null;

  //#endregion

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly taskService: TaskService,
    private readonly projectService: ProjectService,
    private readonly userStorage: UserStorageService,
    private readonly cdr: ChangeDetectorRef
  ) { }

  //#region Lifecycle

  /**
   * Initializes task board, loads tasks, determines project mode.
   * @returns void
   */
  public ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const id = params.get('id');
        this.projectId = id ? Number(id) : null;
        this.isProjectBoard = !!this.projectId;
        this.cdr.detectChanges();
      });

    /** Subscribe to task observable (auto updates UI) */
    this.taskService.tasks$
      .pipe(takeUntil(this.destroy$))
      .subscribe(tasks => {
        this.tasks = tasks;

        /** Fetch all users for assignee filtering */
        this.allUsers = this.userStorage.getAllUsers().map(u => u.name);

        /** If project board, load the project details */
        if (this.isProjectBoard && this.projectId) {
          const user =
            JSON.parse(localStorage.getItem('currentUser') || 'null') ||
            JSON.parse(sessionStorage.getItem('currentUser') || 'null');

          const email = user?.email || '';
          const allProjects = this.projectService.getAll(email);

          this.projectDetails = allProjects.find(p => Number(p.id) === this.projectId);
        }

        /** Apply filters after receiving latest tasks */
        this.applyFiltering();
        this.cdr.detectChanges();
      });
  }

  /**
   * Cleans up subscriptions on component destroy.
   * @returns void
   */
  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  //#endregion

  //#region Filtering / Sorting / Grouping

  /**
   * Applies all filters then sorts & groups tasks.
   * @returns void
   */
  private applyFiltering(): void {
    let list = this.isProjectBoard
      ? this.tasks.filter(t => t.projectId === this.projectId)
      : [...this.tasks];

    /** Status filter */
    if (this.appliedFilters.status.length > 0)
      list = list.filter(t => this.appliedFilters.status.includes(t.status));

    /** Priority filter */
    if (this.appliedFilters.priority.length > 0)
      list = list.filter(t => this.appliedFilters.priority.includes(t.priority));

    /** Assignee filter */
    if (this.appliedFilters.assignee.length > 0)
      list = list.filter(t => this.appliedFilters.assignee.includes(t.assignee));

    /** Date range filters */
    if (this.appliedFilters.fromDate)
      list = list.filter(t => new Date(t.dueDate) >= new Date(this.appliedFilters.fromDate));

    if (this.appliedFilters.toDate)
      list = list.filter(t => new Date(t.dueDate) <= new Date(this.appliedFilters.toDate));

    this.filteredTasks = list;
    this.projectTasksCount = list.length;

    this.sortTasks();
    this.groupTasks();
    this.cdr.detectChanges();
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

    this.cdr.detectChanges();
  }

  /**
   * Groups filtered tasks by status.
   * @returns void
   */
  private groupTasks(): void {
    this.statusColumns = { 'To Do': [], 'In Progress': [], 'Completed': [] };
    this.filteredTasks.forEach(task => this.statusColumns[task.status].push(task));
    this.cdr.detectChanges();
  }

  //#endregion

  //#region Sorting Controls

  /** Sets sorting field and re-applies sort & grouping. */
  public setSortField(field: keyof Task): void {
    this.sortField = field;
    this.sortTasks();
    this.groupTasks();
    this.isSortMenuOpen = false;
    this.cdr.detectChanges();
  }

  /** Sets sorting direction and updates task list. */
  public setSortDirection(asc: boolean): void {
    this.sortAsc = asc;
    this.sortTasks();
    this.groupTasks();
    this.isSortMenuOpen = false;
    this.cdr.detectChanges();
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

  //#endregion

  //#region Drag Drop

  /** Starts drag operation for a task. */
  public onDragStart(event: DragEvent, task: Task) {
    this.activeDragTask = task;
    event.dataTransfer?.setData("text/plain", String(task.id));
    this.cdr.detectChanges();
  }

  /** Allows drag over dropzones. */
  public onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  /** Handles dropping a task into a new status column. */
  public onDrop(event: DragEvent, newStatus: TaskStatus) {
    event.preventDefault();

    if (!this.activeDragTask) return;

    this.activeDragTask.status = newStatus;
    this.taskService.updateTaskStatus(this.activeDragTask.id, newStatus);

    this.applyFiltering();
    this.activeDragTask = null;
    this.cdr.detectChanges();
  }

  /** Clears drag state on drag end. */
  public onDragEnd() {
    this.activeDragTask = null;
    this.cdr.detectChanges();
  }

  //#endregion

  //#region Click Outside (Close Sort Menu)

  /** Closes sort dropdown when clicking outside. */
  @HostListener('document:click', ['$event'])
  public closeSortMenu(event: Event): void {
    const target = event.target as HTMLElement;

    if (!target.closest('.tl-sort-box') && !target.closest('.tl-sort-menu')) {
      this.isSortMenuOpen = false;
      this.cdr.detectChanges();
    }
  }

  //#endregion

  //#region Navigation

  /** Navigates back to list view or project page. */
  public navigateToList(): void {
    if (this.isProjectBoard) {
      this.router.navigate([`/projects/${this.projectId}/tasks`]);
    } else {
      this.router.navigate(['/tasks']);
    }
  }

  /** Opens task creation page. */
  public createTask(): void {
    this.router.navigate(['/tasks/create'], {
      queryParams: { projectId: this.projectId ?? null }
    });
  }

  /** Opens task details page. */
  public openTask(taskId: number): void {
    this.router.navigate(['/tasks', taskId]);
  }

  //#endregion
  

  //#region Helpers

  /** Returns two-letter initials from a user name. */
  public initials(name: string): string {
    const parts = name.split(' ');
    return (parts[0][0] || '') + (parts[1]?.[0] || '');
  }

  /** Returns CSS class for priority styling. */
  public priorityClass(priority: string): string {
    return priority.toLowerCase();
  }

  /** Formats date to locale string. */
  public formatDate(date: any): string {
    return new Date(date).toLocaleDateString();
  }

  /** Applies filters received from filter panel. */
  public applyFilters(f: any): void {
    this.appliedFilters = f;
    this.applyFiltering();
  }

  //#endregion
}