import { createReducer, on } from '@ngrx/store';
import { AuthActions } from './auth.actions';
import { IUserAuth } from '../../shared';
import { HttpErrorResponse } from '@angular/common/http';

export interface AuthState {
  user: IUserAuth | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: HttpErrorResponse | null;
}

export const initialAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// TODO: заменить localstorage на сервис, который проверяет, браузер ли наша платформа.
export const hydratedAuthState: AuthState =
  JSON.parse(localStorage.getItem('auth') || 'null') || initialAuthState;

export const authReducer = createReducer(
  hydratedAuthState,
  on(AuthActions.logIn, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(AuthActions.logInSuccess, (state, { user }) => ({
    ...state,
    user,
    isAuthenticated: true,
    loading: false,
    error: null,
  })),
  on(AuthActions.logInFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  on(AuthActions.logOut, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(AuthActions.logOutSuccess, (state, { message }) => ({
    ...state,
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  })),
  on(AuthActions.logOutFailure, (state, { error }) => ({
    ...state,
    isAuthenticated: false,
    loading: false,
    error,
  })),
  on(AuthActions.refreshToken, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(AuthActions.refreshTokenSuccess, (state, { token }) => ({
    ...state,
    user: {
      username: state.user!.username,
      userId: state.user!.userId,
      token,
    },
    loading: false,
    error: null,
  })),
  on(AuthActions.refreshTokenFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
);
