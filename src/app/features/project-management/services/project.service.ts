import { Injectable } from '@angular/core';
import { Project } from '../../../../types/models/project';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private readonly storageKey: string = 'projects';

  public getAll(email: string): Project[] {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  public save(project: Project, email: string): void {
    const projects = this.getAll(email);
    projects.push(project);
    localStorage.setItem(this.storageKey, JSON.stringify(projects));
  }

  public update(project: Project, email: string): void {
    const projects = this.getAll(email).map(p => p.id === project.id ? project : p);
    localStorage.setItem(this.storageKey, JSON.stringify(projects));
  }

  public getById(id: number, email: string): Project | undefined {
    return this.getAll(email).find(p => p.id === id);
  }

  public delete(id: number, email: string): void {
    const projects = this.getAll(email).filter(p => p.id !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(projects));
  }


  public clear(username: string): void {
    localStorage.removeItem(this.storageKey);
  }
  
}
