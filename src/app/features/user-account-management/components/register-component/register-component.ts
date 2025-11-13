import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, AsyncValidatorFn, ReactiveFormsModule} from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { User } from '../../../../../types/models/user';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register-component.html',
  styleUrls: ['./register-component.scss']
})
export class RegisterComponent implements OnInit {
  //#region Properties
  public registerForm!: FormGroup;
  /** Success message displayed after registration */
  public successMessage = '';
  /** Error message for UI display */
  public errorMessage = '';
  /** To disable submit button during processing */
  public isSubmitting = false;
  /** Status of password rules used for strength meter */
  public passwordRulesStatus = {
    hasMinLength: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecialChar: false
  };
  //#endregion
  //#region Constructor
  /**
   * @summary Initializes required services.
   * @param formBuilder - Builds reactive forms
   * @param authService - Handles registration and validations
   * @param router - Navigates after success
   */
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }
  //#endregion
  //#region Lifecycle Hook
  /**
   * @summary Initializes the form and subscribes to password changes.
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
   * @param control - Form control
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
   * @summary Only lowercase Gmail addresses allowed.
   * @param control - Form control
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
   * @summary Validates password strength.
   * @param control - Form control
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
   * @summary Ensures password and confirm password match.
   * @param group - Form group
   * @returns ValidationErrors
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
   * @summary Async validator to check if email already exists.
   * @returns AsyncValidatorFunction
   */
  private emailUniqueValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      const email = control.value;
      if (!email) return of(null);
      return of(this.authService.isEmailRegistered(email)).pipe(
        delay(300),
        map(taken => (taken ? { emailTaken: true } : null))
      );
    };
  }
  //#endregion
  //#region Email Lowercase
  /**
   * @summary Forces email input to always be lowercase.
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
   * @summary Updates rules for password strength meter.
   * @param password - user input
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
   * @summary Returns password strength percentage.
   * @returns number (0–100)
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
   * @summary Gets color based on password strength.
   * @returns string - color
   */
  public getPasswordStrengthColor(): string {
    const s = this.getPasswordStrengthPercentage();
    if (s <= 25) return 'red';
    if (s <= 50) return 'orange';
    if (s <= 75) return 'yellowgreen';
    return 'green';
  }
  /**
   * @summary Returns label of password strength.
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
   * @summary Shorthand to access form controls.
   * @returns any
   */
  public get formControls() {
    return this.registerForm.controls;
  }
  /**
   * @summary Resets form + password rules.
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
   * @summary Handles registration form submission.
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
    if (this.authService.isEmailRegistered(email)) {
      this.registerForm.get('email')?.setErrors({ emailTaken: true });
      this.isSubmitting = false;
      return;
    }
    const encryptedPassword = this.authService.encodePassword(password);
    const newUser: User = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: encryptedPassword,
      createdAt: new Date().toISOString()
    };
    this.authService.registerUser(newUser);
    this.successMessage = 'Registration successful! Redirecting...';
    setTimeout(() => this.router.navigate(['/login']), 1200);
    this.isSubmitting = false;
  }
  /**
   * @summary Navigates user back to login page.
   * @returns void
   */
  public goToLogin(): void {
    this.router.navigate(['/login']);
  }
  //#endregion
}
