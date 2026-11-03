
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { LanguageService } from '../../../core/services/language';
import { CustomerAuthService } from '../../../core/services/customer-auth';

interface ProfileMenuItem {
  id: string;
  icon: string;
  labelEn: string;
  labelAr: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {
  protected readonly languageService = inject(LanguageService);

  protected readonly customerAuthService = inject(CustomerAuthService);

  private readonly router = inject(Router);

  protected readonly accountItems: ProfileMenuItem[] = [
    {
      id: 'personal-info',
      icon: '👤',
      labelEn: 'Personal Information',
      labelAr: 'المعلومات الشخصية',
    },
    {
      id: 'addresses',
      icon: '📍',
      labelEn: 'Saved Addresses',
      labelAr: 'العناوين المحفوظة',
    },
    {
      id: 'orders',
      icon: '🛍️',
      labelEn: 'My Orders',
      labelAr: 'طلباتي',
    },
    {
      id: 'favorites',
      icon: '❤️',
      labelEn: 'Favorite Orders',
      labelAr: 'الطلبات المفضلة',
    },
  ];

  protected readonly supportItems: ProfileMenuItem[] = [
    {
      id: 'help',
      icon: '🎧',
      labelEn: 'Help & Support',
      labelAr: 'المساعدة والدعم',
    },
    {
      id: 'faq',
      icon: '❓',
      labelEn: 'FAQs',
      labelAr: 'الأسئلة الشائعة',
    },
    {
      id: 'privacy',
      icon: '🔒',
      labelEn: 'Privacy Policy',
      labelAr: 'سياسة الخصوصية',
    },
    {
      id: 'share',
      icon: '🔗',
      labelEn: 'Share with Friends',
      labelAr: 'شارك مع الأصدقاء',
    },
    {
      id: 'rate',
      icon: '⭐',
      labelEn: 'Rate the App',
      labelAr: 'قيّم التطبيق',
    },
    {
      id: 'about',
      icon: 'ℹ️',
      labelEn: 'About the App',
      labelAr: 'عن التطبيق',
    },
  ];

  protected get isLoggedIn(): boolean {
    return this.customerAuthService.isLoggedIn();
  }

  protected get customer() {
    return this.customerAuthService.customer();
  }

  protected get customerName(): string {
    return this.customer?.fullName ?? '';
  }

  protected get customerEmail(): string {
    return this.customer?.email ?? '';
  }

  protected get customerPhone(): string {
    return this.customer?.phoneNumber || '';
  }

  protected logout(): void {
    this.customerAuthService.logout();
    void this.router.navigateByUrl('/login');
  }

  protected translate(en: string, ar: string): string {
    return this.languageService.currentLanguage() === 'ar'
      ? ar
      : en;
  }

  protected itemLabel(item: ProfileMenuItem): string {
    return this.translate(item.labelEn, item.labelAr);
  }

  // Handle profile menu navigation.
  protected onMenuItemClick(item: ProfileMenuItem): void {
    switch (item.id) {
      case 'orders':
        void this.router.navigateByUrl('/my-orders');
        break;

      default:
        // Other profile features will be implemented later.
        break;
    }
  }
}
