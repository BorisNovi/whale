import { Injectable, effect, inject } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Store } from '@ngrx/store';
import { AuthActions, selectUser } from '../../state';
import { Observable, Subject } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { NotificationService } from './notification.service';
import { environment } from '@environments/environment';
import { IChatNotification, IMessage } from '..';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket | null = null;
  private eventSubjects: Record<string, Subject<any>> = {};

  private store = inject(Store);
  private http = inject(HttpClient);
  private notificationService = inject(NotificationService);

  constructor() {
    // Initialize the socket connection when the user changes
    effect(() => {
      const user = this.store.selectSignal(selectUser)();
      if (user) {
        this.initializeSocket(user.token.accessToken);
      } else {
        this.disconnect(); // Disconnect the socket if the user is not available
      }
    });
  }

  /**
   * Initialize the WebSocket connection.
   * @param accessToken Authentication token
   */
  public initializeSocket(accessToken: string): void {
    if (this.socket) {
      console.warn('Socket already initialized');
      return;
    }

    const config = {
      url: `${environment.baseUrl}/chat`,
      options: { query: { Authorization: accessToken }}
    };

    this.socket = io(config.url, config.options);

    // Standard event handlers
    this.socket.on('connect', () => {
      this.notificationService.showNotification({ text: 'Socket connected', type: 'success', closeTimeout: 1500 });

      // Re-register events after reconnect
      Object.keys(this.eventSubjects).forEach((event) => this.registerSocketEvent(event));
    });

    this.socket.on('disconnect', () => {
      this.notificationService.showNotification({ text: 'Socket disconnected', type: 'info', closeTimeout: 1500 });
    });

    this.socket.on('error', (error) => {
      this.notificationService.showNotification({ text: error.message, type: 'error', closeTimeout: 1500 });
      if (error.error.code === 401) {
        this.store.dispatch(AuthActions.refreshToken());
      }
    });
  }

  /**
   * Register an event on the socket.
   * @param event Event name
   */
  private registerSocketEvent(event: string): void {
    if (!this.eventSubjects[event]) {
      this.eventSubjects[event] = new Subject<any>();
    }
  
    if (this.socket && this.socket.listeners(event).length === 0) {
      this.socket.on(event, (message: any) => {
        console.log(`Event received: ${event}`, message);
        this.eventSubjects[event].next(message);
      });
    }
  }

  /**
   * Subscribe to a WebSocket event.
   * @param event Event name
   * @returns Observable for subscription
   */
  public onMessage(event: string): Observable<any> {
    this.registerSocketEvent(event);
    return this.eventSubjects[event].asObservable();
  }

  /**
   * Send a message via WebSocket.
   * @param event Event name
   * @param message Data to send
   * @param chatId Chat identifier
   */
  public sendMessage(event: string, message: Partial<IMessage>, chatId: string): void {
    if (!this.socket) {
      console.error('Socket is not initialized');
      return;
    }

    this.socket.emit(event, { message, chatId });
  }

  /**
   * Retrieve messages via API.
   * @param chatId Id of chat which messages we ant to get
   * @param count Number of messages to retrieve
   * @returns Observable with an array of messages
   */
  public getMessages(chatId: string, count?: number): Observable<IMessage[]> {
    let params = new HttpParams();
    params = params.set('chatId', chatId);

    if (count) {
      params = params.set('count', count.toString());
    }

    return this.http.get<IMessage[]>(`${environment.baseUrl}/api/chat/messages`, { params });
  }

  public getChats(userId: string): Observable<IChatNotification[]> {
    let params = new HttpParams();
    params = params.set('userId', userId);

    return this.http.get<IChatNotification[]>(`${environment.baseUrl}/api/chat/chats`, { params });
  }

  /**
   * Clear subscriptions
   */
  private clearSubscriptions(): void {
    Object.keys(this.eventSubjects).forEach((event) => {
      console.log(`Clearing subscription for event: ${event}`);
      
      if (this.socket) {
        this.socket.off(event);
      }
      this.eventSubjects[event].complete();
      delete this.eventSubjects[event];
    });
  }

  /**
   * Disconnect the WebSocket connection.
   */
  public disconnect(): void {
    this.clearSubscriptions();

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('Socket disconnected');
    }
  }
}
