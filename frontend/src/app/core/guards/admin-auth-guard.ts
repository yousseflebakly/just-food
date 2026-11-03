import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminAuthGuard: CanActivateFn = () => {
  const router = inject(Router);

  const token = sessionStorage.getItem('admin_token');

  if (!token) {
    return router.createUrlTree(['/admin/login']);
  }

  return true;
};