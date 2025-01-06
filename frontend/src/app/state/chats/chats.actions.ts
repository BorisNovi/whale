import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { IChatNotification } from '../../shared';

export const ChatsActions = createActionGroup({
  source: 'Chats',
  events: {
    'Load Chats': emptyProps(),
    'Load Chats Success': props<{ chats: IChatNotification[] }>(),
    'Load Chats Failure': props<{ error: string }>(),
    'Update Chats': props<{ chats: IChatNotification[] }>(),
  },
});
