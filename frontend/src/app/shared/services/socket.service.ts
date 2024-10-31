import { effect, inject, Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

import { Store } from '@ngrx/store';
import { selectUser } from '../../state';
import { IMessage, IUserAuth } from '../interfaces';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '@environments/environment';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket | null = null;
  private store = inject(Store);
  private http = inject(HttpClient);
  private notificationService = inject(NotificationService);

  constructor() { 
    effect(() => {
      const user = this.store.selectSignal(selectUser)();

      console.log('in socket service', user)
      
      if (user) {
        this.initializeSocket(user.token.accessToken);
      }
    });
  }

  private initializeSocket(accessToken: string): void {
    if (this.socket) {
      this.socket.disconnect();
    }

    const config = {
      url: `${environment.baseUrl}/chat`,
      options: {
        query: {
          Authorization: accessToken
        }
      }
    };

    this.socket = io(config.url, config.options);
  
    this.socket.on('connect', () => {
      this.notificationService.showNotification({ text: 'Socket connected', type: 'success', closeTimeout: 1500 });
    });

    this.socket.on('disconnect', () => {
      this.notificationService.showNotification({ text: 'Socket disconnected', type: 'info', closeTimeout: 1500 });
    });
  }

  public sendMessage(event: string, data: IMessage): void {
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
        ...(count && { count }),
      }
    });

    return this.http.get<IMessage[]>(`${environment.baseUrl}/api/chat/list`, { params });
  }

  public disconnect(): void {
    this.socket?.disconnect();
  }
}
