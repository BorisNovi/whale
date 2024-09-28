import { inject, Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

import { Store } from '@ngrx/store';
import { selectUser } from '../../state';
import { IMessage, IUserAuth } from '../interfaces';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket | null = null;
  private store = inject(Store);

  constructor() { 
    this.store.select(selectUser).subscribe((user: IUserAuth | null) => {
      const token = user?.token || '';

      if (this.socket) {
        this.socket.disconnect();
      }

      const config = {
        url: 'http://localhost:3000/chat',
        options: {
          query: { token }
        }
      };

      this.socket = io(config.url, config.options);
    });
  }

  public sendMessage(event: string, data: IMessage) {
    const { message } = data;
    this.socket?.emit(event, { message });
  }

  public onMessage(event: string): Observable<IMessage> {
    return new Observable((observer) => {
      this.socket?.on(event, (message: IMessage) => {
        observer.next(message);
      });
    });
  }

  public disconnect() {
    this.socket?.disconnect();
  }
}
