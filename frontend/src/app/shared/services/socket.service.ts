import { Injectable, inject } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Store } from '@ngrx/store';
import { AuthActions, selectUser } from '../../state';
import { distinctUntilChanged, map, Observable, Subject } from 'rxjs';
import { NotificationService } from './notification.service';
import { environment } from '@environments/environment';
import { IMessage } from '..';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: Socket | null = null;
  private eventSubjects: Record<string, Subject<any>> = {};

  private store = inject(Store);
  private notificationService = inject(NotificationService);

  private isSocketInitialized = false;

  constructor() {
    this.store
      .select(selectUser)
      .pipe(
        map((user) => user?.token.accessToken),
        distinctUntilChanged(),
      )
      .subscribe((accessToken) => {
        if (accessToken) {
          // If socket not init
          if (!this.isSocketInitialized) {
            this.initializeSocket(accessToken);
            this.isSocketInitialized = true;
            console.log('Socket initialized with token:', accessToken);
          } else if (this.socket) {
            // If socket already init, update token without reinit
            this.updateSocketToken(accessToken);
            console.log('Socket token updated:', accessToken);
          }
        } else {
          // If token is empty, disconnect (user logged out)
          this.disconnect();
        }
      });
  }

  private updateSocketToken(accessToken: string): void {
    if (this.socket) {
      this.socket.auth = { token: accessToken };

      this.socket.disconnect();
      this.socket.connect();
      console.log('Socket token updated:', accessToken);
    }
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
      options: {
        auth: { token: accessToken },
      },
    };

    this.socket = io(config.url, config.options);

    // Standard event handlers
    this.socket.on('connect', () => {
      this.notificationService.showNotification({
        text: 'Socket connected',
        type: 'success',
        closeTimeout: 1500,
      });

      // Re-register events after reconnect
      Object.keys(this.eventSubjects).forEach((event) =>
        this.registerSocketEvent(event),
      );
    });

    this.socket.on('disconnect', () => {
      this.notificationService.showNotification({
        text: 'Socket disconnected',
        type: 'info',
        closeTimeout: 1500,
      });
    });

    this.socket.on('error', (error) => {
      this.notificationService.showNotification({
        text: error.message,
        type: 'error',
        closeTimeout: 1500,
      });
      if (error.error.code === 401) {
        this.store.dispatch(AuthActions.refreshToken());
      }
    });
  }

  // socket.on('error', (err) => {
  //   if (err.message === 'Токен недействителен') {
  //     refreshAuthToken().then((newToken) => {
  //       socket.auth = { token: newToken };
  //       socket.connect();
  //     }).catch(() => {
  //
  //     });
  //   }
  // });

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
  public sendMessage(
    event: string,
    message: Partial<IMessage>,
    chatId: string,
  ): void {
    if (!this.socket) {
      console.error('Socket is not initialized');
      return;
    }

    this.socket.emit(event, { message, chatId });
  }

  /**
   * Clear subscriptions
   */
  private clearSubscriptions(): void {
    Object.keys(this.eventSubjects).forEach((event) => {
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
      this.isSocketInitialized = false;
    }
  }
}
