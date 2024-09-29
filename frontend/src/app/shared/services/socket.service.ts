import { inject, Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

import { Store } from '@ngrx/store';
import { selectUser } from '../../state';
import { IMessage, IUserAuth } from '../interfaces';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket | null = null;
  private store = inject(Store);
  private http = inject(HttpClient);

  private baseUrl = `http://localhost:3000`;
  private token = '';

  constructor() { 
    this.store.select(selectUser).subscribe((user: IUserAuth | null) => {
      this.token = user?.token || '';

      if (this.socket) {
        this.socket.disconnect();
      }

      const config = {
        url: `${this.baseUrl}/chat`,
        options: {
          query: { token: this.token }
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

  public getMessages(count?: number): Observable<IMessage[]> {
    let params = new HttpParams({
      fromObject: {
        token: this.token,
        ...(count && { count }),
      }
    });

    return this.http.get<IMessage[]>(`${this.baseUrl}/api/chat/list`, { params });
  }

  public disconnect() {
    this.socket?.disconnect();
  }
}
