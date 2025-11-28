import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { UserStorageService } from '../../../../shared/services/storage-service';
import { AuthService } from '../../services/auth-service';
import { User } from '../../../../../types/models/user';
import { NotificationService } from '../../../dashboard/services/notification-service';
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  //#region Public Properties
  /** Logged-in user details */
  public currentUser: User | null = null;
  /** Whether edit mode is enabled */
  public isEditing = false;
  /** Profile edit form group */
  public editForm!: FormGroup;
  /** Preview image for uploaded profile picture */
  public previewImage: string | null = null;
  /** Temporary error message (ex: image too large) */
  public errorMessage = '';
  //#endregion

  //#region Constructor
  /**
   * @summary Injects services used for user profile update.
   * @param formBuilder Builds reactive form
   * @param userStorage Handles user API CRUD calls
   * @param authService Syncs user state across application
   * @param router Navigation handling
   * @param notificationService Toast notification system
   */
  constructor(
    private formBuilder: FormBuilder,
    private userStorage: UserStorageService,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) { }
  //#endregion

  //#region Lifecycle Hook
  /**
   * @summary Initializes form and loads authenticated user.
   */
  public ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }
    this.initializeForm();
    this.listenToEmailChanges();
  }
  //#endregion

  //#region Form Initialization
  /**
   * @summary Creates reactive form with all validators.
   */
  private initializeForm(): void {
    this.editForm = this.formBuilder.group({
      name: [
        this.currentUser!.name,
        [Validators.required, Validators.minLength(3), this.nameValidator()]
      ],
      email: [
        this.currentUser!.email,
        [Validators.required, this.gmailValidator()]
      ],
      password: ['', [this.passwordStrengthValidator]]
    });
  }
  //#endregion

  //#region Validators
  /**
   * @summary Validates names (letters + spaces only).
   */
  private nameValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value || '';
      return /^[A-Za-z\s]+$/.test(value)
        ? null
        : { invalidName: true };
    };
  }
  /**
   * @summary Validates Gmail-only email format.
   */
  private gmailValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      const email = (control.value || '').trim().toLowerCase();
      return /^[a-z0-9._%+-]+@gmail\.com$/.test(email)
        ? null
        : { invalidEmail: true };
    };
  }
  /**
   * @summary Strong password validator (optional field).
   */
  private passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;
    const isStrong =
      /[A-Z]/.test(value) &&
      /[0-9]/.test(value) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(value) &&
      value.length >= 8;
    return isStrong ? null : { weakPassword: true };
  }
  //#endregion

  //#region Email Handling
  /**
   * @summary Auto-lowercases email and checks for duplicate emails.
   */
  private listenToEmailChanges(): void {
    this.editForm.get('email')?.valueChanges.subscribe(val => {
      const ctrl = this.editForm.get('email');
      const lower = (val || '').toLowerCase();
      if (val !== lower) {
        ctrl?.setValue(lower, { emitEvent: false });
      }
      const trimmed = lower.trim();
      const ownEmail = this.currentUser!.email.trim().toLowerCase();
      if (trimmed !== ownEmail && this.userStorage.isEmailExists(trimmed)) {
        ctrl?.setErrors({ emailExists: true });
      }
    });
  }
  //#endregion

  //#region UI Actions
  /**
   * @summary Enables editing mode.
   */
  public enterEditMode(): void {
    this.isEditing = true;
    this.previewImage = this.currentUser!.photo || null;
  }
  /**
   * @summary Navigates to create project page.
   */
  public goToCreateProject(): void {
    this.router.navigate(['/create-project']);
  }
  /**
   * @summary Cancels editing and resets form.
   */
  public cancelEdit(): void {
    this.isEditing = false;
    this.previewImage = null;
    this.editForm.reset({
      name: this.currentUser!.name,
      email: this.currentUser!.email,
      password: ''
    });
    this.router.navigate(['/dashboard']);
  }
  //#endregion

  //#region Image Handler
  /**
   * @summary Handles image upload + size validation.
   * @param event File input event
   */
  public onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];
    if (file.size > 2 * 1024 * 1024) {
      this.errorMessage = 'Image too large (max 2MB)';
      import('rxjs').then(rx => {
        rx.of(null).pipe(rx.delay(2500)).subscribe(() => {
          this.errorMessage = '';
        });
      });
      return;
    }
    this.compressImage(file, (tinyBase64: string) => {
      this.previewImage = tinyBase64;
    });
  }
  /**
   * @summary Compress uploaded image into small Base64 thumbnail.
   */
  private compressImage(file: File, callback: (base64: string) => void): void {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const img = new Image();
      img.src = reader.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 40;
        canvas.height = 40;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, 40, 40);
        const tinyBase64 = canvas.toDataURL('image/jpeg', 0.3);
        callback(tinyBase64);
      };
    };
  }
  //#endregion

  //#region Submit
  /**
   * @summary Saves updated profile data & syncs with API + auth service.
   */
  public saveProfile(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }
    const name = this.editForm.value.name.trim();
    const email = this.editForm.value.email.trim().toLowerCase();
    const newPassword = this.editForm.value.password;
    const updatedUser: Partial<User> = {
      name,
      email,
      photo: this.previewImage || this.currentUser!.photo
    };
    if (newPassword) {
      updatedUser.password = this.userStorage.encodePassword(newPassword);
    }
    this.userStorage.updateUserApi(this.currentUser!.id, updatedUser).subscribe({
      next: (updated) => {
        sessionStorage.setItem('currentUser', JSON.stringify(updated));
        localStorage.setItem('currentUser', JSON.stringify(updated));
        this.authService.updateCurrentUser(updated);
        this.currentUser = updated;
        this.isEditing = false;
        this.previewImage = null;
        this.notificationService.addNotification({
          title: 'Profile Updated',
          message: 'Your profile was updated successfully.',
          severity: 'success',
          kind: 'profile-update' as any,
          showToast: true
        });
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.notificationService.addNotification({
          title: 'Update Failed',
          message: 'Unable to update your profile.',
          severity: 'critical',
          kind: 'profile-update-error' as any,
          showToast: true
        });
      }
    });
  }
  //#endregion
}