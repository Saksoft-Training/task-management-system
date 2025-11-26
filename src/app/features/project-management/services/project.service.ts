import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Project } from '../../../../types/models/project';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  //#region Properties
  /**
   * @summary Base API URL for all project operations.
   * MockAPI endpoint used to simulate backend CRUD behavior.
   */
  private readonly apiBase = 'https://692433503ad095fb847320c8.mockapi.io/projects';
  /**
   * @summary In-memory cache of projects.
   * Stores all projects fetched from API to avoid repeated network calls.
   */
  private projectsCache: Project[] = [];
  /**
   * @summary Observable stream of current projects.
   * Components subscribe to this to get live updates.
   */
  private projectsSubject = new BehaviorSubject<Project[]>([]);
  /** Public observable exposed to components */
  public projects$ = this.projectsSubject.asObservable();
  //#endregion

  //#region Constructor
  /**
   * @summary Initializes the service and loads initial data from API.
   */
  constructor(private http: HttpClient) {
    // Load initial API data asynchronously
    this.refreshFromApi();
  }
  //#endregion

  //#region Internal Helpers
  /**
     * @summary Normalizes a raw project object from API.
     * Ensures valid date strings, IDs, and statuses.
     * @param p Raw project object
     * @returns Normalized Project
     */
  private normalizeProject(p: any): Project {
    return {
      ...p,
      createdAt: !isNaN(Date.parse(p.createdAt)) ? p.createdAt : new Date().toISOString(),
      endDate: !isNaN(Date.parse(p.endDate)) ? p.endDate : new Date().toISOString(),
      status: this.normalizeStatus(p.status),
      id: Number(p.id),
    } as Project;
  }
  /**
   * @summary Ensures project status is always valid.
   * @param status Status string from API
   * @returns Valid status
   */
  private normalizeStatus(
    status: string
  ): 'Planning' | 'In Progress' | 'Completed' | 'On Hold' {
    const validStatuses = ['Planning', 'In Progress', 'Completed', 'On Hold'] as const;
    return validStatuses.includes(status as any) ? (status as any) : 'Planning';
  }
  /**
   * @summary Loads all projects from API and updates both cache and observable.
   * Includes error handling + normalizes all received records.
   */
  private refreshFromApi(): void {
    this.http
      .get<Project[]>(this.apiBase)
      .pipe(
        catchError((err) => {
          console.error('[ProjectService] Failed to fetch projects', err);
          return of([] as Project[]);
        }),
        tap((rawProjects) => {
          const cleaned = rawProjects.map((p) => this.normalizeProject(p));

          this.projectsCache = cleaned;
          this.projectsSubject.next(this.projectsCache.slice());
        })
      )
      .subscribe();
  }
  /**
   * @summary Inserts or replaces a project in the cache.
   * Emits updated list to subscribers.
   */
  private upsertCache(project: Project): void {
    const index = this.projectsCache.findIndex(
      (p) => String(p.id) === String(project.id)
    );
    if (index === -1) {
      this.projectsCache.push(project);
    } else {
      this.projectsCache[index] = project;
    }
    this.projectsSubject.next(this.projectsCache.slice());
  }
  /**
   * @summary Removes a project from the cache by ID.
   */
  private removeFromCache(id: number): void {
    this.projectsCache = this.projectsCache.filter(
      (p) => String(p.id) !== String(id)
    );
    this.projectsSubject.next(this.projectsCache.slice());
  }
  //#endregion

  //#region API-backed CRUD Methods
  /**
   * @summary Async observable getter for project list.
   * Automatically refreshes from API when called.
   * @returns Observable<Project[]>
   */
  public getAllAsync(): Observable<Project[]> {
    this.refreshFromApi();
    return this.projects$;
  }
  /**
   * @summary Returns a snapshot of cached projects.
   * Maintains compatibility with old localStorage-based usage.
   */
  public getAll(email: string): Project[] {
    return this.projectsCache.slice();
  }
  /**
   * @summary Saves a new project to backend using optimistic update.
   * @description Adds a temporary project locally until server confirms.
   */
  public save(project: Project, email: string): void {
    const finalId = project.id;
    const finalProject: Project = { ...project, id: finalId };
    this.upsertCache(finalProject);
    this.http
      .post<Project>(this.apiBase, finalProject)
      .pipe(
        catchError((err) => {
          console.error('[ProjectService.save] failed', err);
          this.removeFromCache(finalId);
          return of(null as any);
        }),
        tap((created) => {
          if (created) {
            const normalized = {
              ...created,
              id: finalId,
            };
            this.upsertCache(normalized);
          }
        })
      )
      .subscribe();
  }
  /**
   * @summary Updates an existing project.
   * @description Sends updated project to API and refreshes cached data.
   */
  public update(project: Project, email: string): void {
    this.upsertCache(project);
    this.http
      .put<Project>(`${this.apiBase}/${project.id}`, project)
      .pipe(
        catchError((err) => {
          console.error('[ProjectService.update] failed', err);
          this.refreshFromApi();
          return of(null as any);
        }),
        tap((updated) => {
          if (updated) {
            const normalized = this.normalizeProject(updated);
            this.upsertCache(normalized);
          }
        })
      )
      .subscribe();
  }
  /**
   * @summary Retrieves a project by ID from cache.
   * @returns Project | undefined
   */
  public getById(id: number, email: string): Project | undefined {
    return this.projectsCache.find(
      (p) => Number(p.id) === Number(id)
    );
  }
  /**
   * @summary Deletes a project using optimistic update.
   * @description Removes locally, then sends DELETE request to API.
   */
  public delete(id: number, email: string): void {
    this.removeFromCache(id);
    this.http
      .delete<void>(`${this.apiBase}/${id}`)
      .pipe(
        catchError((err) => {
          console.error('[ProjectService.delete] failed', err);
          this.refreshFromApi();
          return of(null as any);
        })
      )
      .subscribe();
  }
  /**
   * @summary Clears all projects created by a specific user.
   */
  public clear(email: string): void {
    this.projectsCache = this.projectsCache.filter(
      (p) => p.createdBy !== email
    );
    this.projectsSubject.next(this.projectsCache.slice());
  }
  //#endregion
}
