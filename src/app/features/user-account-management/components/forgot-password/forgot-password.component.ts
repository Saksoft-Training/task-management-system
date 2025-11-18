import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, AsyncValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { UserStorageService } from '../../../../shared/services/storage-service';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ForgotPasswordComponent implements OnInit {
  //#region Properties
  public resetForm!: FormGroup;
  public isSubmitting: boolean = false;
  public successMessage: string = '';
  public errorMessage: string = '';
  //#endregion

  //#region Constructor
  /**
   * @summary Injects form builder, user storage service and router.
   * @param formBuilder - Used to build reactive forms.
   * @param userStorage - Handles local user data operations.
   * @param router - Used for navigation.
   */
  constructor(
    private formBuilder: FormBuilder,
    private userStorage: UserStorageService,
    private router: Router
  ) { }
  //#endregion

  //#region Lifecycle Hook
  /**
   * @summary Initializes reset-password form on component load.
   * @returns void
   */
  public ngOnInit(): void {
    this.resetForm = this.formBuilder.group(
      {
        email: ['', [Validators.required, this.gmailValidator()], [this.emailExistsValidator()]],
        newPassword: ['', [Validators.required, this.passwordStrengthValidator()]],
        confirmPassword: ['', [Validators.required]]
      },
      { validators: this.confirmPasswordValidator() }
    );
  }
  //#endregion

  //#region Validators
  /**
   * @summary Validates email to allow only Gmail addresses.
   * @param control - Form control for email.
   * @returns ValidationErrors | null
   */
  private gmailValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      const email = control.value;
      if (!email) return null;
      const pattern = /^[a-z0-9._%+-]+@gmail\.com$/;
      return pattern.test(email) ? null : { invalidEmail: true };
    };
  }
  /**
   * @summary Asynchronous validator: checks if email exists in local storage.
   * @returns AsyncValidatorFn
   */
  private emailExistsValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      const email = (control.value || '').trim().toLowerCase();
      if (!email) return of(null);
      return of(this.userStorage.isEmailExists(email)).pipe(
        delay(200),
        map(exists => (exists ? null : { emailNotFound: true }))
      );
    };
  }
  /**
   * @summary Validates password strength (uppercase, number, special char).
   * @param control - Form control for password.
   * @returns ValidationErrors | null
   */
  private passwordStrengthValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.value || '';
      const valid =
        password.length >= 8 &&
        /[A-Z]/.test(password) &&
        /\d/.test(password) &&
        /[^A-Za-z0-9]/.test(password);
      return valid ? null : { weakPassword: true };
    };
  }
  /**
   * @summary Validates if new password matches confirm password.
   * @param group - Form group containing password fields.
   * @returns ValidationErrors | null
   */
  private confirmPasswordValidator() {
    return (group: AbstractControl): ValidationErrors | null => {
      const p1 = group.get('newPassword')?.value;
      const p2 = group.get('confirmPassword')?.value;
      return p1 && p2 && p1 !== p2 ? { mismatch: true } : null;
    };
  }
  //#endregion

  //#region Helper Methods
  /**
   * @summary Getter for easy access to form controls.
   * @returns FormGroup['controls']
   */
  public get formControls(): FormGroup['controls'] {
    return this.resetForm.controls;
  }
  /**
   * @summary Forces the email input to lowercase.
   * @returns void
   */
  public forceLowercaseEmail(): void {
    const emailCtrl = this.resetForm.get('email');
    const value = emailCtrl?.value || '';
    emailCtrl?.setValue(value.toLowerCase(), { emitEvent: true });
  }
  //#endregion

  //#region Form Submission
  /**
   * @summary Validates form, updates password if valid and handles messages.
   * @returns void
   */
  public submitReset(): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.isSubmitting = true;
    this.resetForm.updateValueAndValidity();
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      this.isSubmitting = false;
      return;
    }
    const email = (this.resetForm.value.email || '').trim().toLowerCase();
    const newPassword = this.resetForm.value.newPassword;
    of(null).pipe(delay(500)).subscribe(() => {
      const updated = this.userStorage.updatePasswordForEmail(email, newPassword);
      if (!updated) {
        this.errorMessage = 'Email not found.';
        this.isSubmitting = false;
        return;
      }
      alert("Password reset successfully!");//alert for demo purposes
      this.successMessage = 'Password reset successfully. Redirecting to login…';
      this.resetForm.reset();
      setTimeout(() => {
        this.isSubmitting = false;
        this.router.navigate(['/login']);
      }, 900);
    });
  }
  //#endregion

  //#region Navigation
  /**
   * @summary Navigates user back to login screen.
   * @returns void
   */
  public goToLogin(): void {
    this.router.navigate(['/login']);
  }
  //#endregion
}
