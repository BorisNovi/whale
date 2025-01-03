import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { selectAuthState } from '../../state';
import { map, take } from 'rxjs';

export const loginGuard: CanActivateFn = (route, state) => {
  const store = inject(Store);
  const router = inject(Router);

  return store.pipe(
    select(selectAuthState),
    take(1),
    map((auth) => {
      if (!auth.isAuthenticated) {
        return true;
      } else {
        router.navigate(['/group-chat']);
        return false;
      }
    }),
  );
};
