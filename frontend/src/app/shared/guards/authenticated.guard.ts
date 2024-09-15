import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { take, map } from 'rxjs';
import { selectAuthState } from '../../state';

export const authenticatedGuard: CanActivateFn = (route, state) => {
  const store = inject(Store);
  const router = inject(Router);

  return store.pipe(
    select(selectAuthState),
    take(1),
    map((auth) => {
      if (auth.isAuthenticated) {
        return true;
      } else {
        router.navigate(['/']);
        return false;
      }
    }))
};
