import { Injectable } from '@angular/core';
import { IProject } from '../../../contracts/project.interface';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  //#region Fields and Properties
  /**
   * Key used to store project data in localStorage
   */
  private readonly storageKey: string = 'projects';
  //#endregion

  //#region Get Methods
  /**
   * Retrieves all stored projects from localStorage
   * @returns An array of IProject objects. Returns an empty array if no data exists.
   */
  public getAll(): IProject[] {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  /**
   * Retrieves a single project by its unique ID.
   * @param id - The identifier of project.
   * @returns Project object if found, else undefined.
   */
  public getById(id: number): IProject | undefined {
    return this.getAll().find(projectId => projectId.id === id);
  }
  //#endregion

  //#region Create and Update Methods
  /**
   * Saves a new project to localStorage.
   * Appends the project to the existing list of stored projects.
   * @param project - The new project object to save.
   * @return void
   */
  public save(project: IProject): void {
    const projects = this.getAll();
    projects.push(project);
    localStorage.setItem(this.storageKey, JSON.stringify(projects));
  }

  /**
   * Updates an existing project in localStorage.
   * Finds project by ID and merges updated properties.
   * Automatically refreshes the updatedAt timestamp.
   * @param updated - Updated project data.
   * @returns void
   */
  public update(updated: IProject): void {
    const projects = this.getAll().map(projectId => projectId.id === updated.id ? {
      ...projectId, ...updated, updatedAt: new Date().toISOString()
    } : projectId
    );
    localStorage.setItem(this.storageKey, JSON.stringify(projects));
  }
  //#endregion

  //#region Utility Methods
  /**
   * Clears all stored project data from localStorage.
   * @returns void
   */
  clear(): void {
    localStorage.removeItem(this.storageKey);
  }
  //#endregion
}
