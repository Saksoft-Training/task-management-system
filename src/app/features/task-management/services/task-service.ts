import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Task, TaskStatus } from '../../../../types/models/task';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  
  private storageKey = 'tasks';

  private tasksSubject = new BehaviorSubject<Task[]>(this.read());
  public tasks$ = this.tasksSubject.asObservable();

  /** READ LOCAL STORAGE */
  private read(): Task[] {
    const raw = localStorage.getItem(this.storageKey);
    return raw ? JSON.parse(raw) : [];
  }

  /** WRITE LOCAL STORAGE */
  private write(tasks: Task[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(tasks));
    this.tasksSubject.next(tasks);
  }

  /** FETCHERS */
  getAllTasks(): Task[] {
    return this.read();
  }

  getTaskById(id: number): Task | undefined {
    return this.getAllTasks().find(t => t.id === id);
  }

  getTasksByProjectId(projectId: number): Task[] {
    return this.getAllTasks().filter(t => t.projectId === projectId);
  }

  /** CRUD */
  saveTask(task: Task): void {
    const tasks = this.getAllTasks();
    tasks.push(task);
    this.write(tasks);
  }

  updateTask(updated: Task): void {
    const tasks = this.getAllTasks().map(t =>
      t.id === updated.id ? updated : t
    );
    this.write(tasks);
  }

  deleteTask(id: number): void {
    const tasks = this.getAllTasks().filter(t => t.id !== id);
    this.write(tasks);
  }

  clearAllTasks(): void {
    localStorage.removeItem(this.storageKey);
    this.tasksSubject.next([]);
  }

  /** DRAG/DROP STATUS UPDATE */
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
}
