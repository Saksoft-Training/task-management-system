//#region Imports
import { Injectable } from '@angular/core';
import { Task } from '../../../../types/models/task';
//#endregion

@Injectable({ providedIn: 'root' })
export class TaskService {

  //#region Private Properties
  /**
   * Key used for persisting tasks in localStorage.
   */
  private readonly storageKey: string = 'tasks';
  //#endregion

  //#region Public API — Read Operations

  /**
   * Returns all tasks stored in localStorage.
   *
   * @returns {Task[]} List of all saved tasks
   */
  public getAllTasks(): Task[] {
    const rawData = localStorage.getItem(this.storageKey);
    return rawData ? JSON.parse(rawData) : [];
  }

  /**
   * Retrieves a single task by its ID.
   *
   * @param id - The task ID
   * @returns {Task | undefined} Matching task or undefined
   */
  public getTaskById(id: number): Task | undefined {
    return this.getAllTasks().find(task => task.id === id);
  }

  /**
   * Retrieves all tasks associated with a project.
   *
   * @param projectId - Project ID
   * @returns {Task[]} Tasks that belong to the project
   */
  public getTasksByProjectId(projectId: number): Task[] {
    return this.getAllTasks().filter(task => task.projectId === projectId);
  }

  //#endregion

  //#region Public API — Write Operations

  /**
   * Saves a new task to localStorage.
   *
   * @param task - The task to store
   * @returns {void}
   */
  public saveTask(task: Task): void {
    const tasks = this.getAllTasks();
    tasks.push(task);
    this.writeTasks(tasks);
  }

  /**
   * Updates an existing task.
   *
   * @param updatedTask - Updated task object
   * @returns {void}
   */
  public updateTask(updatedTask: Task): void {
    const updatedTasks = this.getAllTasks().map(task =>
      task.id === updatedTask.id ? updatedTask : task
    );

    this.writeTasks(updatedTasks);
  }

  /**
   * Deletes a task by its ID.
   *
   * @param id - Task ID to delete
   * @returns {void}
   */
  public deleteTask(id: number): void {
    const filteredTasks = this.getAllTasks().filter(task => task.id !== id);
    this.writeTasks(filteredTasks);
  }

  /**
   * Clears all stored tasks.
   * Useful during development and debugging.
   *
   * @returns {void}
   */
  public clearAllTasks(): void {
    localStorage.removeItem(this.storageKey);
  }

  //#endregion

  //#region Private Utilities

  /**
   * Writes the given task list to localStorage.
   *
   * @param tasks - Array of tasks to persist
   * @returns {void}
   */
  private writeTasks(tasks: Task[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(tasks));
  }

  //#endregion

}
