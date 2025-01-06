import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ChatsService, IChatNotification, SocketService } from '../../shared';
import { ChatsActions } from './chats.actions';
import {
  catchError,
  EMPTY,
  from,
  map,
  merge,
  mergeMap,
  of,
  scan,
  tap,
} from 'rxjs';

@Injectable()
export class ChatsEffects {
  private chatsService = inject(ChatsService);
  private socketService = inject(SocketService);

  private actions$ = inject(Actions);

  loadChats$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChatsActions.loadChats),
      mergeMap(() =>
        this.chatsService.getChats().pipe(
          tap((chat) => console.log('Manual chats update', chat)),
          map((chats) => ChatsActions.loadChatsSuccess({ chats })),
          catchError((error) =>
            of(ChatsActions.loadChatsFailure({ error: error.message })),
          ),
        ),
      ),
    ),
  );

  loadAndListenChats$ = createEffect(() =>
    merge(
      // REST (массив)
      this.chatsService.getChats().pipe(
        mergeMap((chats: IChatNotification[]) => from(chats)), // Массив на отдельные объекты
        catchError((error) => {
          console.error('REST err', error);
          return EMPTY;
        }),
      ),
      // Cокет (объекты)
      this.socketService.onMessage('newChat').pipe(
        catchError((error) => {
          console.error('Socket err:', error);
          return EMPTY;
        }),
      ),
    ).pipe(
      scan((acc: IChatNotification[], msg: IChatNotification) => {
        // Есть ли объект в массиве
        console.log('We got chats', msg);
        if (!acc.some((chat) => chat.chatId === msg.chatId)) {
          return [...acc, msg];
        }
        return acc;
      }, []),
      map((uniqueChats) => ChatsActions.updateChats({ chats: uniqueChats })),
      catchError((error) => {
        console.error('Read chats err', error);
        return EMPTY;
      }),
    ),
  );
}
