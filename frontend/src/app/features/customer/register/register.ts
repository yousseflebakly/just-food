
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { CustomerAuthService } from '../../../core/services/customer-auth';
import { LanguageService } from '../../../core/services/language';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  readonly authService = inject(CustomerAuthService);
  readonly languageService = inject(LanguageService);

  readonly isSubmitting = signal(false);
  readonly errorMessage = signal('');
  readonly showPassword = signal(false);
  readonly showConfirmPassword = signal(false);

  readonly form = this.fb.nonNullable.group({
    fullName: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100),
      ],
    ],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: [
      '',
      [Validators.pattern(/^01[0125][0-9]{8}$/)],
    ],
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(128),
      ],
    ],
    confirmPassword: ['', [Validators.required]],
  });

  get isArabic(): boolean {
    return this.languageService.currentLanguage() === 'ar';
  }

  translate(english: string, arabic: string): string {
    return this.isArabic ? arabic : english;
  }

  togglePassword(): void {
    this.showPassword.update((value) => !value);
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.update((value) => !value);
  }

  get passwordsMatch(): boolean {
    return (
      this.form.controls.password.value ===
      this.form.controls.confirmPassword.value
    );
  }

  onSubmit(): void {
    if (this.isSubmitting()) {
      return;
    }

    if (this.form.invalid || !this.passwordsMatch) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const { fullName, email, phoneNumber, password } =
      this.form.getRawValue();

    this.authService
      .register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        ...(phoneNumber.trim()
          ? { phoneNumber: phoneNumber.trim() }
          : {}),
      })
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.router.navigateByUrl('/profile');
        },
        error: (error: HttpErrorResponse) => {
          this.isSubmitting.set(false);

          if (error.status === 409) {
            this.errorMessage.set(
              this.translate(
                'This email is already registered. Please sign in.',
                'البريد الإلكتروني ده مسجل بالفعل. سجل دخولك.',
              ),
            );
            return;
          }

          if (error.status === 400) {
            this.errorMessage.set(
              this.translate(
                'Please check your information and try again.',
                'راجع بياناتك وحاول مرة تانية.',
              ),
            );
            return;
          }

          this.errorMessage.set(
            this.translate(
              'Something went wrong. Please try again.',
              'حصل خطأ، حاول مرة تانية.',
            ),
          );
        },
      });
  }
}
