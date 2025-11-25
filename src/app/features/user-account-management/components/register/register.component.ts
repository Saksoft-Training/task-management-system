import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  AsyncValidatorFn,
  ReactiveFormsModule
} from '@angular/forms';
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
 
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private userStorage: UserStorageService,
    private router: Router,
    private notificationService: NotificationService
  ) { }
 
  ngOnInit(): void {
    this.initializeForm();
 
    this.registerForm.get('password')?.valueChanges.subscribe(password =>
      this.updatePasswordRulesStatus(password)
    );
  }
 
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
 
  private nameValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      const name = control.value;
      if (!name) return null;
      return /^[A-Za-z\s]+$/.test(name) ? null : { invalidName: true };
    };
  }
 
  private gmailValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      const email = control.value;
      if (!email) return null;
      return /^[a-z0-9._%+-]+@gmail\.com$/.test(email)
        ? null
        : { invalidEmail: true };
    };
  }
 
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
 
  private confirmPasswordValidator() {
    return (group: AbstractControl): ValidationErrors | null => {
      const pass = group.get('password')?.value;
      const confirm = group.get('confirmPassword')?.value;
      return pass && confirm && pass !== confirm
        ? { passwordMismatch: true }
        : null;
    };
  }
 
  private emailUniqueValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      const email = (control.value || '').trim().toLowerCase();
      if (!email) return of(null);
 
      return this.userStorage.isEmailExistsApi(email).pipe(
        map(exists => (exists ? { emailTaken: true } : null))
      );
    };
  }
 
  public forceLowercaseEmail(): void {
    const emailCtrl = this.registerForm.get('email');
    const val = emailCtrl?.value || '';
    emailCtrl?.setValue(val.toLowerCase(), { emitEvent: false });
  }
 
  private updatePasswordRulesStatus(password: string): void {
    this.passwordRulesStatus = {
      hasMinLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[^A-Za-z0-9]/.test(password)
    };
  }
 
  public getPasswordStrengthPercentage(): number {
    let s = 0;
    if (this.passwordRulesStatus.hasMinLength) s += 25;
    if (this.passwordRulesStatus.hasUppercase) s += 25;
    if (this.passwordRulesStatus.hasNumber) s += 25;
    if (this.passwordRulesStatus.hasSpecialChar) s += 25;
    return s;
  }
 
  public getPasswordStrengthClass(): string {
    const s = this.getPasswordStrengthPercentage();
    if (s <= 25) return 'strength-weak';
    if (s <= 50) return 'strength-medium';
    if (s <= 75) return 'strength-strong';
    return 'strength-very-strong';
  }
 
  public getPasswordStrengthLabel(): string {
    const s = this.getPasswordStrengthPercentage();
    if (s <= 25) return 'Weak';
    if (s <= 50) return 'Medium';
    if (s <= 75) return 'Strong';
    return 'Very Strong';
  }
 
  public get formControls() {
    return this.registerForm.controls;
  }
 
  public onReset(): void {
    this.registerForm.reset();
    this.passwordRulesStatus = {
      hasMinLength: false,
      hasUppercase: false,
      hasNumber: false,
      hasSpecialChar: false
    };
  }
 
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
 
  public goToLogin(): void {
    this.router.navigate(['/login']);
  }
}