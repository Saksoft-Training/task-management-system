import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Task, TaskStatus } from '../../../../types/models/task';
import { AuthService } from '../../user-account-management/services/auth-service';

@Injectable({ providedIn: 'root' })
export class TaskService {

  //#region Properties
  /**
   * @summary Key used to store tasks inside LocalStorage.
   */
  private readonly storageKey: string = 'tasks';

  /**
   * @summary Internal reactive task list filtered by logged-in user.
   */
  private readonly tasksSubject: BehaviorSubject<Task[]> =
    new BehaviorSubject<Task[]>([]);

  /**
   * @summary Observable stream used by components to subscribe to real-time task updates.
   */
  public readonly tasks$: Observable<Task[]> = this.tasksSubject.asObservable();
  //#endregion

  //#region Constructor
  /**
   * @summary Injects authentication service and loads tasks for the current user.
   * @param authService Responsible for accessing current user details.
   */
  constructor(private readonly authService: AuthService) {
    // Load tasks initially
    this.tasksSubject.next(this.readForCurrentUser());

    // React to user changes
    this.authService.currentUser$.subscribe(() => {
      this.tasksSubject.next(this.readForCurrentUser());
    });
  }
  //#endregion

  //#region Local Storage Read/Write
  /**
   * @summary Reads ALL tasks for ALL users from storage.
   * @returns Task[] Array of tasks found in LocalStorage.
   */
  private read(): Task[] {
    const raw: string | null = localStorage.getItem(this.storageKey);
    return raw ? JSON.parse(raw) : [];
  }

  /**
   * @summary Writes updated tasks to storage and refreshes UI for logged-in user.
   * @param tasks All tasks (global list) to store.
   * @returns void
   */
  private write(tasks: Task[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(tasks));
    this.tasksSubject.next(this.readForCurrentUser());
  }

  /**
   * @summary Filters tasks so only the logged-in user's tasks appear.
   * @returns Task[] User-specific task list.
   */
  private readForCurrentUser(): Task[] {
    const allTasks = this.read();
    const user = this.authService.getCurrentUser();

    if (!user) return [];

    return allTasks.filter(
      t => t.assigneeEmail === user.email || t.createdBy === user.email
    );
  }
  //#endregion

  //#region Fetchers
  /**
   * @summary Gets tasks for the logged-in user.
   * @returns Task[]
   */
  public getAllTasks(): Task[] {
    return this.readForCurrentUser();
  }

  /**
   * @summary Finds a task by its ID.
   * @param id Task ID.
   * @returns Task | undefined
   */
  public getTaskById(id: number): Task | undefined {
    return this.readForCurrentUser().find(t => t.id === id);
  }

  /**
   * @summary Returns tasks that belong to a specific project.
   * @param projectId ID of the project.
   * @returns Task[]
   */
  public getTasksByProjectId(projectId: number): Task[] {
    return this.readForCurrentUser().filter(t => t.projectId === projectId);
  }
  //#endregion

  //#region CRUD Operations
  /**
   * @summary Saves a new task.
   * @param task Task object.
   * @returns void
   */
  public saveTask(task: Task): void {
    const allTasks = this.read();
    allTasks.push(task);
    this.write(allTasks);
  }

  /**
   * @summary Updates an existing task.
   * @param updated Updated task details.
   * @returns void
   */
  public updateTask(updated: Task): void {
    const allTasks = this.read().map(t =>
      t.id === updated.id ? updated : t
    );
    this.write(allTasks);
  }

  /**
   * @summary Deletes a task by ID.
   * @param id Task ID.
   * @returns void
   */
  public deleteTask(id: number): void {
    const allTasks = this.read().filter(t => t.id !== id);
    this.write(allTasks);
  }

  /**
   * @summary Removes all tasks from storage.
   * @returns void
   */
  public clearAllTasks(): void {
    localStorage.removeItem(this.storageKey);
    this.tasksSubject.next([]);
  }
  //#endregion

  //#region Drag & Drop Status Update
  /**
   * @summary Updates only the status of a task (for Kanban drag & drop).
   * @param id Task ID.
   * @param status New status to apply.
   * @returns void
   */
  public updateTaskStatus(id: number, status: TaskStatus): void {
    const allTasks = this.read();
    const index = allTasks.findIndex(t => t.id === id);

    if (index === -1) return;

    const now = new Date().toISOString();

    allTasks[index].status = status;
    allTasks[index].updatedAt = now;
    allTasks[index].completedAt = status === 'Completed' ? now : null;

    this.write(allTasks);
  }
  //#endregion

  //#region Bulk Delete
  /**
   * @summary Deletes all tasks associated with a specific project.
   * @param projectId Project identifier.
   * @returns void
   */
  public deleteTasksByProjectId(projectId: number): void {
    const allTasks = this.read().filter(t => t.projectId !== projectId);
    this.write(allTasks);
  }
  //#endregion
}