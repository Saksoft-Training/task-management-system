import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, AsyncValidatorFn, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth-service';
import { User } from '../../../contracts/user.interface';
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
   * @summary Initializes the component with necessary services.
   * @param formBuilder - Used to build reactive forms.
   * @param authService - Service for authentcation operations.
   * @param router - Router service to navigate after registration.
   */
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }
  //#endregion
  //#region Lifecycle Hooks
  /**
   * @summary Angular lifecycle hook called on component initialization.
              Initializes the registration form and subscribes to password value changes.
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
   * @summary Initializes the reactive registration form with validation rules.
   * @returns void
   */
  private initializeForm(): void {
    this.registerForm = this.formBuilder.group(
      {
        name: ['', [Validators.required, Validators.minLength(3), this.nameValidator()]],
        email: ['', [Validators.required, this.gmailValidator()], [this.emailUniqueValidator()]],
        password: ['', [Validators.required, this.passwordStrengthValidator()]],
        confirmPassword: ['', [Validators.required]]
      },
      { validators: this.confirmPasswordValidator() }
    );
  }
  //#endregion
  //#region Validators
  /**
   * @summary Validates that the name contains only letters and spaces.
   * @returns A validator function for FormControl.
   */
  private nameValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      const name = control.value;
      if (!name) return null;
      return /^[A-Za-z\s]+$/.test(name) ? null : { invalidName: true };
    };
  }
  /**
   * @summary Validates that the email is valid Gmail address.
   * @returns A validator function for FormControl.
   */
  private gmailValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      const email = control.value;
      if (!email) return null;
      return /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email)
        ? null
        : { invalidEmail: true };
    };
  }
  /**
   * @summary Validates password strength rules.
   * @returns A validator function for FormControl.
   */
  private passwordStrengthValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.value || '';
      if (!password) return null;
      const isValid =
        password.length >= 8 &&
        /[A-Z]/.test(password) &&
        /[0-9]/.test(password) &&
        /[^A-Za-z0-9]/.test(password);
      return isValid ? null : { weakPassword: true };
    };
  }
  /** 
   * @summary Validates that confirm password matches the password.
   * @param group - FormGroup containing password and cofirmPassword.
   * @returns Error object if password mismatch.
  */
  private confirmPasswordValidator() {
    return (group: AbstractControl): ValidationErrors | null => {
      const password = group.get('password')?.value;
      const confirm = group.get('confirmPassword')?.value;
      if (password && confirm && password !== confirm) {
        group.get('confirmPassword')?.setErrors({ passwordMismatch: true });
        return { passwordMismatch: true };
      }
      return null;
    };
  }
  /** 
   * @summary Asynchronous validator to check if email is already registered.
   * @returns Async validator returning emailTaken if exists.
   */
  private emailUniqueValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      const email = control.value;
      if (!email) return of(null);
      return of(this.authService.isEmailRegistered(email)).pipe(
        delay(400),
        map(isTaken => (isTaken ? { emailTaken: true } : null))
      );
    };
  }
  //#endregion
  //#region Password Rules Logic
  /** 
   * @summary Updates the dynamic passowrd rule status for meter display.
   * @param Current password input.
   * @returns void
  */
  private updatePasswordRulesStatus(password: string): void {
    this.passwordRulesStatus = {
      hasMinLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[^A-Za-z0-9]/.test(password)
    };
  }
  /** 
   * @summary Calculates password strength as percentage(0-100).
   * @returns Password strength percentage.
   */
  public getPasswordStrengthPercentage(): number {
    let strength = 0;
    if (this.passwordRulesStatus.hasMinLength) strength += 25;
    if (this.passwordRulesStatus.hasUppercase) strength += 25;
    if (this.passwordRulesStatus.hasNumber) strength += 25;
    if (this.passwordRulesStatus.hasSpecialChar) strength += 25;
    return strength;
  }
  /** 
   * @summary Determines color for password strength meter.
   * @returns Color representing password strength.
  */
  public getPasswordStrengthColor(): string {
    const strength = this.getPasswordStrengthPercentage();
    if (strength <= 25) return 'red';
    else if (strength <= 50) return 'orange';
    else if (strength <= 75) return 'yellowgreen';
    else return 'green';
  }
  /** 
   * @summary Returns label for password strength.
   * @returns Password strength label: Weak,Medium,Strong,very strong.
  */
  public getPasswordStrengthLabel(): string {
    const strength = this.getPasswordStrengthPercentage();
    if (strength <= 25) return 'Weak';
    else if (strength <= 50) return 'Medium';
    else if (strength <= 75) return 'Strong';
    else return 'Very Strong';
  }
  //#endregion
  //#region Form Helpers
  /** 
   * @summary Shortcut to access form controls in template.
   * @returns Form controls object.
  */
  public get formControls() {
    return this.registerForm.controls;
  }
  /** 
   * @summary Resets the form and password rules.
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
   * @summary Handles the registration form submission.
   * @returns void
  */
  public onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.isSubmitting = true;
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.isSubmitting = false;
      return;
    }
    const { name, email, password } = this.registerForm.value;
    if (this.authService.isEmailRegistered(email)) {
      this.errorMessage = 'Email is already registered.';
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
    this.successMessage = 'Registration successful! Redirecting to login...';
    setTimeout(() => this.router.navigate(['/login']), 1000);
    this.isSubmitting = false;
  }
  //#endregion
}
