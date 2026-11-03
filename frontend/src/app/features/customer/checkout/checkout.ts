import { localizedProductName } from '../../../core/services/product-localization';
import { LanguageService } from '../../../core/services/language';

import {
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';

import { ReactiveFormsModule } from '@angular/forms';
import {
  FormBuilder,
  Validators,
} from '@angular/forms';

import { finalize } from 'rxjs';

import { CartService } from '../../../core/services/cart';
import { OrderService } from '../../../core/services/order';
import { CreateOrderRequest } from '../../../core/models/order.model';

import { RestaurantSettingsService } from '../../../core/services/restaurant-settings';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss',
})
export class Checkout implements OnInit {
  readonly localizedProductName = localizedProductName;

  readonly languageService = inject(LanguageService);
  private readonly orderService = inject(OrderService);
  private readonly restaurantSettingsService = inject(
    RestaurantSettingsService,
  );
  private readonly fb = inject(FormBuilder);

  readonly cartService = inject(CartService);

  readonly isSubmitting = signal(false);
  readonly isLoadingSettings = signal(true);

  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  readonly deliveryFee = signal(0);
  readonly isRestaurantOpen = signal(false);

  readonly subtotal = computed(() =>
    this.cartService.items().reduce(
      (total, item) =>
        total + Number(item.product.price) * item.quantity,
      0,
    ),
  );

  readonly totalPrice = computed(
    () => this.subtotal() + this.deliveryFee(),
  );

  checkoutForm = this.fb.nonNullable.group({
    fullName: [
      '',
      [Validators.required, Validators.minLength(3)],
    ],

    phoneNumber: [
      '',
      [
        Validators.required,
        Validators.pattern(/^01[0125][0-9]{8}$/),
      ],
    ],

    address: [
      '',
      [Validators.required, Validators.minLength(10)],
    ],

    notes: [''],
  });

  ngOnInit(): void {
    this.loadRestaurantSettings();
  }

  loadRestaurantSettings(): void {
    this.isLoadingSettings.set(true);
    this.errorMessage.set('');

    this.restaurantSettingsService.getSettings().subscribe({
      next: (settings) => {
        this.deliveryFee.set(Number(settings.deliveryFee));
        this.isRestaurantOpen.set(settings.isOpen);
        this.isLoadingSettings.set(false);
      },

      error: () => {
        this.isLoadingSettings.set(false);
        this.isRestaurantOpen.set(false);
        this.errorMessage.set(
          'checkout.settingsError',
        );
      },
    });
  }

  onSubmit(): void {
    if (this.isSubmitting() || this.isLoadingSettings()) {
      return;
    }

    if (!this.isRestaurantOpen()) {
      this.errorMessage.set(
        'checkout.closedError',
      );
      return;
    }

    if (this.cartService.items().length === 0) {
      this.errorMessage.set('checkout.cartError');
      return;
    }

    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    const formData = this.checkoutForm.getRawValue();

    const orderData: CreateOrderRequest = {
      fullName: formData.fullName,
      phoneNumber: formData.phoneNumber,
      address: formData.address,
      notes: formData.notes,

      items: this.cartService.items().map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
    };

    this.errorMessage.set('');
    this.successMessage.set('');
    this.isSubmitting.set(true);

    this.orderService
      .createOrder(orderData)
      .pipe(
        finalize(() => {
          this.isSubmitting.set(false);
        }),
      )
      .subscribe({
        next: (order) => {
          console.log('Order created:', order);

          this.cartService.clearCart();
          this.checkoutForm.reset();

          this.successMessage.set(
            'checkout.success',
          );
        },

        error: (error) => {
          const backendMessage = error?.error?.message;

          if (
            error.status === 400 &&
            typeof backendMessage === 'string' &&
            backendMessage.toLowerCase().includes('closed')
          ) {
            this.isRestaurantOpen.set(false);
            this.errorMessage.set(
              'checkout.closedError',
            );
            return;
          }

          if (error.status === 400) {
            this.errorMessage.set(
              'checkout.orderError',
            );
            return;
          }

          this.errorMessage.set(
            'checkout.retryError',
          );
        },
      });
  }
}
