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

  /* TASK DATA */
  public tasks: Task[] = [];
  public filtered: Task[] = [];

  /* PROJECT INFO */
  public projectId: number | null = null;
  public isProjectBoard = false;
  public projectDetails: any = null;
  public projectTasksCount = 0;

  /* SORTING */
  public sortField: keyof Task = 'dueDate';
  public sortAsc = true;
  public toggleSortMenu = false;

  /* STATUSES */
  public readonly statuses: TaskStatus[] = ['To Do', 'In Progress', 'Completed'];
  public columns: Record<TaskStatus, Task[]> = {
    'To Do': [],
    'In Progress': [],
    'Completed': []
  };

  /* FILTERS */
  public showFilter = false;
  public allUsers: string[] = [];
  public activeFilters: any = {
    status: [],
    priority: [],
    assignee: [],
    fromDate: null,
    toDate: null,
  };

  /* SUBSCRIPTIONS */
  private sub!: Subscription;

  /* DRAGGING */
  draggingTask: Task | null = null;

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly taskService: TaskService,
    private readonly projectService: ProjectService,
    private readonly userStorage: UserStorageService,
  ) {}

  /* ------------ INIT ------------ */
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.projectId = id ? Number(id) : null;
      this.isProjectBoard = !!this.projectId;
    });

    this.sub = this.taskService.tasks$.subscribe(tasks => {
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

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  /* ------------ FILTER + SORT + GROUP ------------ */

  private applyFiltering(): void {
    let list = this.isProjectBoard
      ? this.tasks.filter(t => t.projectId === this.projectId)
      : [...this.tasks];

    if (this.activeFilters.status.length > 0) list = list.filter(t => this.activeFilters.status.includes(t.status));
    if (this.activeFilters.priority.length > 0) list = list.filter(t => this.activeFilters.priority.includes(t.priority));
    if (this.activeFilters.assignee.length > 0) list = list.filter(t => this.activeFilters.assignee.includes(t.assignee));

    if (this.activeFilters.fromDate) {
      list = list.filter(t => new Date(t.dueDate) >= new Date(this.activeFilters.fromDate));
    }

    if (this.activeFilters.toDate) {
      list = list.filter(t => new Date(t.dueDate) <= new Date(this.activeFilters.toDate));
    }

    this.filtered = list;
    this.projectTasksCount = list.length;

    this.applySorting();
    this.groupTasks();
  }

  private groupTasks(): void {
    this.columns = { 'To Do': [], 'In Progress': [], 'Completed': [] };
    this.filtered.forEach(task => this.columns[task.status].push(task));
  }

  private applySorting(): void {
    this.filtered.sort((a, b) => {
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

  /* ------------ SORT CONTROLS ------------ */

  setSortField(field: keyof Task): void {
    this.sortField = field;
    this.applySorting();
    this.groupTasks();
    this.toggleSortMenu = false;
  }

  setSortDirection(asc: boolean): void {
    this.sortAsc = asc;
    this.applySorting();
    this.groupTasks();
    this.toggleSortMenu = false;
  }

  get sortLabel(): string {
    switch (this.sortField) {
      case 'dueDate': return 'Due Date';
      case 'priority': return 'Priority';
      case 'status': return 'Status';
      case 'title': return 'Title';
      default: return 'Sort';
    }
  }

  /* ------------ DRAG & DROP (NO CDK) ------------ */

  onDragStart(event: DragEvent, task: Task) {
    this.draggingTask = task;
    event.dataTransfer?.setData("text/plain", String(task.id));
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent, newStatus: TaskStatus) {
    event.preventDefault();

    if (!this.draggingTask) return;

    this.draggingTask.status = newStatus;
    this.taskService.updateTaskStatus(this.draggingTask.id, newStatus);

    this.applyFiltering();
    this.draggingTask = null;
  }

  onDragEnd() {
    this.draggingTask = null;
  }

  /* ------------ NAVIGATION ------------ */

  goList(): void {
    if (this.isProjectBoard) this.router.navigate([`/projects/${this.projectId}`]);
    else this.router.navigate(['/tasks']);
  }

  createTask(): void {
    this.router.navigate(['/tasks/create'], {
      queryParams: { projectId: this.projectId ?? null }
    });
  }

  /* ------------ HELPERS ------------ */

  initials(name: string): string {
    const parts = name.split(' ');
    return (parts[0][0] || '') + (parts[1]?.[0] || '');
  }

  priorityClass(priority: string): string {
    return priority.toLowerCase();
  }

  formatDate(date: any): string {
    return new Date(date).toLocaleDateString();
  }

  @HostListener('document:click', ['$event'])
  closeSortMenu(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.sort-box') && !target.closest('.sort-menu')) {
      this.toggleSortMenu = false;
    }
  }

  applyFilters(f: any) {
    this.activeFilters = f;
    this.applyFiltering();
  }
}
