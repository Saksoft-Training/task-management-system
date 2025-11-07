//#region Imports
import { Injectable } from '@angular/core';
import { Task } from '../models/task.model';
//#endregion

//#region Injectable Metadata
@Injectable({
  providedIn: 'root',
})
//#endregion

//#region Task Service
export class TaskService {
  //#region Properties
  /**
   * The key used to store and retrieve task data from localStorage.
   */
  private storageKey = 'tasks';
  //#endregion

  //#region Public Methods
  /**
   * Retrieves all tasks from localStorage.
   * @returns An array of Task objects.
   */
  public getAll(): Task[] {
    return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
  }

  /**
   * Creates a new task and saves it to localStorage.
   * @param task The Task object to be added.
   */
  public create(task: Task): void {
    const tasks = this.getAll();
    tasks.push(task);
    localStorage.setItem(this.storageKey, JSON.stringify(tasks));
  }

  /**
   * Retrieves all tasks belonging to a specific project.
   * @param projectId The ID of the project.
   * @returns An array of Task objects for the given project.
   */
  public getByProject(projectId: string): Task[] {
    return this.getAll().filter((t) => t.projectId === projectId);
  }

  /**
   * Deletes a task by its ID and updates localStorage.
   * @param id The ID of the task to delete.
   */
  public delete(id: number): void {
    const tasks = this.getAll().filter((t) => t.id !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(tasks));
  }
  //#endregion
}
//#endregion

