import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AuthService } from '../../shared';
import { AuthActions } from './auth.actions';
import { catchError, map, mergeMap, of, tap } from 'rxjs';

@Injectable()
export class AuthEffects {
  constructor(private authService: AuthService) {}

  private actions$ = inject(Actions);

  logActions$ = createEffect(() =>
    this.actions$.pipe(
      tap(action => console.log(action))
  ), { dispatch: false });

  logIn$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logIn),
      mergeMap(({ username }) =>
        this.authService.logIn(username).pipe(
          map((user) => AuthActions.logInSuccess({ user })),
          catchError((error) => of(AuthActions.logInFailure({ error: error.message })))
        )
      )
    )
  );

  logOut$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logOut),
      mergeMap(({ username }) =>
        this.authService.logOut(username).pipe(
          map((response) => {
            if (response.success) {
              return AuthActions.logOutSuccess({ message: response.message });
            } else {
              return AuthActions.logOutFailure({ error: response.message });
            }
          }),
          catchError((error) => of(AuthActions.logOutFailure({ error: error.message })))
        )
      )
    )
  );
}
