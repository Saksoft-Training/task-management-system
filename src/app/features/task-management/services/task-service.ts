import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { Task, TaskStatus } from '../../../../types/models/task';
import { AuthService } from '../../user-account-management/services/auth-service';

@Injectable({ providedIn: 'root' })
export class TaskService implements OnDestroy {

  //#region Properties

  /** LocalStorage key where all tasks (global list) are stored */
  private readonly storageKey: string = 'tasks';

  /** Emits task list visible to the current logged-in user */
  private readonly tasksSubject = new BehaviorSubject<Task[]>([]);

  /** Observable for components to subscribe to */
  public readonly tasks$: Observable<Task[]> = this.tasksSubject.asObservable();

  /** Holds subscription to currentUser$ so we can unsubscribe later */
  private userSubscription!: Subscription;

  //#endregion


  //#region Constructor

  constructor(private readonly authService: AuthService) {

    /** Load tasks immediately */
    this.tasksSubject.next(this.readForCurrentUser());

    /** Refresh tasks whenever logged-in user changes */
    this.userSubscription = this.authService.currentUser$.subscribe(() => {
      this.tasksSubject.next(this.readForCurrentUser());
    });
  }

  //#endregion


  //#region Cleanup

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
  }

  //#endregion


  //#region Local Storage Helpers

  /** Reads ALL tasks (global, unfiltered) */
  private read(): Task[] {
    const raw = localStorage.getItem(this.storageKey);
    return raw ? JSON.parse(raw) : [];
  }

  /** Writes all tasks and automatically refreshes filtered list */
  private write(tasks: Task[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(tasks));
    this.tasksSubject.next(this.readForCurrentUser());
  }

  /** Returns tasks only for the logged-in user */
  private readForCurrentUser(): Task[] {
    const allTasks = this.read();
    const user = this.authService.getCurrentUser();

    if (!user) return [];

    return allTasks.filter(
      t => t.assigneeEmail === user.email || t.createdBy === user.email
    );
  }

  //#endregion


  //#region Public Fetch Methods

  /** All tasks for current user */
  public getAllTasks(): Task[] {
    return this.readForCurrentUser();
  }

  /** Get task by ID */
  public getTaskById(id: number): Task | undefined {
    return this.readForCurrentUser().find(t => t.id === id);
  }

  /** Get tasks belonging to a project */
  public getTasksByProjectId(projectId: number): Task[] {
    return this.readForCurrentUser().filter(t => t.projectId === projectId);
  }

  //#endregion


  //#region CRUD Methods

  /** Create new task */
  public saveTask(task: Task): void {
    const all = this.read();
    all.push(task);
    this.write(all);
  }

  /** Update existing task */
  public updateTask(updated: Task): void {
    const all = this.read().map(t => (t.id === updated.id ? updated : t));
    this.write(all);
  }

  /** Delete task by ID */
  public deleteTask(id: number): void {
    const all = this.read().filter(t => t.id !== id);
    this.write(all);
  }

  /** Completely clear all tasks */
  public clearAllTasks(): void {
    localStorage.removeItem(this.storageKey);
    this.tasksSubject.next([]);
  }

  //#endregion


  //#region Drag & Drop Status Update

  public updateTaskStatus(id: number, status: TaskStatus): void {
    const all = this.read();
    const idx = all.findIndex(t => t.id === id);
    if (idx === -1) return;

    const now = new Date().toISOString();

    all[idx].status = status;
    all[idx].updatedAt = now;
    all[idx].completedAt = status === 'Completed' ? now : null;

    this.write(all);
  }

  //#endregion


  //#region Bulk Operations

  /** Delete all tasks of a specific project */
  public deleteTasksByProjectId(projectId: number): void {
    const remaining = this.read().filter(t => t.projectId !== projectId);
    this.write(remaining);
  }

  //#endregion
}
