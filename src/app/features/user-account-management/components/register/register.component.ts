import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, AsyncValidatorFn, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
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
  //#region Properties
  public registerForm!: FormGroup;
  public successMessage = '';
  public errorMessage = '';
  public isSubmitting = false;
  public passwordRulesStatus = {
    hasMinLength: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecialChar: false
  };
  //#endregion

  //#region Constructor
  /**
   * @summary Injects form builder, authentication service, user storage service, and router.
   * @param formBuilder - Builds reactive form controls.
   * @param authService - Handles API-related auth actions.
   * @param userStorage - Manages local stored user data.
   * @param router - Handles navigation.
   */
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private userStorage: UserStorageService,
    private router: Router,
    private notificationService: NotificationService
  ) { }
  //#endregion

  //#region Lifecycle Hook
  /**
   * @summary Initializes form and listens for password changes.
   * @returns void
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
   * @summary Builds the registration form with synchronous and asynchronous validators.
   * @returns void
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
   * @summary Validates that name contains only letters and spaces.
   * @returns ValidationErrors | null
   */
  private nameValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      const name = control.value;
      if (!name) return null;
      return /^[A-Za-z\s]+$/.test(name) ? null : { invalidName: true };
    };
  }
  /**
   * @summary Validates email format to allow only Gmail addresses.
   * @returns ValidationErrors | null
   */
  private gmailValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      const email = control.value;
      if (!email) return null;
      return /^[a-z0-9._%+-]+@gmail\.com$/.test(email)
        ? null
        : { invalidEmail: true };
    };
  }
  /**
   * @summary Checks password strength: min length, uppercase, number, special char.
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
   * @summary Ensures password & confirm password match.
   * @returns ValidationErrors | null
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
  //#endregion

  //#region Async Validators
  /**
   * @summary Asynchronous validator to check if email already exists.
   * @returns Observable<ValidationErrors | null>
   */
  private emailUniqueValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      const email = (control.value || '').trim().toLowerCase();
      if (!email) return of(null);

      return of(this.userStorage.isEmailExists(email)).pipe(
        delay(300),
        map(isTaken => (isTaken ? { emailTaken: true } : null))
      );
    };
  }
  //#endregion

  //#region Helpers
  /**
   * @summary Converts email input value to lowercase.
   * @returns void
   */
  public forceLowercaseEmail(): void {
    const emailCtrl = this.registerForm.get('email');
    const val = emailCtrl?.value || '';
    emailCtrl?.setValue(val.toLowerCase(), { emitEvent: true });
  }
  /**
   * @summary Updates password rule tracking used for strength UI.
   * @param password - Current password input.
   * @returns void
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
   * @summary Calculates password strength percentage.
   * @returns number
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
   * @summary Determines CSS class for password strength meter.
   * @returns string
   */
  public getPasswordStrengthClass(): string {
    const s = this.getPasswordStrengthPercentage();
    if (s <= 25) return 'strength-weak';
    if (s <= 50) return 'strength-medium';
    if (s <= 75) return 'strength-strong';
    return 'strength-very-strong';
  }
  /**
   * @summary Returns human-readable strength label.
   * @returns string
   */
  public getPasswordStrengthLabel(): string {
    const s = this.getPasswordStrengthPercentage();
    if (s <= 25) return 'Weak';
    if (s <= 50) return 'Medium';
    if (s <= 75) return 'Strong';
    return 'Very Strong';
  }
  /**
   * @summary Getter for all form controls.
   * @returns any
   */
  public get formControls() {
    return this.registerForm.controls;
  }
  //#endregion

  //#region Reset
  /**
   * @summary Resets the form and password status indicators.
   * @returns void
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
   * @summary Validates registration form, stores user, and redirects to login.
   * @returns void
   */
  public onSubmit(): void {
  this.isSubmitting = true;
  this.registerForm.updateValueAndValidity();

  if (this.registerForm.invalid) {
    this.registerForm.markAllAsTouched();
    this.isSubmitting = false;
    return;
  }

  const { name, email, password } = this.registerForm.value;

  if (this.userStorage.isEmailExists(email)) {
    this.registerForm.get('email')?.setErrors({ emailTaken: true });

    this.notificationService.addNotification({
  kind: 'custom' as any,
  severity: 'critical',
  title: 'Registration Failed',
  message: 'Please try again.',
  showToast: true
});


    this.isSubmitting = false;
    return;
  }

  const encryptedPassword = this.userStorage.encodePassword(password);
  const newUser: User = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password: encryptedPassword,
    createdAt: new Date().toISOString()
  };

  const users = this.userStorage.getAllUsers();
  users.push(newUser);
  this.userStorage.saveAllUsers(users);

  this.notificationService.addNotification({
  kind: 'custom' as any,  // if no specific kind is needed
  severity: 'success',
  title: 'Registration Successful',
  message: 'Your account has been created.',
  showToast: true   // 👈 VERY IMPORTANT
});


  setTimeout(() => this.router.navigate(['/login']), 1200);
  this.isSubmitting = false;
}

  //#endregion

  //#region Navigation
  /**
   * @summary Navigates back to login screen.
   * @returns void
   */
  public goToLogin(): void {
    this.router.navigate(['/login']);
  }
  //#endregion
}