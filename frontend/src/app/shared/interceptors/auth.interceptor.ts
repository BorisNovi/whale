import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService, NotificationService } from '../services';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const notificationService = inject(NotificationService);
  const token = authService.getToken();

  let authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token?.accessToken}`,
    },
  });

  return next(authReq).pipe(
    catchError(err => {
      if (err.status === 401) {
        return authService.refreshToken().pipe(
          switchMap(newToken => {
            const refreshedReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken.accessToken}`,
              },
            });
            return next(refreshedReq);
          }),
          catchError(refreshErr => {
            notificationService.showNotification({ text: 'Autorization error', type: 'error', closeTimeout: 1500 });
            authService.logOut();
            return throwError(() => new Error(refreshErr.message));
          })
        );
      }
      return throwError(() => new Error(err));
    })
  );
};
