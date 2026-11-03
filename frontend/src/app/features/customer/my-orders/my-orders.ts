
import {
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { OrderService } from '../../../core/services/order';
import { LanguageService } from '../../../core/services/language';
import {
  Order,
  OrderStatus,
} from '../../../core/models/order.model';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './my-orders.html',
  styleUrl: './my-orders.scss',
})
export class MyOrders implements OnInit {
  private readonly orderService = inject(OrderService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly languageService = inject(LanguageService);

  protected readonly orders = signal<Order[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal('');

  ngOnInit(): void {
    this.loadOrders();
  }

  protected loadOrders(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.orderService
      .getMyOrders()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (orders) => {
          this.orders.set(orders);
          this.isLoading.set(false);
        },
        error: () => {
          this.errorMessage.set(
            this.translate(
              'Unable to load your orders. Please try again.',
              'تعذر تحميل طلباتك. حاول مرة تانية.',
            ),
          );
          this.isLoading.set(false);
        },
      });
  }

  protected translate(en: string, ar: string): string {
    return this.languageService.currentLanguage() === 'ar'
      ? ar
      : en;
  }

  protected getStatusLabel(status: OrderStatus): string {
    const labels: Record<OrderStatus, [string, string]> = {
      PENDING: ['Pending', 'قيد الانتظار'],
      ACCEPTED: ['Accepted', 'تم قبول الطلب'],
      PREPARING: ['Preparing', 'جاري التحضير'],
      READY: ['Ready', 'جاهز'],
      DELIVERED: ['Delivered', 'تم التوصيل'],
      CANCELLED: ['Cancelled', 'ملغي'],
    };

    const [en, ar] = labels[status];

    return this.translate(en, ar);
  }

  protected getProductName(
    product: Order['items'][number]['product'],
  ): string {
    if (
      this.languageService.currentLanguage() === 'ar' &&
      product.nameAr
    ) {
      return product.nameAr;
    }

    return product.name;
  }

  protected formatPrice(price: number | string): string {
    const amount = Number(price);

    if (!Number.isFinite(amount)) {
      return '—';
    }

    return new Intl.NumberFormat(
      this.languageService.currentLanguage() === 'ar'
        ? 'ar-EG'
        : 'en-EG',
      {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    ).format(amount);
  }

  protected formatDate(date: string): string {
    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
      return '—';
    }

    return new Intl.DateTimeFormat(
      this.languageService.currentLanguage() === 'ar'
        ? 'ar-EG'
        : 'en-EG',
      {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      },
    ).format(value);
  }
}
