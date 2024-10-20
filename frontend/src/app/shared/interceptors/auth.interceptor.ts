import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
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
            authService.logOut();
            return throwError(() => new Error(refreshErr));
          })
        );
      }
      return throwError(() => new Error(err));
    })
  );
};
