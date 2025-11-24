import { Injectable } from '@angular/core';
import { Project } from '../../../../types/models/project';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  // #region Properties
  /**
   * @summary Generates a unique key per user so each user has independent project storage
   */
  private getStorageKey(email: string): string {
    return `projects_${email}`;
  }
  // #endregion

  // #region CRUD Methods
  /**
   * @summary Retrieves all projects stored for a user.
   * @description Fetches all projects saved in localStorage. If no records exist, returns an empty array.
   * @param email - Email of the user (currently unused in storage logic)
   * @returns {Project[]} List of all saved projects.
   */
  public getAll(email: string): Project[] {
    const key = this.getStorageKey(email);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }
  /**
   * @summary Saves a new project to localStorage.
   * @description Retrieves the existing project list, appends the new project, and updates localStorage.
   * @param project - New project being saved
   * @param email - Email of the user (currently unused in storage logic)
   * @returns {void}
   */
  public save(project: Project, email: string): void {
    const key = this.getStorageKey(email);
    const projects = this.getAll(email);
    projects.push(project);
    localStorage.setItem(key, JSON.stringify(projects));
  }
  /**
   * @summary Updates an existing project.
   * @description Finds the project with the same ID and replaces it with updated data.
   * @param project - Updated project object
   * @param email - Email of the user (currently unused in storage logic)
   * @returns {void}
   */
  public update(project: Project, email: string): void {
    const key = this.getStorageKey(email);
    const projects = this.getAll(email).map(p => p.id === project.id ? project : p);
    localStorage.setItem(key, JSON.stringify(projects));
  }
  /**
   * @summary Retrieves a project by its unique ID.
   * @description Searches the localStorage for a project matching the given ID.
   * @param id - Unique ID of the project
   * @param email - Email of the user (currently unused in storage logic)
   * @returns {Project | undefined} Returns the project if found, otherwise undefined.
   */
  public getById(id: number, email: string): Project | undefined {
    return this.getAll(email).find(p => p.id === id);
  }
  /**
   * @summary Deletes a project by ID.
   * @description Filters out the project with matching ID and updates the storage.
   * @param id - ID of the project to be deleted
   * @param email - Email of the user (currently unused in storage logic)
   * @returns {void}
   */
  public delete(id: number, email: string): void {
    const key = this.getStorageKey(email);
    const projects = this.getAll(email).filter(p => p.id !== id);
    localStorage.setItem(key, JSON.stringify(projects));
  }
  // #endregion

  // #region Utility Methods
  /**
   * @summary Clears all stored project data.
   * @description Removes the localStorage key completely.
   * @param username - Username of the user (currently unused)
   * @returns {void}
   */
  public clear(email: string): void {
    const key = this.getStorageKey(email);
    localStorage.removeItem(key);
  }
  // #endregion
}