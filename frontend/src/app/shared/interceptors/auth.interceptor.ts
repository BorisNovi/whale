import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService, NotificationService } from '../services';
import { catchError, switchMap, throwError, of } from 'rxjs';
import { AuthActions } from 'app/state';
import { Store } from '@ngrx/store';

let isRefreshing = false;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const notificationService = inject(NotificationService);
  const store = inject(Store);
  const token = authService.getToken();

  let authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token?.accessToken}`,
    },
  });

  return next(authReq).pipe(
    catchError(err => {
      if (err.status === 401 && !isRefreshing) {
        isRefreshing = true;

        return authService.refreshToken().pipe(
          switchMap(newToken => {
            isRefreshing = false;
            const refreshedReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken.accessToken}`,
              },
            });
            return next(refreshedReq);
          }),
          catchError(refreshErr => {
            isRefreshing = false;
            notificationService.showNotification({
              text: 'Authorization error',
              type: 'error',
              closeTimeout: 1500,
            });
            // store.dispatch(AuthActions.logOut());
            return throwError(() => new Error(refreshErr.message));
          })
        );
      }
      return throwError(() => new Error(err));
    })
  );
};
