import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { IChatNotification } from '../../shared';

export const ChatsActions = createActionGroup({
  source: 'Chats',
  events: {
    'Load Chats Request': emptyProps(),
    'Load Chats Error': props<{ error: string }>(),
    'Set Chats': props<{ chats: IChatNotification[] }>(),
    'Clear All Chats': emptyProps(),
  },
});
