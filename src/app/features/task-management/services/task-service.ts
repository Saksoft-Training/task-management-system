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
  /**
   * Storage key used to persist tasks in localStorage.
   * This will be replaced 
   */
  private readonly storageKey = 'tasks';
  //#endregion

  //#region Get All Tasks
  /**
   * Returns all tasks stored in localStorage.
   *
   * @returns {Task[]} All saved tasks
   */
  public getAll(): Task[] {
    const raw = localStorage.getItem(this.storageKey);
    return raw ? JSON.parse(raw) : [];
  }
  //#endregion

  //#region Save Task
  /**
   * Adds a new task to localStorage.
   *
   * @param task The task to save
   */
  public save(task: Task): void {
    const tasks = this.getAll();
    tasks.push(task);
    localStorage.setItem(this.storageKey, JSON.stringify(tasks));
  }
  //#endregion

  //#region Update Task
  /**
   * Updates an existing task by replacing it based on ID.
   *
   * @param updated The task object containing the updated values
   */
  public update(updated: Task): void {
    const tasks = this.getAll().map(t =>
      t.id === updated.id ? updated : t
    );

    localStorage.setItem(this.storageKey, JSON.stringify(tasks));
  }
  //#endregion

  //#region Delete Task
  /**
   * Removes a task by its ID.
   *
   * @param id The ID of the task to delete
   */
  public delete(id: number): void {
    const tasks = this.getAll().filter(t => t.id !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(tasks));
  }
  //#endregion

  //#region Get Task By Id
  /**
   * Retrieves a task by its ID.
   *
   * @param id The ID of the task
   * @returns The matching task or undefined
   */
  public getById(id: number): Task | undefined {
    return this.getAll().find(t => t.id === id);
  }
  //#endregion

  //#region Get Tasks By Project
  /**
   * Gets all tasks that belong to a specific project.
   *
   * @param projectId The project ID
   * @returns Task[] List of tasks under that project
   */
  public getByProject(projectId: number): Task[] {
    return this.getAll().filter(t => t.projectId === projectId);
  }
  //#endregion

  //#region Clear Storage
  /**
   * Removes all stored tasks.
   * Useful during development or for debugging.
   */
  public clear(): void {
    localStorage.removeItem(this.storageKey);
  }
  //#endregion
}
//#endregion
