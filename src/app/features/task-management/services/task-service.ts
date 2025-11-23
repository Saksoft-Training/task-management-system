import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Task, TaskStatus } from '../../../../types/models/task';
import { AuthService } from '../../user-account-management/services/auth-service';

@Injectable({
  providedIn: 'root',
})
export class TaskService {

  //#region Private Properties

  /**
   * @summary Default localStorage key (not used directly when per-user storage is active).
   */
  private storageKey = 'tasks';

  /**
   * @summary Generates a unique localStorage key per user so task data remains user-specific.
   * @param email Logged-in user's email.
   * @returns A unique key used for storing tasks in localStorage.
   */
  private getStorageKey(email: string): string {
    return `tasks_${email}`;
  }

  /**
   * @summary Reactive source emitting the list of tasks.
   */
  private tasksSubject = new BehaviorSubject<Task[]>([]);

  /**
   * @summary Observable stream of tasks for all components/subscribers.
   */
  public tasks$ = this.tasksSubject.asObservable();
  //#endregion
  //#region Constructor
  /**
   * @summary Loads tasks into the reactive stream for the currently logged-in user.
   * Runs once when the service is created.
   */
  constructor(private authService: AuthService) {
    const user = this.authService.getCurrentUser();
    const email = user?.email || '';
    this.tasksSubject.next(this.read(email));
  }
  //#endregion

  //#region Local Storage (Read / Write)

  /**
   * @summary Reads tasks from localStorage for the given user.
   * @param email The logged-in user's email.
   * @returns Array of tasks or an empty array if none exist.
   */
  private read(email: string): Task[] {
    const key = this.getStorageKey(email);
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  }

  /**
   * @summary Writes task data to localStorage for the current user
   *          and updates the reactive BehaviorSubject.
   * @param tasks Updated array of tasks.
   */
  private write(tasks: Task[]): void {
    const user = this.authService.getCurrentUser();
    const email = user?.email || '';
    const key = this.getStorageKey(email);
    localStorage.setItem(key, JSON.stringify(tasks));
    this.tasksSubject.next(tasks);
  }
  /**
   * @summary Returns all tasks for the currently logged-in user.
   * @returns A full array of tasks.
   */
  public getAllTasks(): Task[] {
    const user = this.authService.getCurrentUser();
    const email = user?.email || '';
    return this.read(email);
  }
  //#endregion

  //#region Fetchers (Get Methods)

  /**
   * @summary Finds and returns a single task by its ID.
   * @param id Task ID.
   * @returns Task object or undefined if not found.
   */
  public getTaskById(id: number): Task | undefined {
    return this.getAllTasks().find(t => t.id === id);
  }

  /**
   * @summary Returns all tasks belonging to the given project.
   * @param projectId Project ID.
   * @returns Filtered array of tasks.
   */
  public getTasksByProjectId(projectId: number): Task[] {
    return this.getAllTasks().filter(t => t.projectId === projectId);
  }
  //#endregion

  //#region CRUD Operations

  /**
   * @summary Adds a new task to localStorage.
   * @param task The new task to save.
   */
  public saveTask(task: Task): void {
    const tasks = this.getAllTasks();
    tasks.push(task);
    this.write(tasks);
  }

  /**
   * @summary Updates an existing task by replacing its data.
   * @param updated Modified task object.
   */
  public updateTask(updated: Task): void {
    const tasks = this.getAllTasks().map(t =>
      t.id === updated.id ? updated : t
    );
    this.write(tasks);
  }

  /**
   * @summary Deletes a single task by its ID.
   * @param id Task ID to delete.
   */
  public deleteTask(id: number): void {
    const tasks = this.getAllTasks().filter(t => t.id !== id);
    this.write(tasks);
  }

  /**
   * @summary Clears all tasks for the currently logged-in user.
   */
  public clearAllTasks(): void {
    const user = this.authService.getCurrentUser();
    const email = user?.email || '';
    const key = this.getStorageKey(email);
    localStorage.removeItem(key);
    this.tasksSubject.next([]);
  }
  //#endregion

  //#region Drag & Drop Status Update

  /**
   * @summary Updates a task’s status when dragged to a different column.
   * Also updates timestamps like updatedAt and completedAt.
   * @param id Task ID.
   * @param status New status (ToDo, InProgress, Completed).
   */
  public updateTaskStatus(id: number, status: TaskStatus): void {
    const all = this.getAllTasks();
    const i = all.findIndex(t => t.id === id);
    if (i === -1) return;

    const now = new Date().toISOString();
    all[i].status = status;
    all[i].updatedAt = now;
    all[i].completedAt = status === 'Completed' ? now : null;

    this.write(all);
  }
  //#endregion

  //#region Bulk Delete
  /**
   * @summary Deletes all tasks belonging to a specific project.
   * @param projectId The project's ID.
   */
  public deleteTasksByProjectId(projectId: number): void {
    const tasks = this.getAllTasks().filter(t => t.projectId !== projectId);
    this.write(tasks);
  }
  //#endregion
}