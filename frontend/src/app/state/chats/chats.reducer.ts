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
  on(ChatsActions.loadChatsRequest, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(ChatsActions.loadChatsError, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  on(ChatsActions.setChats, (state, { chats }) => ({
    ...state,
    loading: false,
    error: null,
    chats,
  })),
  on(ChatsActions.clearAllChats, (state) => ({
    ...state,
    loading: false,
    chats: [],
    error: null,
  })),
);
