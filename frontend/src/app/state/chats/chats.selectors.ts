import { createSelector, createFeatureSelector } from '@ngrx/store';
import { ChatsState } from './chats.reducer';

export const selectChatsState = createFeatureSelector<ChatsState>('chats');

export const selectChats = createSelector(
  selectChatsState,
  (state) => state.chats,
);

export const selectChatsLoading = createSelector(
  selectChatsState,
  (state) => state.loading,
);

export const selectChatsError = createSelector(
  selectChatsState,
  (state) => state.error,
);
