import {
  localizedProductName,
  localizedProductDescription,
  localizedCategory,
} from '../../../core/services/product-localization';

import { LanguageService } from '../../../core/services/language';

import {
  Component,
  inject,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';

import { CartService } from '../../../core/services/cart';
import { ProductsService } from '../../../core/services/products';

interface MenuProduct {
  id: number;
  name: string;
  nameAr?: string | null;
  description: string;
  descriptionAr?: string | null;
  price: number;
  image: string;
  category: string;
}

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [],
  templateUrl: './menu.html',
  styleUrl: './menu.scss',
})
export class Menu implements OnInit {
  readonly localizedProductName = localizedProductName;
  readonly localizedProductDescription = localizedProductDescription;
  readonly localizedCategory = localizedCategory;

  readonly languageService = inject(LanguageService);
  private readonly cartService = inject(CartService);
  private readonly productsService = inject(ProductsService);
  private readonly cdr = inject(ChangeDetectorRef);

  products: MenuProduct[] = [];
  searchTerm = '';
  isLoading = true;
  errorMessage = '';

  get filteredProducts(): MenuProduct[] {
    const query = this.normalizeSearch(this.searchTerm);

    if (!query) {
      return this.products;
    }

    return this.products.filter((product) => {
      const searchableText = [
        product.name,
        product.nameAr,
        product.description,
        product.descriptionAr,
        product.category,
        localizedCategory(product.category, 'ar'),
        localizedCategory(product.category, 'en'),
      ]
        .filter((value): value is string => typeof value === 'string')
        .join(' ');

      return this.normalizeSearch(searchableText).includes(query);
    });
  }

  ngOnInit(): void {
    this.productsService.getProducts().subscribe({
      next: (products) => {
        this.products = products.map((product) => ({
          id: product.id,
          name: product.name,
          nameAr: product.nameAr,
          description: product.description,
          descriptionAr: product.descriptionAr,
          price: Number(product.price),
          image: this.getImageUrl(product.image),
          category: product.category,
        }));

        this.isLoading = false;
        this.cdr.markForCheck();
      },

      error: (error) => {
        console.error('Failed to load products:', error);

        this.errorMessage = 'menu.error';
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value;
  }

  private normalizeSearch(value: string): string {
    return value
      .toLocaleLowerCase()
      .normalize('NFKC')
      .replace(/[\u064B-\u065F\u0670]/g, '')
      .replace(/\u0640/g, '')
      .replace(/[أإآٱ]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ة/g, 'ه')
      .trim();
  }

  // Resolve uploaded image URLs.
  private getImageUrl(image: string): string {
    if (!image) {
      return '';
    }

    // Keep existing external image URLs unchanged.
    if (
      image.startsWith('http://') ||
      image.startsWith('https://') ||
      image.startsWith('data:')
    ) {
      return image;
    }

    // Images uploaded to the NestJS backend.
    if (image.startsWith('/uploads/')) {
      return image;
    }

    // Keep existing frontend image paths unchanged.
    return image;
  }

  addToCart(product: MenuProduct): void {
    this.cartService.addToCart(product);
  }
}