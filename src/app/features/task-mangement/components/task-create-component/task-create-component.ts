//#region Imports
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Task } from '../../models/task.model';
import { TaskService } from '../../services/task-service';
//#endregion

//#region Component Metadata
@Component({
  selector: 'app-task-create-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-create-component.html',
  styleUrl: './task-create-component.scss',
})
//#endregion

//#region TaskCreateComponent
export class TaskCreateComponent implements OnInit {
  //#region Properties
  taskForm!: FormGroup;
  projectId!: string;
  users = ['Pragathi', 'Likitha', 'Priyanka', 'Prathyusha']; // dummy data 🙅‍♀️🙅‍♀️🙅‍♀️
  tasks: Task[] = [];
  successMessage = '';

  projectStartDate = new Date('2025-11-01'); // dummy data 🙅‍♀️🙅‍♀️🙅‍♀️
  projectEndDate = new Date('2025-11-30');  // dummy data 🙅‍♀️🙅‍♀️🙅‍♀️
  //#endregion

  //#region Constructor
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private taskService: TaskService
  ) {}
  //#endregion

  //#region Lifecycle Hooks
  /**
   * Initializes the form, loads existing tasks, and sets up validation.
   */
  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('projectId') || '';
    this.tasks = this.taskService.getByProject(this.projectId);

    this.initializeForm();
    this.taskForm.valueChanges.subscribe(() => this.validateDueDate());
  }
  //#endregion

  //#region Private Methods
  /**
   * Initializes the task creation form with validators.
   */
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

  /**
   * Validates that the due date is not in the past and within the project range.
   */
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
  //#endregion

  //#region Public Methods
  /**
   * Handles task creation, form validation, and UI feedback.
   */
  onSubmit(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

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
      createdBy: 'Prathyusha', // dummy data 🙅‍♀️🙅‍♀️🙅‍♀️ --->log in user
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Persist task and update UI
    this.taskService.create(newTask);
    this.tasks.push(newTask);

    // Show success message
    this.successMessage = 'Task created successfully! ';
    setTimeout(() => (this.successMessage = ''), 3000);

    // Reset form for next entry
    this.taskForm.reset({ projectId: this.projectId });
  }

  /**
   * Navigates back to the project page with confirmation.
   */
  onCancel(): void {
    if (confirm('Are you sure you want to cancel?')) {
      this.router.navigate(['/projects', this.projectId]); // dummy data 🙅‍♀️🙅‍♀️🙅‍♀️ --> it has to take back to project detail page 
    }
  }

  /* Getter for easy access to form controls in the template.
   */
  get f() {
    return this.taskForm.controls;
  }
  //#endregion
}
//#endregion
