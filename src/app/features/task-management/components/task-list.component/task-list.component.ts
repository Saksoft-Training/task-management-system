//#region Imports
import {
  Component, Input, OnDestroy, OnInit, HostListener,
  OnChanges, SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
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
  /** Project ID passed from parent (optional) */
  @Input() projectId?: number | null;
  //#endregion

  //#region View Mode
  /** list | board | project */
  public viewMode: 'project' | 'list' | 'board' | 'global' = 'project';
  //#endregion

  //#region Task Data
  public tasks: Task[] = [];
  public filteredTasks: Task[] = [];
  public allUsers: string[] = [];
  public activeTask: Task | null = null;
  public userEmail: string = localStorage.getItem('loggedUserEmail') || '';
  //#endregion

  //#region Subscriptions
  private taskSubscription!: Subscription;
  //#endregion

  //#region Sorting
  public isSortMenuOpen = false;
  public sortField: keyof Task = 'dueDate';
  public sortAsc = true;
  //#endregion

  //#region Constructor
  constructor(
    private readonly route: ActivatedRoute,
    private readonly taskService: TaskService,
    public readonly projectService: ProjectService,
    private readonly userStorage: UserStorageService,
    private readonly router: Router
  ) { }
  //#endregion

  //#region Lifecycle

  public ngOnInit(): void {
    const users = this.userStorage.getAllUsers();
    this.allUsers = users.map(u => u.name);

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.projectId = id ? Number(id) : null;
      this.loadTasks(this.taskService.getAllTasks());
    });

    this.detectViewMode();

    this.taskSubscription = this.taskService.tasks$
      .subscribe(tasks => this.loadTasks(tasks));
  }

  public ngOnDestroy(): void {
    this.taskSubscription?.unsubscribe();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['projectId']) {
      this.loadTasks(this.taskService.getAllTasks());
    }
  }
  //#endregion

  //#region View Mode Logic
 private detectViewMode(): void {
  const url = this.router.url.toLowerCase();

  // /projects/:id/board
  if (url.match(/^\/projects\/\d+\/board$/)) {
    this.viewMode = 'board';
    return;
  }

  // /projects/:id/tasks  → list view WITH project header
  if (url.match(/^\/projects\/\d+\/tasks$/)) {
    this.viewMode = 'list';
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.projectId = id;
    return;
  }

  // /projects/:id  → same list view
  if (url.match(/^\/projects\/\d+$/)) {
    this.viewMode = 'list';
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.projectId = id;
    return;
  }

  // /tasks/board
  if (url === '/tasks/board') {
    this.viewMode = 'board';
    this.projectId = null;
    return;
  }

  // /tasks
  if (url === '/tasks' || url.startsWith('/tasks?')) {
    this.viewMode = 'list';
    this.projectId = null;
    return;
  }
}

  //#endregion

  //#region Load + Filter + Sort

  private loadTasks(allTasks: Task[]): void {
    this.tasks = this.projectId
      ? allTasks.filter(t => t.projectId === this.projectId)
      : allTasks;

    this.sortTasks();
  }

  private sortTasks(): void {
    let list = [...this.tasks];

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

    this.filteredTasks = [...list].sort((a, b) => {
      const A: any = a[this.sortField] ?? '';
      const B: any = b[this.sortField] ?? '';

      if (this.sortField === 'dueDate' || this.sortField === 'createdAt') {
        const dA = new Date(A).getTime();
        const dB = new Date(B).getTime();
        return this.sortAsc ? dA - dB : dB - dA;
      }

      if (typeof A === 'string') {
        return this.sortAsc
          ? String(A).localeCompare(String(B))
          : String(B).localeCompare(String(A));
      }

      return 0;
    });
  }

  //#endregion

  //#region Sorting Controls

  public toggleSortMenu(): void {
    this.isSortMenuOpen = !this.isSortMenuOpen;
  }

  public setSortField(field: keyof Task): void {
    this.sortField = field;
    this.sortTasks();
    this.isSortMenuOpen = false;
  }

  public setSortDirection(isAscending: boolean): void {
    this.sortAsc = isAscending;
    this.sortTasks();
    this.isSortMenuOpen = false;
  }

  public getSortLabel(): string {
    switch (this.sortField) {
      case 'dueDate': return 'Due Date';
      case 'priority': return 'Priority';
      case 'status': return 'Status';
      case 'title': return 'Title';
      default: return 'Sort';
    }
  }

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

  public openCard(task: Task): void {
    this.activeTask = task;
  }

  public closeCard(): void {
    this.activeTask = null;
  }
  //#endregion

  //#region CRUD

  public isDeleteModalOpen = false;
  public pendingDeleteTask: Task | null = null;

  public deleteTask(task: Task): void {
    this.pendingDeleteTask = task;
    this.isDeleteModalOpen = true;
  }

  public onConfirmDelete(): void {
    if (this.pendingDeleteTask) {
      this.taskService.deleteTask(this.pendingDeleteTask.id);
    }
    this.isDeleteModalOpen = false;
    this.pendingDeleteTask = null;
  }

  public onCancelDelete(): void {
    this.isDeleteModalOpen = false;
    this.pendingDeleteTask = null;
  }
  //#endregion

  //#region Mode Switch

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

  public createTask(): void {
    this.router.navigate(['/tasks/create'], {
      queryParams: { projectId: this.projectId }
    });
  }
  //#endregion

  //#region Helpers

  public getProjectName(id: number): string {
  return this.projectService.getById(id, this.userEmail)?.name || 'Unknown';
}


  public getShowingText(): string {
    return `Showing ${this.filteredTasks.length} of ${this.tasks.length} tasks`;
  }

  public getTasks(status: string): Task[] {
    return this.filteredTasks.filter(t => t.status === status);
  }

  public isFilterOpen = false;

  public appliedFilters: any = {
    status: [],
    priority: [],
    assignee: [],
    fromDate: null,
    toDate: null,
  };

  public changeSort(field: keyof Task): void {
    if (this.sortField === field) {
      this.sortAsc = !this.sortAsc;
    } else {
      this.sortField = field;
      this.sortAsc = true;
    }
    this.sortTasks();
    this.isSortMenuOpen = false;
  }

  public editTask(task: Task): void {
    this.router.navigate(['/tasks/edit', task.id]);
  }

  public applyFilters(f: any): void {
    this.appliedFilters = f;
    this.sortTasks();
  }
  //#endregion
}
