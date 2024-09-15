import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AuthService } from '../../shared';
import { AuthActions } from './auth.actions';
import { catchError, map, mergeMap, of, tap, withLatestFrom } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectUser } from './auth.selectors';

@Injectable()
export class AuthEffects {
  constructor(private authService: AuthService) {}

  private actions$ = inject(Actions);
  private store = inject(Store);

  logActions$ = createEffect(() =>
    this.actions$.pipe(
      tap(action => console.log('console actions: ', action))
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

  // TODO: в дальнейшем добавить передачу в запросе токена, чтобы нельзя было логаутить других юзеров с других аккаунтов
  logOut$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logOut),
      withLatestFrom(this.store.select(selectUser)),
      mergeMap(([action, user]) =>
        this.authService.logOut(user?.username || '').pipe(
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
