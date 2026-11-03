
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CustomerAuthService } from '../services/customer-auth';

export const customerAuthGuard: CanActivateFn = (_route, state) => {
  const customerAuthService = inject(CustomerAuthService);
  const router = inject(Router);

  if (customerAuthService.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree(['/login'], {
    queryParams: {
      returnUrl: state.url,
    },
  });
};
