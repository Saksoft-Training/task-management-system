//#region Imports
import { Injectable } from '@angular/core';
import { Task } from '../../../../types/models/task';
//#endregion

//#region Service Decorator
@Injectable({ providedIn: 'root' })
//#endregion

//#region TaskService
export class TaskService {

  //#region Local Storage Key
  /** Storage key for saving tasks in localStorage (TEMP until backend API is added) */
  private readonly storageKey = 'tasks';
  //#endregion

  //#region Get All Tasks
  /** Returns all tasks stored in localStorage */
  public getAll(): Task[] {
    const raw = localStorage.getItem(this.storageKey);
    return raw ? JSON.parse(raw) : [];
  }
  //#endregion

  //#region Save Task
  /** Saves a new task */
  public save(task: Task): void {
    const tasks = this.getAll();
    tasks.push(task);
    localStorage.setItem(this.storageKey, JSON.stringify(tasks));
  }
  //#endregion

  //#region Update Task
  /** Updates an existing task by ID */
  public update(updated: Task): void {
    const tasks = this.getAll().map(t => t.id === updated.id ? updated : t);
    localStorage.setItem(this.storageKey, JSON.stringify(tasks));
  }
  //#endregion

  //#region Delete Task
  /** Deletes a task by ID */
  public delete(id: number): void {
    const tasks = this.getAll().filter(t => t.id !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(tasks));
  }
  //#endregion

  //#region Get Task By Id
  /** Finds a single task by its ID */
  public getById(id: number): Task | undefined {
    return this.getAll().find(t => t.id === id);
  }
  //#endregion

  //#region Get Tasks By Project
  /** Returns all tasks belonging to a specific project */
  public getByProject(projectId: number): Task[] {
    return this.getAll().filter(t => t.projectId === projectId);
  }
  //#endregion

  //#region Clear Storage
  /** Removes all tasks (useful for resetting during testing) */
  public clear(): void {
    localStorage.removeItem(this.storageKey);
  }
  //#endregion
}
//#endregion
