import { createReducer, on } from '@ngrx/store';
import { ChatsActions } from './chats.actions';
import { IChatNotification } from '../../shared';

export interface ChatsState {
  chats: IChatNotification[];
  loading: boolean;
  error: string | null;
}

export const initialChatsState: ChatsState = {
  chats: [],
  loading: false,
  error: null,
};

export const chatsReducer = createReducer(
  initialChatsState,
  on(ChatsActions.loadChats, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(ChatsActions.loadChatsSuccess, (state, { chats }) => ({
    ...state,
    chats,
    loading: false,
    error: null,
  })),
  on(ChatsActions.loadChatsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  on(ChatsActions.updateChats, (state, { chats }) => ({
    ...state,
    chats,
  })),
);
