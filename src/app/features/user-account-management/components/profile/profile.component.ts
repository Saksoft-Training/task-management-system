import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { UserStorageService } from '../../../../shared/services/storage-service';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  //#region Properties
  public currentUser: any = null;
  public isEditing = false;
  public editForm!: FormGroup;
  public previewImage: string | null = null;
  public errorMessage = '';
  //#endregion

  //#region Constructor
  /**
   * @summary Injects services used for profile update and user state management.
   * @param formBuilder - Builds the reactive form.
   * @param userStorage - Handles stored user CRUD operations.
   * @param authService - Syncs updated user with auth system.
   * @param router - Navigation handler.
   */
  constructor(
    private formBuilder: FormBuilder,
    private userStorage: UserStorageService,
    private authService: AuthService,
    private router: Router
  ) { }
  //#endregion

  //#region Lifecycle Hook
  /**
   * @summary Initializes the edit form and loads the current user.
   * @returns void
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
   * @summary Creates the reactive form with validators.
   * @returns void
   */
  private initializeForm(): void {
    this.editForm = this.formBuilder.group({
      name: [
        this.currentUser.name || '',
        [
          Validators.required,
          Validators.minLength(3),
          this.nameValidator()
        ]
      ],
      email: [
        this.currentUser.email || '',
        [Validators.required, this.gmailValidator()]
      ],
      password: ['', [this.passwordStrengthValidator]]
    });
  }
  //#endregion

  //#region Validators
  /**
   * @summary Validates that name contains only letters and spaces.
   * @returns ValidationErrors | null
   */
  private nameValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value || '';
      if (!value) return null;
      return /^[A-Za-z\s]+$/.test(value)
        ? null
        : { invalidName: true };
    };
  }
  /**
   * @summary Validates Gmailonly format.
   * @returns ValidationErrors | null
   */
  private gmailValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      const email = (control.value || '').trim().toLowerCase();
      if (!email) return null;
      return /^[a-z0-9._%+-]+@gmail\.com$/.test(email)
        ? null
        : { invalidEmail: true };
    };
  }
  /**
   * @summary Validates password strength on optional input.
   * @returns ValidationErrors | null
   */
  private passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;
    const hasUppercase = /[A-Z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    const hasMinLength = value.length >= 8;
    return hasUppercase && hasNumber && hasSpecial && hasMinLength
      ? null
      : { weakPassword: true };
  }
  //#endregion

  //#region Email Handling
  /**
   * @summary Ensures email is always lowercase and checks uniqueness.
   * @returns void
   */
  private listenToEmailChanges(): void {
    this.editForm.get('email')?.valueChanges.subscribe(val => {
      const ctrl = this.editForm.get('email');
      const lower = (val || '').toLowerCase();
      // Auto-lowercase
      if (val !== lower) {
        ctrl?.setValue(lower, { emitEvent: false });
      }
      const trimmed = lower.trim();
      const ownEmail = this.currentUser.email.trim().toLowerCase();
      // Unique email validation
      if (trimmed !== ownEmail && this.userStorage.isEmailExists(trimmed)) {
        ctrl?.setErrors({ emailExists: true });
      }
    });
  }
  //#endregion

  //#region UI Actions
  /**
   * @summary Enables edit mode.
   * @returns void
   */
  public enterEditMode(): void {
    this.isEditing = true;
    this.previewImage = this.currentUser.photo || null;
  }
  /**
   * @summary Navigates to the Create Project page.
   * @returns void
   */
  public goToCreateProject(): void {
    this.router.navigate(['/create-project']);
  }
  /**
   * @summary Cancels edit mode and resets form.
   * @returns void
   */
  public cancelEdit(): void {
    this.isEditing = false;
    this.previewImage = null;
    this.editForm.reset({
      name: this.currentUser.name,
      email: this.currentUser.email,
      password: ''
    });
  }
  //#endregion

  //#region Image Handler
  /**
   * @summary Handles profile image upload with size validation.
   * @param event - File input event.
   * @returns void
   */
  public onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];
    if (file.size > 2 * 1024 * 1024) {
      this.errorMessage = 'Image too large (max 2MB)';
      setTimeout(() => (this.errorMessage = ''), 2500);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.previewImage = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
  //#endregion

  //#region Submit
  /**
   * @summary Saves updated profile details to storage and syncs with auth system.
   * @returns void
   */
  public saveProfile(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }
    const oldEmail = this.currentUser.email.trim().toLowerCase();
    const name = this.editForm.value.name.trim();
    const email = this.editForm.value.email.trim().toLowerCase();
    const newPassword = this.editForm.value.password;
    const updatedUser = {
      ...this.currentUser,
      name,
      email,
      photo: this.previewImage || this.currentUser.photo,
      createdAt: this.currentUser.createdAt
    };
    if (newPassword) {
      updatedUser.password = this.userStorage.encodePassword(newPassword);
    }
    const success = this.userStorage.updateUser(updatedUser, oldEmail);
    if (!success) {
      alert('Failed to update profile.');
      return;
    }
    sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    this.authService.updateCurrentUser(updatedUser);
    this.currentUser = updatedUser;
    this.isEditing = false;
    this.previewImage = null;
    alert('Profile updated successfully!');
    this.router.navigate(['/dashboard']);
  }
  //#endregion
}
