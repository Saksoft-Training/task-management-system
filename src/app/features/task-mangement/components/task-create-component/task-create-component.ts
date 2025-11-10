//#region Imports
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Task } from '../../models/task.model';
import { TaskService } from '../../services/task-service';
import { ErrorMessageComponent } from '../../../../shared/components/error-message.component/error-message.component';
//#endregion

@Component({
  selector: 'app-task-create-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ErrorMessageComponent],
  templateUrl: './task-create-component.html',
  styleUrl: './task-create-component.scss',
})
export class TaskCreateComponent implements OnInit {
  taskForm!: FormGroup;
  projectId!: string;
  users = ['Pragathi', 'Likitha', 'Priyanka', 'Prathyusha'];
  tasks: Task[] = [];

  notification = {
    message: '',
    type: '' as 'success' | 'error' | 'info' | 'warning',
    visible: false,
  };

  projectStartDate = new Date('2025-11-01');
  projectEndDate = new Date('2025-11-30');

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private taskService: TaskService
  ) { }

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('projectId') || '';
    this.tasks = this.taskService.getByProject(this.projectId);

    this.initializeForm();
    this.taskForm.valueChanges.subscribe(() => this.validateDueDate());
  }

  private initializeForm(): void {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      status: ['', Validators.required],
      priority: ['', Validators.required],
      assignee: ['', Validators.required],
      dueDate: ['', Validators.required],
      projectId: [this.projectId],
    });
  }

  private validateDueDate(): void {
    const dueDateValue = this.taskForm.get('dueDate')?.value;
    if (!dueDateValue) return;

    const dueDate = new Date(dueDateValue);
    const today = new Date();
    const errors: any = {};

    if (dueDate < today) errors.pastDate = true;
    if (dueDate < this.projectStartDate || dueDate > this.projectEndDate)
      errors.outOfRange = true;

    this.taskForm.get('dueDate')?.setErrors(Object.keys(errors).length ? errors : null);
  }

  onSubmit(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      this.showNotification('Please fill all required fields correctly.', 'error', 4000);
      return;
    }

    try {
      const formValue = this.taskForm.value;
      const newTask: Task = {
        id: Date.now(),
        title: formValue.title.trim(),
        description: formValue.description?.trim() || '',
        status: formValue.status,
        priority: formValue.priority,
        assignee: formValue.assignee,
        dueDate: formValue.dueDate,
        projectId: formValue.projectId,
        createdBy: 'Prathyusha',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.taskService.create(newTask);
      this.tasks.push(newTask);

      // Auto-hide success in 2 seconds
      this.showNotification('Task created successfully!', 'success', 1500);
      this.router.navigate(['/projects', this.projectId, 'tasks']);
      this.taskForm.reset({ projectId: this.projectId });
    } catch (error) {
      this.showNotification('Failed to create task. Please try again.', 'error', 2000);
    }
  }

  onCancel(): void {
    if (confirm('Are you sure you want to cancel?')) {
      this.router.navigate(['/projects', this.projectId]);
    }
  }

  private showNotification(
    message: string,
    type: 'success' | 'error' | 'info' | 'warning',
    duration: number
  ) {
    this.notification = {
      message,
      type,
      visible: true,
    };

    //  Hide notification after custom duration
    setTimeout(() => {
      this.notification.visible = false;
    }, duration);
  }

  get f() {
    return this.taskForm.controls;
  }
}
