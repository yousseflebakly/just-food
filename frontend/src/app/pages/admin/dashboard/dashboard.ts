import { ChangeDetectorRef, Component, OnInit, inject, } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminOrdersService, AdminOrder, OrderStatus } from '../../../core/services/admin-orders';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private ordersService = inject(AdminOrdersService);
  private cdr = inject(ChangeDetectorRef);

  orders: AdminOrder[] = [];
  isLoading = true;
  errorMessage = '';
  updatingOrderId: number | null = null;
  statusErrorMessage = '';
  statusSuccessMessage = '';


  ngOnInit(): void {
    this.loadOrders();
  }
  loadOrders(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.ordersService.getOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.isLoading = false;

        this.errorMessage =
          error.status === 401
            ? 'Your session has expired. Please sign in again.'
            : 'Failed to load orders. Please try again.';

        this.cdr.markForCheck();
      },
    });
  }

  get totalOrders(): number {
    return this.orders.length;
  }

  get pendingOrders(): number {
    return this.orders.filter((order) => order.status === 'PENDING').length;
  }

  get totalRevenue(): number {
    return this.orders
      .filter((order) => order.status === 'DELIVERED')
      .reduce((total, order) => total + Number(order.totalPrice), 0);
  }

  get recentOrders(): AdminOrder[] {
    return this.orders.slice(0, 5);
  }

  getNextStatus(status: string): OrderStatus | null {
    const transitions: Partial<Record<OrderStatus, OrderStatus>> = {
      PENDING: 'ACCEPTED',
      ACCEPTED: 'PREPARING',
      PREPARING: 'READY',
      READY: 'DELIVERED',
    };

    return transitions[status as OrderStatus] ?? null;
  }

  getStatusButtonLabel(status: string): string {
    const labels: Partial<Record<OrderStatus, string>> = {
      PENDING: 'Accept Order',
      ACCEPTED: 'Start Preparing',
      PREPARING: 'Mark Ready',
      READY: 'Mark Delivered',
    };

    return labels[status as OrderStatus] ?? '';
  }

  updateStatus(order: AdminOrder): void {
    const nextStatus = this.getNextStatus(order.status);

    if (!nextStatus || this.updatingOrderId !== null) {
      return;
    }

    this.updatingOrderId = order.id;
    this.statusErrorMessage = '';
    this.statusSuccessMessage = '';

    this.ordersService.updateOrderStatus(order.id, nextStatus).subscribe({
      next: () => {
        this.updatingOrderId = null;
        this.statusSuccessMessage = `Order #${order.id} updated successfully to ${nextStatus}.`;

        this.loadOrders();
      },
      error: (error) => {
        this.updatingOrderId = null;

        this.statusErrorMessage =
          error.status === 401
            ? 'Session expired. Please sign in again.'
            : 'Failed to update order status. Please try again.';

        this.cdr.markForCheck();
      },
    });
  }
  
cancelOrder(order: AdminOrder): void {
  if (
    !['PENDING', 'ACCEPTED', 'PREPARING'].includes(order.status) ||
    this.updatingOrderId !== null
  ) {
    return;
  }

  const confirmed = window.confirm(
    `Are you sure you want to cancel Order #${order.id}?`
  );

  if (!confirmed) {
    return;
  }

  this.updatingOrderId = order.id;
  this.statusErrorMessage = '';
  this.statusSuccessMessage = '';

  this.ordersService.updateOrderStatus(order.id, 'CANCELLED').subscribe({
    next: () => {
      this.updatingOrderId = null;
      this.statusSuccessMessage =
        `Order #${order.id} cancelled successfully.`;
      this.loadOrders();
    },
    error: (error) => {
      this.updatingOrderId = null;
      this.statusErrorMessage =
        error.status === 401
          ? 'Session expired. Please sign in again.'
          : 'Failed to cancel order. Please try again.';

      this.cdr.markForCheck();
    },
  });
}

}
