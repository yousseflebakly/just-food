
import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  RestaurantSettings,
  RestaurantSettingsService,
  UpdateRestaurantSettings,
} from '../../../core/services/restaurant-settings';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings implements OnInit {
  private readonly settingsService = inject(RestaurantSettingsService);
  private readonly cdr = inject(ChangeDetectorRef);

  isLoading = true;
  isSaving = false;

  errorMessage = '';
  successMessage = '';

  readonly deliveryFeeOptions: number[] = Array.from(
    { length: 11 },
    (_, index) => index * 5,
  );

  settings: UpdateRestaurantSettings = this.getDefaultSettings();

  private savedSettings: UpdateRestaurantSettings =
    this.getDefaultSettings();

  ngOnInit(): void {
    this.loadSettings();
  }

  private getDefaultSettings(): UpdateRestaurantSettings {
    return {
      name: '',
      description: '',
      logo: '',
      phone: '',
      address: '',
      openingTime: '10:00',
      closingTime: '23:00',
      deliveryFee: 0,
      isOpen: true,
    };
  }

  private mapSettings(
    data: RestaurantSettings,
  ): UpdateRestaurantSettings {
    return {
      name: data.name,
      description: data.description,
      logo: data.logo,
      phone: data.phone,
      address: data.address,
      openingTime: data.openingTime,
      closingTime: data.closingTime,
      deliveryFee: Number(data.deliveryFee),
      isOpen: data.isOpen,
    };
  }

  loadSettings(): void {
    if (this.isSaving) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.settingsService.getSettings().subscribe({
      next: (data) => {
        const loadedSettings = this.mapSettings(data);

        this.savedSettings = { ...loadedSettings };
        this.settings = { ...loadedSettings };

        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage =
          'Failed to load restaurant settings.';

        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  resetChanges(): void {
    if (this.isSaving || this.isLoading) return;

    this.settings = { ...this.savedSettings };

    this.errorMessage = '';
    this.successMessage = '';

    this.cdr.markForCheck();
  }

  saveSettings(): void {
    if (this.isSaving || this.isLoading) return;

    this.errorMessage = '';
    this.successMessage = '';

    const name = this.settings.name.trim();
    const deliveryFee = Number(this.settings.deliveryFee);

    if (!name || name.length > 100) {
      this.errorMessage =
        'Restaurant name must be between 1 and 100 characters.';
      this.cdr.markForCheck();
      return;
    }

    if (
      !Number.isFinite(deliveryFee) ||
      !this.deliveryFeeOptions.includes(deliveryFee)
    ) {
      this.errorMessage =
        'Please select a delivery fee between 0 and 50 EGP.';
      this.cdr.markForCheck();
      return;
    }

    const payload: UpdateRestaurantSettings = {
      ...this.settings,
      name,
      deliveryFee,
    };

    this.isSaving = true;

    this.settingsService.updateSettings(payload).subscribe({
      next: (data) => {
        const updatedSettings = this.mapSettings(data);

        this.savedSettings = { ...updatedSettings };
        this.settings = { ...updatedSettings };

        this.isSaving = false;
        this.successMessage =
          'Restaurant settings saved successfully!';

        this.cdr.markForCheck();
      },
      error: (error) => {
        this.isSaving = false;

        this.errorMessage =
          error.status === 401
            ? 'Your session has expired. Please sign in again.'
            : 'Failed to save restaurant settings. Please try again.';

        this.cdr.markForCheck();
      },
    });
  }
}
