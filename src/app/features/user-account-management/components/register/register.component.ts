import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, AsyncValidatorFn, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { User } from '../../../../../types/models/user';
import { AuthService } from '../../services/auth-service';
import { UserStorageService } from '../../../../shared/services/storage-service';
import { NotificationService } from '../../../dashboard/services/notification-service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  //#region Public Properties
  /** Register form group */
  public registerForm!: FormGroup;
  /** Success message after submission */
  public successMessage = '';
  /** Error message when registration fails */
  public errorMessage = '';
  /** Indicates loading state during submission */
  public isSubmitting = false;
  /** Password rule flags for progress bar UI */
  public passwordRulesStatus = {
    hasMinLength: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecialChar: false
  };
  //#endregion

  //#region Constructor
  /**
   * @summary Injects form builder, API services, router and toast service.
   * @param formBuilder Builds registration form
   * @param authService Manages auth states (future use)
   * @param userStorage API handler for user operations
   * @param router Navigation service
   * @param notificationService Displays toast notifications
   */
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private userStorage: UserStorageService,
    private router: Router,
    private notificationService: NotificationService
  ) { }
  //#endregion

  //#region Lifecycle
  /**
   * @summary Initializes register form and password rule tracking.
   */
  public ngOnInit(): void {
    this.initializeForm();
    this.registerForm.get('password')?.valueChanges.subscribe(password =>
      this.updatePasswordRulesStatus(password)
    );
  }
  //#endregion

  //#region Form Initialization
  /**
   * @summary Builds the reactive registration form with validators.
   */
  private initializeForm(): void {
    this.registerForm = this.formBuilder.group(
      {
        name: ['', [Validators.required, Validators.minLength(3), this.nameValidator()]],
        email: [
          '',
          {
            validators: [Validators.required, this.gmailValidator()],
            asyncValidators: [this.emailUniqueValidator()],
            updateOn: 'change'
          }
        ],
        password: ['', [Validators.required, this.passwordStrengthValidator()]],
        confirmPassword: ['', Validators.required]
      },
      { validators: this.confirmPasswordValidator() }
    );
  }
  //#endregion

  //#region Validators
  /**
   * @summary Validates names (letters + spaces only)
   */
  private nameValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      const name = control.value;
      return !name || /^[A-Za-z\s]+$/.test(name)
        ? null
        : { invalidName: true };
    };
  }
  /**
   * @summary Gmail-only email validation.
   */
  private gmailValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      const email = control.value;
      return !email || /^[a-z0-9._%+-]+@gmail\.com$/.test(email)
        ? null
        : { invalidEmail: true };
    };
  }
  /**
   * @summary Validates password strength (uppercase, number, special char).
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
   * @summary Confirms password matches confirmPassword field.
   */
  private confirmPasswordValidator() {
    return (group: AbstractControl): ValidationErrors | null => {
      const pass = group.get('password')?.value;
      const confirm = group.get('confirmPassword')?.value;
      return pass && confirm && pass !== confirm
        ? { passwordMismatch: true }
        : null;
    };
  }
  /**
   * @summary Async validator checking if email already exists in API.
   */
  private emailUniqueValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      const email = (control.value || '').trim().toLowerCase();
      if (!email) return of(null);
      return this.userStorage.isEmailExistsApi(email).pipe(
        map(exists => (exists ? { emailTaken: true } : null))
      );
    };
  }
  //#endregion

  //#region Email Handling
  /**
   * @summary Converts email to lowercase automatically.
   */
  public forceLowercaseEmail(): void {
    const emailCtrl = this.registerForm.get('email');
    const val = emailCtrl?.value || '';
    emailCtrl?.setValue(val.toLowerCase(), { emitEvent: false });
  }
  //#endregion

  //#region Password Strength Helpers
  /**
   * @summary Updates UI indicators based on password strength.
   */
  private updatePasswordRulesStatus(password: string): void {
    this.passwordRulesStatus = {
      hasMinLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[^A-Za-z0-9]/.test(password)
    };
  }
  /**
   * @summary Returns percentage strength for progress bar.
   */
  public getPasswordStrengthPercentage(): number {
    let s = 0;
    if (this.passwordRulesStatus.hasMinLength) s += 25;
    if (this.passwordRulesStatus.hasUppercase) s += 25;
    if (this.passwordRulesStatus.hasNumber) s += 25;
    if (this.passwordRulesStatus.hasSpecialChar) s += 25;
    return s;
  }
  /**
   * @summary Returns CSS class based on password strength.
   */
  public getPasswordStrengthClass(): string {
    const s = this.getPasswordStrengthPercentage();
    if (s <= 25) return 'strength-weak';
    if (s <= 50) return 'strength-medium';
    if (s <= 75) return 'strength-strong';
    return 'strength-very-strong';
  }
  /**
   * @summary Returns user-friendly label for password strength.
   */
  public getPasswordStrengthLabel(): string {
    const s = this.getPasswordStrengthPercentage();
    if (s <= 25) return 'Weak';
    if (s <= 50) return 'Medium';
    if (s <= 75) return 'Strong';
    return 'Very Strong';
  }
  //#endregion

  //#region Form Helpers
  /** Getter for form controls in template */
  public get formControls() {
    return this.registerForm.controls;
  }
  /**
   * @summary Resets form and password strength UI.
   */
  public onReset(): void {
    this.registerForm.reset();
    this.passwordRulesStatus = {
      hasMinLength: false,
      hasUppercase: false,
      hasNumber: false,
      hasSpecialChar: false
    };
  }
  //#endregion

  //#region Submit
  /**
   * @summary Handles registration form submission.
   */
  public onSubmit(): void {
    this.isSubmitting = true;
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.isSubmitting = false;
      return;
    }
    const { name, email, password } = this.registerForm.value;
    const encryptedPassword = this.userStorage.encodePassword(password);
    const newUser: User = {
      id: Date.now().toString(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: encryptedPassword,
      createdAt: new Date().toISOString()
    };
    this.userStorage.createUser(newUser).subscribe({
      next: () => {
        this.notificationService.addNotification({
          kind: 'custom' as any,
          severity: 'success',
          title: 'Registration Successful',
          message: 'Your account has been created.',
          showToast: true
        });
        this.isSubmitting = false;
        setTimeout(() => this.router.navigate(['/login']), 1200);
      },
      error: () => {
        this.notificationService.addNotification({
          kind: 'custom' as any,
          severity: 'critical',
          title: 'Registration Failed',
          message: 'Please try again.',
          showToast: true
        });
        this.isSubmitting = false;
      }
    });
  }
  //#endregion

  //#region Navigation
  /** Navigates to login page */
  public goToLogin(): void {
    this.router.navigate(['/login']);
  }
  //#endregion
}
