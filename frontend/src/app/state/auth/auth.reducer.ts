import { ActionReducerMap, createReducer, on } from '@ngrx/store';
import { AuthActions } from './auth.actions';
import { IUserAuth } from '../../shared';

export interface AuthState {
  user: IUserAuth | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};


// TODO: заменить localstorage на сервис, который проверяет, браузер ли наша платформа.
export const hydratedAuthState: AuthState = JSON.parse(localStorage.getItem('auth') || 'null') || initialState;

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
  }))
);
