import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { NotificationService } from '../services';
import { catchError, filter, skip, switchMap, tap, throwError } from 'rxjs';
import { AuthActions, selectUser } from 'app/state';
import { Store } from '@ngrx/store';

let isRefreshing = false;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);
  const store = inject(Store);

  const token = store.selectSignal(selectUser)()?.token;

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token?.accessToken}`,
    },
  });

  return next(authReq).pipe(
    catchError((err) => {
      if (err.status === 401 && !isRefreshing) {
        isRefreshing = true;

        store.dispatch(AuthActions.refreshToken());

        return store.select(selectUser).pipe(
          filter((isComplete) => !!isComplete),
          skip(1),
          switchMap((user) => {
            isRefreshing = false;
            const refreshedReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${user?.token.accessToken}`,
              },
            });
            return next(refreshedReq);
          }),
          catchError((refreshErr) => {
            isRefreshing = false;
            notificationService.showNotification({
              text: 'Authorization error',
              type: 'error',
              closeTimeout: 1500,
            });
            return throwError(() => new Error(refreshErr.message));
          }),
        );
      }
      return throwError(() => err);
    }),
  );
};
