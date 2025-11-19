//#region Imports
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Project } from '../../../../../types/models/project';
import { Task, TaskPriority, TaskStatus } from '../../../../../types/models/task';
import { TaskService } from '../../services/task-service';
import { AuthService } from '../../../user-account-management/services/auth-service';
import { User } from '../../../../../types/models/user';
import { ProjectService } from '../../../project-management/services/project.service';
import { UserStorageService } from '../../../../shared/services/storage-service';
//#endregion

@Component({
  selector: 'app-create-task',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-create.component.html',
  styleUrls: ['./task-create.component.scss']
})
export class TaskCreateComponent implements OnInit {

  //#region Public Properties

  /** Reactive form used for creating tasks */
  public form!: FormGroup;

  /** Predefined list of task statuses */
  public readonly statuses: TaskStatus[] = ['To Do', 'In Progress', 'Completed'];

  /** Predefined list of task priorities */
  public readonly priorities: TaskPriority[] = ['Low', 'Medium', 'High', 'Urgent'];

  /** List of all available projects */
  public projects: Project[] = [];

  /** Selected project if provided via route */
  public selectedProject?: Project;

  /** If false, do not show project dropdown (route provided projectId) */
  public showProjectDropdown: boolean = true;

  /** Success message shown after creating a task */
  public successMessage: string = '';

  /** Max description characters allowed */
  public readonly maxDescription: number = 500;

  /** List of users loaded from local storage */
  public users: User[] = [];

  /** Mock logged-in user */
  public currentUser: string = '';


  //#endregion

  //#region Constructor
  constructor(
  private readonly fb: FormBuilder,
  private readonly route: ActivatedRoute,
  private readonly router: Router,
  private readonly projectService: ProjectService,
  private readonly taskService: TaskService,
  private readonly userStorageService: UserStorageService,
  private readonly authService: AuthService
) {}
  //#endregion

  //#region Lifecycle Methods

  /**
   * Initializes component: loads projects, users, detects project from route,
   * builds reactive form, and attaches listeners.
   */
 public ngOnInit(): void {
  const user = this.authService.getCurrentUser();
  this.currentUser = user?.email || '';

  this.loadProjects();
  this.loadUsers();
  this.detectProjectFromRoute();
  this.buildTaskForm();
  this.subscribeToProjectChange();
}

  //#endregion

  //#region Initialization Helpers

  private loadProjects(): void {
    this.projects = this.projectService.getAll(this.currentUser);
  }

  private loadUsers(): void {
    this.users = this.userStorageService.getAllUsers();
  }

  private detectProjectFromRoute(): void {
    const projectIdParam =
      this.route.snapshot.paramMap.get('id') ||
      this.route.snapshot.paramMap.get('projectId');

    if (projectIdParam) {
      const projectId = Number(projectIdParam);
      this.selectedProject =
        this.projectService.getById(projectId, this.currentUser) ?? undefined;

      this.showProjectDropdown = false;
    }
  }

  private buildTaskForm(): void {
    this.form = this.fb.group({
      projectId: [
        this.selectedProject?.id || null,
        this.showProjectDropdown ? Validators.required : []
      ],
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      status: ['To Do', Validators.required],
      priority: ['Medium', Validators.required],
      description: ['', Validators.maxLength(this.maxDescription)],
      assignee: ['', Validators.required],
      dueDate: ['', [Validators.required, this.validateDueDate.bind(this)]]
    });
  }

  private subscribeToProjectChange(): void {
    this.form.get('projectId')?.valueChanges.subscribe(value => {
      this.selectedProject = value
        ? this.projectService.getById(Number(value), this.currentUser) ?? undefined
        : undefined;

      this.form.get('dueDate')?.updateValueAndValidity();
    });
  }

  //#endregion

  //#region Validators

  /**
   * Validates if due date is not in the past and lies within selected project date range.
   */
  private validateDueDate(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const selected = new Date(value);
    selected.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selected < today) return { pastDate: true };

    if (this.selectedProject) {
      const start = new Date(this.selectedProject.startDate);
      const end = new Date(this.selectedProject.endDate);

      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);

      if (selected < start) return { beforeProjectStart: true };
      if (selected > end) return { afterProjectEnd: true };
    }

    return null;
  }

  //#endregion

  //#region Getter Helpers

  /** Minimum allowed due date */
  public get minDate(): string {
    const today = new Date().toISOString().split('T')[0];
    if (!this.selectedProject) return today;

    return new Date(this.selectedProject.startDate) > new Date(today)
      ? this.selectedProject.startDate
      : today;
  }

  /** Maximum allowed due date */
  public get maxDate(): string {
    return this.selectedProject?.endDate ?? '';
  }

  /** Character count for description */
  public get descriptionCount(): number {
    return this.form.get('description')?.value?.length ?? 0;
  }

  //#endregion

  //#region Form Actions

  /**
   * Validates the form, constructs a new Task object, saves it,
   * shows a success message, and navigates appropriately.
   */
  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.value;
    const timestamp = new Date().toISOString();

    const newTask: Task = {
      id: Date.now(),
      title: formValue.title,
      description: formValue.description,
      status: formValue.status,
      priority: formValue.priority,
      assignee: formValue.assignee,
      assigneeEmail: '',
      dueDate: formValue.dueDate, 
      projectId: Number(this.selectedProject?.id ?? formValue.projectId),
      createdBy: this.currentUser,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    this.taskService.saveTask(newTask);
    this.successMessage = 'Task created successfully!';

    setTimeout(() => this.navigateAfterSave(), 900);
  }

  private navigateAfterSave(): void {
    if (this.selectedProject) {
      this.router.navigate(['/projects', this.selectedProject.id]);
    } else {
      this.router.navigate(['/tasks']);
    }
  }

  /**
   * Resets form fields while keeping project selection.
   */
  public onReset(): void {
    this.form.reset({
      projectId: this.selectedProject?.id || null,
      status: 'To Do',
      priority: 'Medium'
    });

    this.successMessage = '';
  }

  /**
   * Navigates the user back to the relevant previous page.
   */
  public onCancel(): void {
    if (this.selectedProject) {
      this.router.navigate(['/projects', this.selectedProject.id]);
    } else {
      this.router.navigate(['/tasks']);
    }
  }

  //#endregion
}
