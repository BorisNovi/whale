import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ChatsService, IChatNotification, SocketService } from '../../shared';
import { ChatsActions } from './chats.actions';
import { catchError, EMPTY, from, map, merge, mergeMap, scan, tap } from 'rxjs';
import { Store } from '@ngrx/store';

@Injectable()
export class ChatsEffects {
  private chatsService = inject(ChatsService);
  private socketService = inject(SocketService);

  private actions$ = inject(Actions);
  private store = inject(Store);

  loadAndListenChats$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChatsActions.loadChatsRequest), // Триггер на Load Chats
      mergeMap(() =>
        merge(
          // REST (массив)
          this.chatsService.getChats().pipe(
            mergeMap((chats: IChatNotification[]) => {
              // Если чатов нет, чистим стейт, чтобы не показывать юзеру неактуальные чаты
              if (chats.length === 0) {
                this.store.dispatch(ChatsActions.clearAllChats());
                return EMPTY;
              }
              return from(chats);
            }), // Разбиваем массив на отдельные объекты
            catchError((error) => {
              this.store.dispatch(ChatsActions.loadChatsError({ error }));
              return EMPTY;
            }),
          ),
          // Cокет (объекты)
          this.socketService.onMessage('newChat').pipe(
            catchError((error) => {
              this.store.dispatch(ChatsActions.loadChatsError({ error }));
              return EMPTY;
            }),
          ),
        ).pipe(
          scan((acc: IChatNotification[], msg: IChatNotification) => {
            // Проверка на дублирование
            if (!acc.some((chat) => chat.chatId === msg.chatId)) {
              return [...acc, msg];
            }
            return acc;
          }, []),
          map((uniqueChats) => ChatsActions.setChats({ chats: uniqueChats })),
          catchError((error) => {
            console.error('Read chats err', error);
            return EMPTY;
          }),
        ),
      ),
    ),
  );
}
