import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { authReducer, AuthState, localStorageMetaReducer } from './auth';
import { isDevMode } from '@angular/core';

export interface AppState {
  auth: AuthState;
  // groupChat: GroupChatState
}

export const reducers: ActionReducerMap<AppState> = {
  auth: authReducer,
  // groupChat: groupChatReducer
};

// export const metaReducers: MetaReducer<AppState>[] = isDevMode() ? [] : [localStorageMetaReducer];

export const metaReducers: MetaReducer<AppState>[] = [localStorageMetaReducer];
