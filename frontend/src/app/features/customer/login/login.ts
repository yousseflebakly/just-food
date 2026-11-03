
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { CustomerAuthService } from '../../../core/services/customer-auth';
import { LanguageService } from '../../../core/services/language';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly authService = inject(CustomerAuthService);
  readonly languageService = inject(LanguageService);

  readonly isSubmitting = signal(false);
  readonly errorMessage = signal('');
  readonly showPassword = signal(false);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
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

  private getReturnUrl(): string {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

    // Only allow internal customer routes.
    // Prevent external redirects and admin routes.
    if (
      !returnUrl ||
      !returnUrl.startsWith('/') ||
      returnUrl.startsWith('//') ||
      returnUrl.startsWith('/\\') ||
      /^\/admin(?:\/|$|\?|#)/i.test(returnUrl)
    ) {
      return '/profile';
    }

    return returnUrl;
  }

  onSubmit(): void {
    if (this.isSubmitting()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    this.authService.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.isSubmitting.set(false);

        const returnUrl = this.getReturnUrl();

        void this.router.navigateByUrl(returnUrl);
      },
      error: (error: HttpErrorResponse) => {
        this.isSubmitting.set(false);

        if (error.status === 401) {
          this.errorMessage.set(
            this.translate(
              'Invalid email or password.',
              'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
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
