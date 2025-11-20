import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Task } from '../../../../../types/models/task';
import { TaskService } from '../../services/task-service';
import { ProjectService } from '../../../project-management/services/project.service';
import { DeleteConfirmModalComponent } from "../delete-confirm-modal.component/delete-confirm-modal.component";

@Component({
  selector: 'app-task-detail-page',
  standalone: true,
  imports: [CommonModule, FormsModule, DeleteConfirmModalComponent],
  templateUrl: './task-detail-page.component.html',
  styleUrls: ['./task-detail-page.component.scss']
})
export class TaskDetailPageComponent implements OnInit {

  task!: Task | null;
  projectName: string = '';
  statusHistory: { status: string; date: string }[] = [];
   public showDeleteModal = false;
public taskToDelete: Task | null = null;



  priorityOptions = ['Low', 'Medium', 'High', 'Urgent'];
  statusOptions = ['To Do', 'In Progress', 'Completed'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.task = this.taskService.getTaskById(id) || null;

    if (!this.task) return;

    // Load project name
    const email = localStorage.getItem('loggedUserEmail') || '';
    const project = this.projectService.getById(this.task.projectId, email);
    this.projectName = project?.name ?? 'Unknown Project';

    // Build simple status history (dynamic)
    this.statusHistory = [
      { status: this.task.status, date: this.task.updatedAt },
      { status: 'Created', date: this.task.createdAt }
    ];
  }

  onEdit() {
  if (this.task) {
    this.router.navigate(['/tasks/edit', this.task.id]);
  }
}

  onDelete() {
  if (!this.task) return;
  this.taskToDelete = this.task;
  this.showDeleteModal = true;
}
onConfirmDelete() {
  if (this.taskToDelete) {
    this.taskService.deleteTask(this.taskToDelete.id);
  }
  this.showDeleteModal = false;
  this.taskToDelete = null;
  this.router.navigate(['/tasks']);
}

onCancelDelete() {
  this.showDeleteModal = false;
  this.taskToDelete = null;
}



  updateStatus(newStatus: string) {
    if (this.task) {
      this.task.status = newStatus as any;
      this.task.updatedAt = new Date().toISOString();
      this.taskService.updateTask(this.task);
    }
  }

  updatePriority(newPriority: string) {
    if (this.task) {
      this.task.priority = newPriority as any;
      this.task.updatedAt = new Date().toISOString();
      this.taskService.updateTask(this.task);
    }
  }
}
