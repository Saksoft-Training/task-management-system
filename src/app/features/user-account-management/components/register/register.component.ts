import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, AsyncValidatorFn, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { User } from '../../../../../types/models/user';
import { AuthService } from '../../services/auth-service';
import { UserStorageService } from '../../../../shared/services/storage-service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  //#region Properties
  /** Registration form group */
  public registerForm!: FormGroup;
  /** Success message displayed after registration */
  public successMessage = '';
  /** Error message for UI display */
  public errorMessage = '';
  /** Disabled state for submit button */
  public isSubmitting = false;
  /** Password rule tracker for meter */
  public passwordRulesStatus = {
    hasMinLength: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecialChar: false
  };
  //#endregion

  //#region Constructor
  /**
   * @summary Initializes required services for registration.
   * @param formBuilder Builds reactive forms
   * @param authService Handles registration & validations
   * @param userStorage Provides user storage helpers
   * @param router Handles navigation
   */
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private userStorage: UserStorageService,
    private router: Router
  ) {}
  //#endregion

  //#region Lifecycle Hook
  /**
   * @summary Runs on component initialization. Builds form and subscribes to password changes.
   * @returns void
   */
  ngOnInit(): void {
    this.initializeForm();
    this.registerForm.get('password')?.valueChanges.subscribe(password =>
      this.updatePasswordRulesStatus(password)
    );
  }
  //#endregion

  //#region Form Initialization
  /**
   * @summary Creates registration form with validators.
   * @returns void
   */
  private initializeForm(): void {
    this.registerForm = this.formBuilder.group(
      {
        name: ['', [Validators.required, Validators.minLength(3), this.nameValidator()]],
        email: ['', [Validators.required, this.gmailValidator()], [this.emailUniqueValidator()]],
        password: ['', [Validators.required, this.passwordStrengthValidator()]],
        confirmPassword: ['', Validators.required]
      },
      { validators: this.confirmPasswordValidator() }
    );
  }
  //#endregion

  //#region Validators
  /**
   * @summary Validates that name contains only alphabets and spaces.
   * @param control Form control
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
   * @summary Validates only lowercase Gmail address.
   * @param control Form control
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
   * @summary Validates password strength rules.
   * @param control Form control
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
   * @summary Returns CSS class based on password strength.
   * @returns string
   */
  public getPasswordStrengthClass() {
    const s = this.getPasswordStrengthPercentage();
    if (s <= 25) return 'strength-weak';
    if (s <= 50) return 'strength-medium';
    if (s <= 75) return 'strength-strong';
    return 'strength-very-strong';
  }

  /**
   * @summary Validator ensuring password & confirm password match.
   * @param group Form group
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
  /**
   * @summary Checks if email already exists asynchronously.
   * @returns AsyncValidatorFn
   */
  private emailUniqueValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      const email = control.value;
      if (!email) return of(null);

      return of(
        this.userStorage.getAllUsers().some(
          u => u.email.toLowerCase() === email.toLowerCase()
        )
      ).pipe(
        delay(300),
        map(taken => (taken ? { emailTaken: true } : null))
      );
    };
  }
  //#endregion

  //#region Email Lowercase
  /**
   * @summary Forces email input to lowercase for consistency.
   * @returns void
   */
  public forceLowercaseEmail(): void {
    const emailCtrl = this.registerForm.get('email');
    const val = emailCtrl?.value || '';
    emailCtrl?.setValue(val.toLowerCase(), { emitEvent: false });
  }
  //#endregion

  //#region Password Meter Logic
  /**
   * @summary Updates dynamic password strength rule statuses.
   * @param password User-entered password
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
   * @summary Gets meter color based on strength.
   * @returns string
   */
  public getPasswordStrengthColor(): string {
    const s = this.getPasswordStrengthPercentage();
    if (s <= 25) return 'red';
    if (s <= 50) return 'orange';
    if (s <= 75) return 'yellowgreen';
    return 'green';
  }
  /**
   * @summary Returns readable strength label.
   * @returns string
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
  /**
   * @summary Shorthand getter for form controls.
   * @returns any
   */
  public get formControls() {
    return this.registerForm.controls;
  }
  /**
   * @summary Resets the form state and meter values.
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
    this.successMessage = '';
    this.errorMessage = '';
  }
  //#endregion

  //#region Form Submission
  /**
   * @summary Handles form submission and user registration.
   * @returns void
   */
  public onSubmit(): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.isSubmitting = true;
    this.registerForm.updateValueAndValidity();
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.isSubmitting = false;
      return;
    }
    const { name, email, password } = this.registerForm.value;
    if (this.userStorage.getAllUsers().some(u => u.email.toLowerCase() === email.toLowerCase())) {
      this.registerForm.get('email')?.setErrors({ emailTaken: true });
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
    this.successMessage = 'Registration successful';
    setTimeout(() => this.router.navigate(['/login']), 1200);
    this.isSubmitting = false;
  }
  //#endregion

  //#region Navigation
  /**
   * @summary Redirects to login page.
   * @returns void
   */
  public goToLogin(): void {
    this.router.navigate(['/login']);
  }
  //#endregion
}
