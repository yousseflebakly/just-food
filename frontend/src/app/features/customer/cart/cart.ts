
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { localizedProductName } from '../../../core/services/product-localization';
import { LanguageService } from '../../../core/services/language';
import { CartService } from '../../../core/services/cart';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
})
export class Cart {
  readonly localizedProductName = localizedProductName;

  readonly languageService = inject(LanguageService);
  readonly cartService = inject(CartService);

  removeAllItems(): void {
    if (this.cartService.items().length === 0) {
      return;
    }

    const isArabic =
      this.languageService.currentLanguage() === 'ar';

    const confirmationMessage = isArabic
      ? 'هل أنت متأكد إنك عايز تمسح كل المنتجات من السلة؟'
      : 'Are you sure you want to remove all items from your cart?';

    const confirmed = window.confirm(confirmationMessage);

    if (!confirmed) {
      return;
    }

    this.cartService.clearCart();
  }
}
