import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Task, TaskStatus } from '../../../../types/models/task';
import { AuthService } from '../../user-account-management/services/auth-service';


@Injectable({
  providedIn: 'root',
})
export class TaskService {

  //#region Private Properties
  /** LocalStorage key under which tasks are stored */
  private storageKey = 'tasks'; 

  /**
   * @summary Generates a unique key per user so each user has independent task storage
   */
  private getStorageKey(email: string): string {
    return `tasks_${email}`; 
  }

  /** Reactive source of all tasks */
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  /** Observable for components to subscribe to */
  public tasks$ = this.tasksSubject.asObservable();
  //#endregion
  //#region Constructor
  constructor(private authService: AuthService) {
    const user = this.authService.getCurrentUser();
    const email = user?.email || '';
    this.tasksSubject.next(this.read(email)); 
  }

  //#region Local Storage (Read / Write)

  /** 
   * Reads all tasks from LocalStorage.
   * Returns empty array if no tasks exist.
   */
  private read(email: string): Task[] {
    const key = this.getStorageKey(email);
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  }
 
  /** WRITE LOCAL STORAGE */
  private write(tasks: Task[]): void {
    const user = this.authService.getCurrentUser();
    const email = user?.email || '';
    const key = this.getStorageKey(email);
    localStorage.setItem(key, JSON.stringify(tasks));
    this.tasksSubject.next(tasks);
  }
  /**
   * Writes the provided tasks array to LocalStorage
   * and updates the reactive BehaviorSubject.
   */
  getAllTasks(): Task[] {
    const user = this.authService.getCurrentUser();
    const email = user?.email || '';
    return this.read(email);
  }
  //#endregion

  //#region Fetchers (Get Methods)

  /** Returns all tasks from LocalStorage */
  getTaskById(id: number): Task | undefined {
    return this.getAllTasks().find(t => t.id === id);
  }
 
  /** Returns a task by its ID, or undefined if not found */
  getTasksByProjectId(projectId: number): Task[] {
    return this.getAllTasks().filter(t => t.projectId === projectId);
  }
  //#endregion

  //#region CRUD Operations

  /** Saves a new task to LocalStorage */
  saveTask(task: Task): void {
    const tasks = this.getAllTasks();
    tasks.push(task);
    this.write(tasks);
  }
 
  /** Updates an existing task based on its ID */
  updateTask(updated: Task): void {
    const tasks = this.getAllTasks().map(t =>
      t.id === updated.id ? updated : t
    );
    this.write(tasks);
  }
  /** Deletes a single task by ID */
  deleteTask(id: number): void {
    const tasks = this.getAllTasks().filter(t => t.id !== id);
    this.write(tasks);
  }
  /** Removes all tasks from LocalStorage */
  clearAllTasks(): void {
    const user = this.authService.getCurrentUser();
    const email = user?.email || '';
    const key = this.getStorageKey(email);
    localStorage.removeItem(key);
    this.tasksSubject.next([]);
  }
  //#endregion

  //#region Drag & Drop Status Update

  /**
   * Updates a task's status during drag/drop operations.
   * Also sets updatedAt and completedAt timestamps.
   */
  updateTaskStatus(id: number, status: TaskStatus): void {
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
   * Deletes all tasks belonging to the given project ID.
   */
  deleteTasksByProjectId(projectId: number): void {
    const tasks = this.getAllTasks().filter(t => t.projectId !== projectId);
    this.write(tasks);
  }
  //#endregion
}