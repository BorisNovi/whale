import { Injectable, effect, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectUser } from '../../state';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '@environments/environment';
import { IChatNotification, IMessage } from '..';

@Injectable({
  providedIn: 'root',
})
export class ChatsService {
  private store = inject(Store);
  private http = inject(HttpClient);

  constructor() {
    // Initialize the socket connection when the user changes
    effect(() => {
      const user = this.store.selectSignal(selectUser)();
      // if (user) {
      //   this.initializeSocket(user.token.accessToken);
      // } else {
      //   this.disconnect(); // Disconnect the socket if the user is not available
      // }
    });
  }

  /**
   * Retrieve messages via API.
   * @param chatId Id of chat which messages we want to get
   * @param count Number of messages to retrieve
   * @returns Observable with an array of messages
   */
  public getMessages(chatId: string, count?: number): Observable<IMessage[]> {
    let params = new HttpParams();
    params = params.set('chatId', chatId);

    if (count) {
      params = params.set('count', count.toString());
    }

    return this.http.get<IMessage[]>(
      `${environment.baseUrl}/api/chat/messages`,
      { params },
    );
  }

  /**
   * Retrieve chats via API.
   * @returns Observable with an array of chats
   */
  public getChats(): Observable<IChatNotification[]> {
    const user = this.store.selectSignal(selectUser)();
    let params = new HttpParams();
    params = params.set('userId', user?.userId || '');

    return this.http.get<IChatNotification[]>(
      `${environment.baseUrl}/api/chat/chats`,
      { params },
    );
  }
}
