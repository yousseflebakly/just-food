
import { Routes } from '@angular/router';

import { Dashboard } from './pages/admin/dashboard/dashboard';
import { Login } from './pages/admin/login/login';
import { Orders } from './pages/admin/orders/orders';
import { Products } from './pages/admin/products/products';
import { AdminLayout } from './layouts/admin-layout/admin-layout';

import { adminAuthGuard } from './core/guards/admin-auth-guard';
import { customerAuthGuard } from './core/guards/customer-auth-guard';

export const routes: Routes = [
  {
    path: 'admin/login',
    component: Login,
  },
  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [adminAuthGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      {
        path: 'dashboard',
        component: Dashboard,
      },
      {
        path: 'orders',
        component: Orders,
      },
      {
        path: 'products',
        component: Products,
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./pages/admin/categories/categories').then(
            (m) => m.Categories
          ),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./pages/admin/settings/settings').then(
            (m) => m.Settings
          ),
      },
    ],
  },
  {
    path: '',
    loadComponent: () =>
      import('./layouts/customer-layout/customer-layout').then(
        (m) => m.CustomerLayout
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/customer/home/home').then(
            (m) => m.Home
          ),
      },
      {
        path: 'menu',
        loadComponent: () =>
          import('./features/customer/menu/menu').then(
            (m) => m.Menu
          ),
      },
      {
        path: 'cart',
        loadComponent: () =>
          import('./features/customer/cart/cart').then(
            (m) => m.Cart
          ),
      },
      {
        path: 'checkout',
        canActivate: [customerAuthGuard],
        loadComponent: () =>
          import('./features/customer/checkout/checkout').then(
            (m) => m.Checkout
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/customer/profile/profile').then(
            (m) => m.Profile
          ),
      },
      {
        path: 'my-orders',
        canActivate: [customerAuthGuard],
        loadComponent: () =>
          import('./features/customer/my-orders/my-orders').then(
            (m) => m.MyOrders
          ),
      },
      {
        path: 'login',
        loadComponent: () =>
          import('./features/customer/login/login').then(
            (m) => m.Login
          ),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/customer/register/register').then(
            (m) => m.Register
          ),
      },
    ],
  },
];
