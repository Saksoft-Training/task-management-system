//#region Imports
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule, FormBuilder, FormGroup, Validators,
  AbstractControl, ValidationErrors
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
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
export class TaskCreateComponent implements OnInit, OnDestroy {
 
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
 
  // Keep a subscription container for cleanup (OLD comment preserved)
  private subs = new Subscription();
 
  /**
   * @summary Constructor injection for services used by the component.
   */
  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly projectService: ProjectService,
    private readonly taskService: TaskService,
    private readonly userStorageService: UserStorageService,
    private readonly authService: AuthService,
    private readonly notificationService: NotificationService
  ) { }
 
  //#region Lifecycle
 
  /**
   * @summary Initializes the form, loads projects/users,
   * detects edit mode, and pre-fills form data.
   *
   * - Builds form
   * - Triggers initial loads
   * - Subscribes to project stream
   * - Waits for projects/users/tasks when in edit mode
   *
   * NEW comment:
   * - Uses combineLatest to wait for multiple async streams (projects, users, tasks)
   */
  ngOnInit(): void {
    const loggedUser = this.authService.getCurrentUser();
    this.currentUser = loggedUser?.email || '';
 
    this.buildTaskForm();
 
    // Trigger initial loads (services manage fetching)
    this.projectService.getAllAsync();
 
    // load users (subscribe to ensure we get values)
    const usersSub = this.userStorageService.getAllUsersFromApi().subscribe({
      next: (u) => this.users = u,
      error: () => {
        // fallback to sync getter if available
        try {
          const fallback = this.userStorageService.getAllUsers();
          if (fallback && fallback.length) this.users = fallback;
        } catch { /* swallow */ }
      }
    });
    this.subs.add(usersSub);
 
    this.detectProjectFromRoute();
    this.detectEditMode();
 
    // subscribe to projects stream
    const pSub = this.projectService.projects$.subscribe(list => {
      this.projects = list;
      if (this.selectedProject && !this.selectedProject.name) {
        this.selectedProject = this.projectService.getById(this.selectedProject.id, this.currentUser);
      }
    });
    this.subs.add(pSub);
 
    // Wait for projects, users and tasks (once) before patching in edit mode
    const combo = combineLatest([
  this.projectService.projects$,
  this.userStorageService.getAllUsersFromApi(),
  this.taskService.tasks$
])
.pipe(take(1))
.subscribe(([projects, users, tasks]) => {
 
  this.projects = projects;
  this.users = users;
 
  if (this.isEdit && this.editTaskId) {
 
    // Fetch task from loaded tasks, NOT from service snapshot
    this.taskToEdit = tasks.find(
      t => Number(t.id) === Number(this.editTaskId)
    );
 
    if (this.taskToEdit) {
      this.selectedProject = this.projectService.getById(
        this.taskToEdit.projectId,
        this.currentUser
      );
 
      this.showProjectDropdown = true;
 
      // pre-fill form
      this.form.patchValue({
        projectId: this.taskToEdit.projectId,
        title: this.taskToEdit.title,
        status: this.taskToEdit.status,
        priority: this.taskToEdit.priority,
        description: this.taskToEdit.description,
        assignee: this.findUserIdByName(this.taskToEdit.assignee),
        assigneeEmail: this.taskToEdit.assigneeEmail,
        dueDate: this.taskToEdit.dueDate
      });
    }
  }
    }, () => {
      // fallback patch if combineLatest errors
      if (this.isEdit && this.taskToEdit) {
        this.form.patchValue({
          projectId: this.taskToEdit.projectId ?? null,
          title: this.taskToEdit.title ?? '',
          status: this.taskToEdit.status ?? 'To Do',
          priority: this.taskToEdit.priority ?? 'Medium',
          description: this.taskToEdit.description ?? '',
          assignee: this.findUserIdByName(this.taskToEdit.assignee) ?? null,
          assigneeEmail: this.taskToEdit.assigneeEmail ?? '',
          dueDate: this.taskToEdit.dueDate ?? ''
        });
      }
    });
    this.subs.add(combo);
 
    this.subscribeToProjectChange();
  }
 
  /**
   * @summary Ensures subscriptions are cleaned up to avoid leaks.
   * OLD comment preserved: unsubscribe on destroy.
   */
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
 
  //#endregion
 
  //#region Initialization Helpers 
 
  /**
   * @summary Builds the reactive form with validators.
   * OLD comment preserved.
   */
  private buildTaskForm(): void {
    this.form = this.fb.group({
      projectId: [this.selectedProject?.id ?? null, Validators.required],
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      status: ['To Do', Validators.required],
      priority: ['Medium', Validators.required],
      description: ['', Validators.maxLength(this.maxDescription)],
      assignee: [null, Validators.required],
      assigneeEmail: [''],
      dueDate: ['', [Validators.required, this.validateDueDate.bind(this)]]
    });
  }
 
  /**
   * @summary Detects if projectId was passed via route or query params.
   * If yes → lock project selection.
   *
   * OLD comment preserved.
   */
  private detectProjectFromRoute(): void {
    const pid = this.route.snapshot.paramMap.get('projectId') || this.route.snapshot.queryParamMap.get('projectId');
    if (pid) {
      const id = Number(pid);
      this.selectedProject = this.projectService.getById(id, this.currentUser) ?? { id } as Project;
      this.showProjectDropdown = false;
      if (this.form) this.form.patchValue({ projectId: id });
    }
  }
 
  /**
   * @summary Detects if editing an existing task.
   * Loads the task and its associated project.
   *
   * OLD comment preserved.
   */
  private detectEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.editTaskId = Number(id);
      this.taskToEdit = this.taskService.getTaskById(this.editTaskId);
      if (this.taskToEdit) {
        this.selectedProject = this.projectService.getById(this.taskToEdit.projectId, this.currentUser) ?? undefined;
        this.showProjectDropdown = true;
      }
    }
  }
 
  /**
   * @summary Subscribes to project selection changes and revalidates due date.
   * OLD comment preserved.
   */
  private subscribeToProjectChange(): void {
    this.form.get('projectId')?.valueChanges.subscribe(value => {
      this.selectedProject = value ? this.projectService.getById(Number(value), this.currentUser) ?? undefined : undefined;
      this.form.get('dueDate')?.updateValueAndValidity();
    });
  }
 
  //#endregion
 
  //#region Validators 
 
  /**
   * @summary Validates that due date:
   * - is not in the past (create mode only)
   * - falls within the project start/end dates
   *
   * OLD comment preserved and applied unchanged.
   */
  private validateDueDate(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;
 
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);
 
    const today = new Date();
    today.setHours(0, 0, 0, 0);
 
    if (!this.isEdit && date < today) return { pastDate: true };
 
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
   *
   * OLD comment preserved.
   *
   * NEW: this method now resolves assignee IDs -> user objects (users array)
   *       and ensures assigneeEmail is preserved or resolved from selected user.
   */
  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
 
    const value = this.form.getRawValue();
    const timestamp = new Date().toISOString();
 
    const assigneeId = Number(value.assignee);
    const assigneeUser = this.users.find(u => Number(u.id) === assigneeId);
 
    if (this.isEdit && this.taskToEdit) {
      const updated: Task = {
        ...this.taskToEdit,
        ...value,
        projectId: Number(value.projectId),
        assignee: assigneeUser?.name ?? this.taskToEdit.assignee,
        assigneeEmail: assigneeUser?.email ?? value.assigneeEmail ?? this.taskToEdit.assigneeEmail,
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
    } else {
      const newTask: Task = {
        id: Date.now(),
        title: value.title,
        description: value.description,
        status: value.status,
        priority: value.priority,
        assignee: assigneeUser?.name ?? '',
        assigneeEmail: assigneeUser?.email ?? (this.form.get('assigneeEmail')?.value ?? ''),
        dueDate: value.dueDate,
        projectId: Number(value.projectId),
        createdBy: this.currentUser,
        createdAt: timestamp,
        updatedAt: timestamp,
        completedAt: null
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
 
    setTimeout(() => this.navigateAfterSave(), 600);
  }
 
  /** Navigate user after saving task */
  private navigateAfterSave(): void {
    if (this.selectedProject) this.router.navigate(['/projects', this.selectedProject.id]);
    else this.router.navigate(['/tasks']);
  }
 
  /** Opens delete confirmation modal */
  public onDelete(): void {
    this.taskToDelete = this.taskToEdit || null;
    this.showDeleteModal = true;
  }
 
  /** Deletes task and redirects */
  public onConfirmDelete(): void {
    if (this.taskToDelete) this.taskService.deleteTask(this.taskToDelete.id);
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
      projectId: this.selectedProject?.id ?? null,
      status: 'To Do',
      priority: 'Medium'
    });
 
    this.successMessage = '';
  }
 
  /** Navigate back to project/tasks page */
  public onCancel(): void {
    if (this.selectedProject) this.router.navigate(['/projects', this.selectedProject.id]);
    else this.router.navigate(['/tasks']);
  }
 
  /** Opens native date picker programmatically */
  public openDatePicker(): void {
    const el = document.querySelector<HTMLInputElement>('input[formControlName="dueDate"]');
    if (el) el.showPicker?.();
  }
 
  //#endregion
 
  //#region Assignee Helpers (NEW helper + OLD-style helper merged)
 
  /**
   * @summary Called when assignee select value changes (keeps old-style handler).
   * Patches assigneeEmail and assignee id into the form when available.
   */
  public onAssigneeChange(event: any): void {
    const userId = Number(event.target.value);
    const selectedUser = this.users.find(u => Number(u.id) === userId);
 
    if (selectedUser) {
      this.form.patchValue({
        assignee: selectedUser.id,
        assigneeEmail: selectedUser.email
      });
    }
  }
 
  /**
   * @summary OLD helper preserved:
   * findUserIdByName(name) => returns numeric id for a user string (name or email)
   */
  private findUserIdByName(name?: string): number | null {
    if (!name) return null;
    const u = this.users.find(x => x.name === name || x.email === name);
    return u ? Number(u.id) : null;
  }
 
  //#endregion
}
 