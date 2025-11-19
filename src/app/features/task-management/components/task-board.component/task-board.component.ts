//#region Imports
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { Task, TaskStatus } from '../../../../../types';
import { TaskService } from '../../services/task-service';
import { ProjectService } from '../../../project-management/services/project.service';

import {
  DragDropModule,
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem
} from '@angular/cdk/drag-drop';
//#endregion

@Component({
  selector: 'app-task-board',
  standalone: true,
  imports: [CommonModule, DragDropModule, RouterLink],
  templateUrl: './task-board.component.html',
  styleUrls: ['./task-board.component.scss']
})
export class TaskBoardComponent implements OnInit, OnDestroy {

  /* --------------------------------------
   * TASK DATA (RAW & FILTERED)
   * -------------------------------------- */

  /** All tasks loaded from TaskService */
  public tasks: Task[] = [];

  /** Tasks filtered by project (if project board) */
  public filtered: Task[] = [];

  /* --------------------------------------
   * PROJECT + BOARD MODE METADATA
   * -------------------------------------- */

  /** ID of project when on /projects/:id/board */
  public projectId: number | null = null;

  /** True when viewing a specific project's board */
  public isProjectBoard = false;

  /** Project details loaded when in project board mode */
  public projectDetails: any = null;

  /** Total tasks in this project (filtered count) */
  public projectTasksCount = 0;

  /* --------------------------------------
   * SORTING
   * -------------------------------------- */

  /** Which field tasks should be sorted by */
  public sortField: keyof Task = 'dueDate';

  /** Sorting direction: true = ascending */
  public sortAsc = true;

  /** Controls visibility of sort dropdown menu */
  public toggleSortMenu = false;

  /* --------------------------------------
   * STATUSES + COLUMN STRUCTURE
   * -------------------------------------- */

  /** All possible task statuses represented on the board */
  public readonly statuses: TaskStatus[] = [
    'To Do',
    'In Progress',
    'Completed'
  ];

  /** Kanban columns keyed by task status */
  public columns: Record<TaskStatus, Task[]> = {
    'To Do': [],
    'In Progress': [],
    'Completed': []
  };

  /** Drag-drop connected container names */
  public connectedLists = ['todo', 'inprogress', 'completed'];

  /* --------------------------------------
   * SUBSCRIPTIONS
   * -------------------------------------- */

  /** Subscription to task updates */
  private sub!: Subscription;

  //#region Constructor

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly taskService: TaskService,
    private readonly projectService: ProjectService
  ) {}

  //#endregion

  //#region Lifecycle Methods

  /** Initialize board: detect project, subscribe to tasks, load project details */
  public ngOnInit(): void {
    // Detect project ID from route
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.projectId = id ? Number(id) : null;
      this.isProjectBoard = !!this.projectId;
    });

    // Subscribe to live task updates
    this.sub = this.taskService.tasks$
      .subscribe(tasks => {
        this.tasks = tasks;

        // Load project details only if board belongs to a project
        if (this.isProjectBoard && this.projectId !== null) {

          // Retrieve logged-in user email safely
          const user =
            JSON.parse(localStorage.getItem('currentUser') || 'null') ||
            JSON.parse(sessionStorage.getItem('currentUser') || 'null');

          const email = user?.email || '';

          // Load only this user's projects
          const allProjects = this.projectService.getAll(email);

          // Match project with board ID
          this.projectDetails =
            allProjects.find(p => Number(p.id) === this.projectId);

          console.log('FOUND PROJECT DETAILS:', this.projectDetails);
        }

        // Apply filters + sorting + grouping
        this.applyFiltering();
      });
  }

  /** Clean up observable subscription */
  public ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  //#endregion

  /* --------------------------------------
   * FILTERING & SORTING
   * -------------------------------------- */

  /** Filters tasks by project and then sorts and groups them */
  private applyFiltering(): void {
    this.filtered = this.isProjectBoard
      ? this.tasks.filter(t => t.projectId === this.projectId)
      : [...this.tasks];

    this.projectTasksCount = this.filtered.length;

    this.applySorting();
    this.groupTasks();
  }

  /** Groups filtered tasks into their status columns */
  private groupTasks(): void {
    // Reset all columns
    this.columns = {
      'To Do': [],
      'In Progress': [],
      'Completed': []
    };

    // Distribute tasks by status
    this.filtered.forEach(task => {
      this.columns[task.status].push(task);
    });
  }

  /**
   * Sort tasks by:
   *  - dueDate (date sorting)
   *  - strings (localeCompare)
   */
  private applySorting(): void {
    this.filtered.sort((a, b) => {
      let A: any = a[this.sortField] ?? '';
      let B: any = b[this.sortField] ?? '';

      // Date sorting
      if (this.sortField === 'dueDate') {
        return this.sortAsc
          ? new Date(A).getTime() - new Date(B).getTime()
          : new Date(B).getTime() - new Date(A).getTime();
      }

      // String sorting
      return this.sortAsc
        ? String(A).localeCompare(String(B))
        : String(B).localeCompare(String(A));
    });
  }

  /** Set new sorting field */
  public setSortField(field: keyof Task): void {
    this.sortField = field;
    this.applySorting();
    this.groupTasks();
    this.toggleSortMenu = false;
  }

  /** Set sorting direction (ascending or descending) */
  public setSortDirection(asc: boolean): void {
    this.sortAsc = asc;
    this.applySorting();
    this.groupTasks();
    this.toggleSortMenu = false;
  }

  /** Returns the user-friendly label for current sorting field */
  public get sortLabel(): string {
    switch (this.sortField) {
      case 'dueDate': return 'Due Date';
      case 'priority': return 'Priority';
      case 'status': return 'Status';
      case 'title': return 'Title';
      default: return 'Sort';
    }
  }

  /* --------------------------------------
   * DRAG & DROP OPERATIONS
   * -------------------------------------- */

  /**
   * Handles task movement across columns.
   * Automatically updates task status and re-groups.
   */
  public drop(
    event: CdkDragDrop<Task[]>,
    newStatus: TaskStatus
  ): void {

    const previousList = event.previousContainer.data;
    const currentList = event.container.data;

    // Reorder inside same column
    if (event.previousContainer === event.container) {
      moveItemInArray(
        currentList,
        event.previousIndex,
        event.currentIndex
      );
      return;
    }

    // Move between columns
    transferArrayItem(
      previousList,
      currentList,
      event.previousIndex,
      event.currentIndex
    );

    // Update actual task status
    const movedTask = currentList[event.currentIndex];
    movedTask.status = newStatus;

    this.taskService.updateTaskStatus(movedTask.id, newStatus);

    // Refilter & regroup
    setTimeout(() => this.applyFiltering(), 0);
  }

  /* --------------------------------------
   * NAVIGATION HELPERS
   * -------------------------------------- */

  /** Navigate back to project list or global list */
  public goList(): void {
    if (this.isProjectBoard) {
      this.router.navigate([`/projects/${this.projectId}`]);
    } else {
      this.router.navigate(['/tasks']);
    }
  }

  /** Navigate to task creation screen */
  public createTask(): void {
    this.router.navigate(['/tasks/create'], {
      queryParams: { projectId: this.projectId ?? null }
    });
  }

  /* --------------------------------------
   * UI HELPERS
   * -------------------------------------- */

  /** Convert user name to initials (e.g., "John Doe" → "JD") */
  public initials(name: string): string {
    const parts = name.split(' ');
    return (parts[0][0] || '') + (parts[1]?.[0] || '');
  }

  /** Lowercase priority for using CSS classes */
  public priorityClass(priority: string): string {
    return priority.toLowerCase();
  }

  /** Format date into readable string */
  public formatDate(date: any): string {
    return new Date(date).toLocaleDateString();
  }

  /* --------------------------------------
   * CLOSE SORT MENU ON OUTSIDE CLICK
   * -------------------------------------- */

  /** Automatically close sort dropdown when clicking outside */
  @HostListener('document:click', ['$event'])
  public closeSortMenu(event: Event): void {
    const target = event.target as HTMLElement;

    if (!target.closest('.sort-box') &&
        !target.closest('.sort-menu')) {
      this.toggleSortMenu = false;
    }
  }
}
