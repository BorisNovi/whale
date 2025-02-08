import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AuthService } from '../../shared';
import { AuthActions } from './auth.actions';
import { catchError, map, mergeMap, of, tap } from 'rxjs';

@Injectable()
export class AuthEffects {
  constructor(private authService: AuthService) {}

  private actions$ = inject(Actions);

  logActions$ = createEffect(
    () =>
      this.actions$.pipe(
        tap((action) => console.log('console actions: ', action)),
      ),
    { dispatch: false },
  );

  logIn$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logIn),
      mergeMap(({ username }) =>
        this.authService.logIn(username).pipe(
          map((user) => AuthActions.logInSuccess({ user })),
          catchError((error) => of(AuthActions.logInFailure({ error }))),
        ),
      ),
    ),
  );

  logOut$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logOut),
      mergeMap(() =>
        this.authService.logOut().pipe(
          map((response) => {
            if (response.success) {
              // Found user or not
              return AuthActions.logOutSuccess({ message: response.message });
            } else {
              console.log(response.message);
              return AuthActions.logOutSuccess({ message: response.message });
            }
          }),
          catchError((error) =>
            of(AuthActions.logOutFailure({ error: error.message })),
          ),
        ),
      ),
    ),
  );

  refreshToken$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.refreshToken),
      mergeMap(() =>
        this.authService.refreshToken().pipe(
          map((response) => {
            return AuthActions.refreshTokenSuccess({ token: response });
          }),
          catchError((error) =>
            of(AuthActions.refreshTokenFailure({ error: error.message })),
          ),
        ),
      ),
    ),
  );
}
