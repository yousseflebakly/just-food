
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
} from '@angular/core';

import { RouterLink, RouterOutlet } from '@angular/router';

import { CartService } from '../../core/services/cart';

import { CustomerAuthService } from '../../core/services/customer-auth';

import { RestaurantSettingsService } from '../../core/services/restaurant-settings';

import { LanguageService } from '../../core/services/language';

@Component({
  selector: 'app-customer-layout',
  standalone: true,
  imports: [RouterLink, RouterOutlet],
  templateUrl: './customer-layout.html',
  styleUrl: './customer-layout.scss',
})
export class CustomerLayout implements OnInit {
  readonly cartService = inject(CartService);

  readonly customerAuthService = inject(CustomerAuthService);

  readonly languageService = inject(LanguageService);

  private readonly restaurantSettingsService = inject(
    RestaurantSettingsService,
  );

  private readonly cdr = inject(ChangeDetectorRef);

  restaurantName = 'Just Food';
  restaurantLogo = '';

  ngOnInit(): void {
    this.loadRestaurantSettings();
  }

  loadRestaurantSettings(): void {
    this.restaurantSettingsService.getSettings().subscribe({
      next: (settings) => {
        this.restaurantName = settings.name || 'Just Food';
        this.restaurantLogo = settings.logo || '';

        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error(
          'Failed to load restaurant settings:',
          error,
        );

        // Keep default branding if the API is unavailable.
        this.restaurantName = 'Just Food';
        this.restaurantLogo = '';

        this.cdr.markForCheck();
      },
    });
  }

  onLanguageChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const language = select.value;

    if (language === 'en' || language === 'ar') {
      this.languageService.setLanguage(language);
    }
  }
}
