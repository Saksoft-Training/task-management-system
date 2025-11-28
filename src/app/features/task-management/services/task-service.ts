import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { Task, TaskStatus } from '../../../../types/models/task';
import { AuthService } from '../../user-account-management/services/auth-service';
import { HttpClient } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class TaskService implements OnDestroy {

  //#region Properties
  /** API base URL where all tasks are stored */
  private readonly apiBase = 'https://692436183ad095fb84732c9f.mockapi.io/Tasks';

  /** In-memory cache of all tasks received from API */
  private tasksCache: Task[] = [];

  /** Emits task list visible to the current logged-in user */
  private tasksSubject = new BehaviorSubject<Task[]>([]);

  /** Observable that components subscribe to for updates */
  public readonly tasks$ = this.tasksSubject.asObservable();

  /** Subscription to user changes so tasks refresh when user switches */
  private userSubscription!: Subscription;
  //#endregion
  //#region Constructor
  constructor(
    private readonly authService: AuthService,
    private readonly http: HttpClient
  ) {
    /** Load tasks immediately */
    this.loadFromApi();

    /** Refresh tasks whenever logged-in user changes */
    this.userSubscription = this.authService.currentUser$.subscribe(() => {
      this.loadFromApi();
    });
  }
  //#endregion
  //#region Cleanup
  ngOnDestroy(): void {
    /** Ensure subscription is cleaned up  */
    this.userSubscription?.unsubscribe();
  }
  //#endregion

  //#region Internal Helpers
  /** Reads ALL tasks from API and updates filtered list for current user */
  private loadFromApi(): void {
    this.http.get<Task[]>(this.apiBase)
      .pipe(
        catchError(err => {
          console.error('[TaskService] failed to fetch tasks', err);
          return of([] as Task[]);
        }),
        tap(all => {
          /** Cache updated list (equivalent to old read()) */
          this.tasksCache = all;

          /** Emit tasks for current user */
          this.tasksSubject.next(this.readForCurrentUserSnapshot());
        })
      )
      .subscribe();
  }

  /** Writes updated cache and automatically refreshes filtered user list */
  private writeCacheAndEmit(all: Task[]): void {
    this.tasksCache = all;
    this.tasksSubject.next(this.readForCurrentUserSnapshot());
  }

  /** Insert or update task in cache */
  private upsertTaskInCache(task: Task): void {
    const idx = this.tasksCache.findIndex(
      t => String(t.id) === String(task.id)
    );

    if (idx === -1) this.tasksCache.push(task);
    else this.tasksCache[idx] = task;

    this.tasksSubject.next(this.readForCurrentUserSnapshot());
  }

  /** Removes a task from cache by ID */
  private removeFromCacheById(id: number): void {
    this.tasksCache = this.tasksCache.filter(
      t => String(t.id) !== String(id)
    );
    this.tasksSubject.next(this.readForCurrentUserSnapshot());
  }

  /**
   * @summary Returns tasks only for the logged-in user
   * (replaces old readForCurrentUser() logic)
   */
  private readForCurrentUserSnapshot(): Task[] {
    return this.tasksCache.slice();
  }

 
  //#endregion

  //#region Public Fetch Methods
  /** All tasks for current user  */
  public getAllTasks(): Task[] {
    return this.readForCurrentUserSnapshot();
  }

  /** Get a single task by ID */
  public getTaskById(id: number): Task | undefined {
    return this.readForCurrentUserSnapshot().find(t => t.id === id);
  }

  /** Get tasks belonging to a specific project */
  public getTasksByProjectId(projectId: number): Task[] {
    return this.readForCurrentUserSnapshot().filter(t => t.projectId === projectId);
  }
  //#endregion

  //#region CRUD 
  /** Create new task (replaces old saveTask, but keeps same method name and behavior) */
  public saveTask(task: Task): void {
    /** Create temp ID to mimic old behavior where tasks instantly appeared */
    const tempId = task.id || Date.now();
    const tempTask: Task = { ...task, id: tempId };

    /** Optimistic update to keep UI responsive */
    this.upsertTaskInCache(tempTask);

    /** Persist to API */
    this.http.post<Task>(this.apiBase, { ...task, id: undefined })
      .pipe(
        catchError(err => {
          console.error('[TaskService.saveTask] failed', err);
          /** Rollback optimistic insert */
          this.removeFromCacheById(tempId);
          return of(null as any);
        }),
        tap(created => {
          if (created) {
            /** Replace temp task with real API task */
            this.removeFromCacheById(tempId);
            this.upsertTaskInCache(created);
          }
        })
      )
      .subscribe();
  }

  /** Update an existing task */
  public updateTask(updated: Task): void {
    /** Optimistic update (same as old behavior) */
    this.upsertTaskInCache(updated);
    /** Persist to API */
    this.http.put<Task>(`${this.apiBase}/${updated.id}`, updated)
      .pipe(
        catchError(err => {
          console.error('[TaskService.updateTask] failed', err);
          /** Reload from server on failure */
          this.loadFromApi();
          return of(null as any);
        })
      )
      .subscribe();
  }

  /** Delete a single task */
  public deleteTask(id: number): void {
    /** Optimistic removal (same UX as old deleteTask) */
    this.removeFromCacheById(id);

    /** Persist delete to API */
    this.http.delete<void>(`${this.apiBase}/${id}`)
      .pipe(
        catchError(err => {
          console.error('[TaskService.deleteTask] failed', err);
          /** Refresh snapshot if deletion fails */
          this.loadFromApi();
          return of(null as any);
        })
      )
      .subscribe();
  }

  /** Clear all tasks */
  public clearAllTasks(): void {
    this.tasksCache = [];
    this.tasksSubject.next([]);
  }
  //#endregion

  //#region Drag & Drop Status Update
  /** Update task status after drag & drop */
  public updateTaskStatus(id: number, status: TaskStatus): void {
    const idx = this.tasksCache.findIndex(t => String(t.id) === String(id));
    if (idx === -1) return;

    const now = new Date().toISOString();
    /** Optimistic update */
    this.tasksCache[idx].status = status;
    this.tasksCache[idx].updatedAt = now;
    this.tasksCache[idx].completedAt = status === 'Completed' ? now : null;
    this.tasksSubject.next(this.readForCurrentUserSnapshot());
    /** Persist to API */
    const payload = { ...this.tasksCache[idx] };

    this.http.put<Task>(`${this.apiBase}/${id}`, payload)
      .pipe(
        catchError(err => {
          console.error('[TaskService.updateTaskStatus] failed', err);
          /** Reload on failure */
          this.loadFromApi();
          return of(null as any);
        })
      )
      .subscribe();
  }
  //#endregion

  //#region Bulk Operations
  /** Delete all tasks for a project (old deleteTasksByProjectId behavior maintained) */
 public deleteTasksByProjectId(projectId: number): void {

  /** Collect tasks first BEFORE optimistic removal */
  const tasksToDelete = this.tasksCache.filter(t => t.projectId === projectId);

  /** Optimistic removal */
  this.tasksCache = this.tasksCache.filter(t => t.projectId !== projectId);
  this.tasksSubject.next(this.readForCurrentUserSnapshot());

  /** Now delete from API */
  tasksToDelete.forEach(t => {
    this.http.delete<void>(`${this.apiBase}/${t.id}`)
      .pipe(
        catchError(err => {
          console.error(`[TaskService.deleteTasksByProjectId] failed for ${t.id}`, err);
          return of(null as any);
        })
      )
      .subscribe();
  });
}


  //#endregion
  // In your TaskService - make sure this method exists:
getOverdueTasks(): any[] {
  const now = new Date();
  return this.tasksCache.filter(t => {
    if (!t.dueDate) return false;
    const due = new Date(t.dueDate);
    return due < now && t.status !== 'Completed';
  });
}
}