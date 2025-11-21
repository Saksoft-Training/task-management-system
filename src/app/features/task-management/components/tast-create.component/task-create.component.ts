//#region Imports
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule, FormBuilder, FormGroup, Validators,
  AbstractControl, ValidationErrors
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Project } from '../../../../../types/models/project';
import { Task, TaskPriority, TaskStatus } from '../../../../../types/models/task';
import { TaskService } from '../../services/task-service';
import { AuthService } from '../../../user-account-management/services/auth-service';
import { User } from '../../../../../types/models/user';
import { ProjectService } from '../../../project-management/services/project.service';
import { UserStorageService } from '../../../../shared/services/storage-service';
import { ConfirmationDialogComponent } from "../../../../shared/components/confirmation-dialog/confirmation-dialog.component";
import { NotificationService } from '../../../dashboard/services/notification-service';
//#endregion

@Component({
  selector: 'app-create-task',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ConfirmationDialogComponent],
  templateUrl: './task-create.component.html',
  styleUrls: ['./task-create.component.scss']
})
export class TaskCreateComponent implements OnInit {

  //#region Public Properties

  /** Main reactive form group for create/edit screen */
  public form!: FormGroup;

  /** Static lists for dropdowns */
  public readonly statuses: TaskStatus[] = ['To Do', 'In Progress', 'Completed'];
  public readonly priorities: TaskPriority[] = ['Low', 'Medium', 'High', 'Urgent'];

  /** Loaded project list and currently selected project */
  public projects: Project[] = [];
  public selectedProject?: Project;

  /** Whether to show the project dropdown (hidden when pre-selected via route) */
  public showProjectDropdown: boolean = true;

  /** UI feedback message after save */
  public successMessage: string = '';

  /** Maximum length allowed for description */
  public readonly maxDescription = 500;

  /** List of users used in the assignee dropdown */
  public users: User[] = [];

  /** Logged-in user's email */
  public currentUser: string = '';

  /** Edit mode state */
  public isEdit: boolean = false;
  public editTaskId?: number;
  public taskToEdit?: Task;

  /** Delete modal state */
  public showDeleteModal = false;
  public taskToDelete: Task | null = null;

  //#endregion

  constructor(
  private readonly fb: FormBuilder,
  private readonly route: ActivatedRoute,
  private readonly router: Router,
  private readonly projectService: ProjectService,
  private readonly taskService: TaskService,
  private readonly userStorageService: UserStorageService,
  private readonly authService: AuthService,
  private readonly notificationService: NotificationService   
) {}

  //#region Lifecycle

  /**
   * @summary Initializes the form, loads projects/users,
   * detects edit mode, and pre-fills form data.
   */
  ngOnInit(): void {
    const loggedUser = this.authService.getCurrentUser();
    this.currentUser = loggedUser?.email || '';

    this.loadProjects();
    this.loadUsers();
    this.detectProjectFromRoute();
    this.detectEditMode();

    this.buildTaskForm();
    this.subscribeToProjectChange();

    // Patch form values in edit mode (after view stabilizes)
    if (this.isEdit && this.taskToEdit) {
      setTimeout(() => {
        this.form.patchValue({
          projectId: this.taskToEdit!.projectId.toString(),
          title: this.taskToEdit!.title,
          status: this.taskToEdit!.status,
          priority: this.taskToEdit!.priority,
          description: this.taskToEdit!.description,
          assignee: this.taskToEdit!.assignee,
          dueDate: this.taskToEdit!.dueDate
        });
      });
    }
  }

  //#endregion

  //#region Initialization Helpers

  /** Load all projects belonging to current user */
  private loadProjects(): void {
    this.projects = this.projectService.getAll(this.currentUser);
  }

  /** Load all users for assignee dropdown */
  private loadUsers(): void {
    this.users = this.userStorageService.getAllUsers();
  }

  /**
   * @summary Detects if projectId was passed via route or query params.
   * If yes → lock project selection.
   */
  private detectProjectFromRoute(): void {
    let pid =
      this.route.snapshot.paramMap.get('projectId') ||
      this.route.snapshot.queryParamMap.get('projectId');

    if (pid) {
      const id = Number(pid);
      this.selectedProject = this.projectService.getById(id, this.currentUser) ?? undefined;
      this.showProjectDropdown = false; // project is preselected
    }
  }

  /**
   * @summary Detects if editing an existing task.
   * Loads the task and its associated project.
   */
  private detectEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.isEdit = true;
      this.editTaskId = Number(id);

      this.taskToEdit = this.taskService.getTaskById(this.editTaskId);

      if (this.taskToEdit) {
        this.selectedProject =
          this.projectService.getById(this.taskToEdit.projectId, this.currentUser) ?? undefined;

        this.showProjectDropdown = true; // allow project change when editing
      }
    }
  }

  /**
   * @summary Builds the reactive form with validators.
   */
  private buildTaskForm(): void {
    this.form = this.fb.group({
      projectId: [this.selectedProject?.id?.toString() || '', Validators.required],
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      status: ['To Do', Validators.required],
      priority: ['Medium', Validators.required],
      description: ['', Validators.maxLength(this.maxDescription)],
      assignee: ['', Validators.required],
      dueDate: ['', [Validators.required, this.validateDueDate.bind(this)]]
    });
  }

  /** Helper for Angular compareWith in dropdowns */
  public compareProject(a: any, b: any) {
    return Number(a) === Number(b);
  }

  /**
   * @summary Revalidates due date whenever project changes
   * to ensure date falls within project's start/end dates.
   */
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
   * @summary Validates that due date:
   * - is not in the past (create mode only)
   * - falls within the project start/end dates
   */
  private validateDueDate(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const date = new Date(value);
    date.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Prevent past dates when creating a new task
    if (!this.isEdit && date < today) return { pastDate: true };

    // Validate against project timeline
    if (this.selectedProject) {
      const start = new Date(this.selectedProject.startDate);
      const end = new Date(this.selectedProject.endDate);

      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);

      if (date < start) return { beforeProjectStart: true };
      if (date > end) return { afterProjectEnd: true };
    }

    return null;
  }

  //#endregion

  //#region Getters

  /** Minimum allowed date for date picker */
  get minDate(): string {
    const today = new Date().toISOString().split('T')[0];
    if (!this.selectedProject) return today;

    return new Date(this.selectedProject.startDate) > new Date(today)
      ? this.selectedProject.startDate
      : today;
  }

  /** Maximum allowed date for date picker */
  get maxDate(): string {
    return this.selectedProject?.endDate ?? '';
  }

  /** Character count for live description counter */
  get descriptionCount(): number {
    return this.form.get('description')?.value?.length ?? 0;
  }

  //#endregion

  //#region Actions

  /**
   * @summary Saves the task (create or update)
   * and shows success toast.
   */
  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const timestamp = new Date().toISOString();

    // ---------------- EDIT MODE ----------------
    if (this.isEdit && this.taskToEdit) {
      const updated: Task = {
        ...this.taskToEdit,
        ...value,
        projectId: Number(value.projectId),
        updatedAt: timestamp
      };

      this.taskService.updateTask(updated);
      this.notificationService.addNotification({
        kind: 'custom' as any,
        severity: 'success',
        title: 'Task updated successfully',
        message: updated.title,
        showToast: true
      });
    }
    // ---------------- CREATE MODE ----------------
    else {
      const newTask: Task = {
        id: Date.now(),
        title: value.title,
        description: value.description,
        status: value.status,
        priority: value.priority,
        assignee: value.assignee,
        assigneeEmail: '',
        dueDate: value.dueDate,
        projectId: Number(value.projectId),
        createdBy: this.currentUser,
        createdAt: timestamp,
        updatedAt: timestamp
      };

      this.taskService.saveTask(newTask);
      this.notificationService.addNotification({
        kind: 'custom' as any,
        severity: 'success',
        title: 'Task created successfully',
        message: value.title,
        showToast: true
      });

    }

    // Navigate after short delay (for message display)
    setTimeout(() => this.navigateAfterSave(), 900);
  }

  /** Navigate user after saving task */
  private navigateAfterSave(): void {
    if (this.selectedProject) {
      this.router.navigate(['/projects', this.selectedProject.id]);
    } else {
      this.router.navigate(['/tasks']);
    }
  }

  /** Opens delete confirmation modal */
  public onDelete(): void {
    this.taskToDelete = this.taskToEdit || null;
    this.showDeleteModal = true;
  }

  /** Deletes task and redirects */
  public onConfirmDelete(): void {
    if (this.taskToDelete) {
      this.taskService.deleteTask(this.taskToDelete.id);
    }
    this.showDeleteModal = false;
    this.taskToDelete = null;
    this.router.navigate(['/tasks']);
  }

  /** Cancels the delete modal */
  public onCancelDelete(): void {
    this.showDeleteModal = false;
    this.taskToDelete = null;
  }

  /** Clears form (only in create mode) */
  public onReset(): void {
    if (this.isEdit) return;

    this.form.reset({
      projectId: this.selectedProject?.id?.toString() || '',
      status: 'To Do',
      priority: 'Medium'
    });

    this.successMessage = '';
  }

  /** Navigate back to project/tasks page */
  public onCancel(): void {
    if (this.selectedProject) {
      this.router.navigate(['/projects', this.selectedProject.id]);
    } else {
      this.router.navigate(['/tasks']);
    }
  }

  /** Opens native date picker programmatically */
  public openDatePicker(): void {
    const el = document.querySelector<HTMLInputElement>('input[formControlName="dueDate"]');
    if (el) el.showPicker();
  }

  //#endregion
}
