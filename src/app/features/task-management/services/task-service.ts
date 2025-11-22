import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Task, TaskStatus } from '../../../../types/models/task';
 
@Injectable({
  providedIn: 'root',
})
export class TaskService {

  //#region Private Properties
  /** LocalStorage key under which tasks are stored */
  private storageKey = 'tasks';
  
  /** Reactive source of all tasks */
  private tasksSubject = new BehaviorSubject<Task[]>(this.read());
    /** Observable for components to subscribe to */
  public tasks$ = this.tasksSubject.asObservable();
  //#endregion

  //#region Local Storage (Read / Write)

  /** 
   * Reads all tasks from LocalStorage.
   * Returns empty array if no tasks exist.
   */
  private read(): Task[] {
    const raw = localStorage.getItem(this.storageKey);
    return raw ? JSON.parse(raw) : [];
  }
 
  /** WRITE LOCAL STORAGE */
  private write(tasks: Task[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(tasks));
    this.tasksSubject.next(tasks);
  }
  /**
   * Writes the provided tasks array to LocalStorage
   * and updates the reactive BehaviorSubject.
   */
  getAllTasks(): Task[] {
    return this.read();
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
    localStorage.removeItem(this.storageKey);
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