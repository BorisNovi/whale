import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { authReducer, AuthState, localStorageMetaReducer } from './auth';
import { isDevMode } from '@angular/core';
import { chatsReducer, ChatsState } from './chats/chats.reducer';

export interface AppState {
  auth: AuthState;
  chats: ChatsState;
}

export const reducers: ActionReducerMap<AppState> = {
  auth: authReducer,
  chats: chatsReducer,
};

// export const metaReducers: MetaReducer<AppState>[] = isDevMode() ? [] : [localStorageMetaReducer];

export const metaReducers: MetaReducer<AppState>[] = [localStorageMetaReducer];
