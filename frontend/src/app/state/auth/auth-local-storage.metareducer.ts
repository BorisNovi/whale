import { ActionReducer } from '@ngrx/store';
import { AppState } from '../app.reducer';
import { AuthActions } from './auth.actions';

export function localStorageMetaReducer(reducer: ActionReducer<AppState>): ActionReducer<AppState> {
  return (state, action) => {
    const nextState = reducer(state, action);

    // TODO: заменить localstorage на сервис, который проверяет, браузер ли наша платформа.
    if (action.type === AuthActions.logInSuccess.type) {
      localStorage.setItem('auth', JSON.stringify(nextState.auth));
    }

    if (action.type === AuthActions.logOutSuccess.type) {
      localStorage.removeItem('auth');
    }

    return nextState;
  };
}
