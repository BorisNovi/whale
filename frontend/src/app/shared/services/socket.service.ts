import { Injectable, effect, inject } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Store } from '@ngrx/store';
import { AuthActions, selectUser } from '../../state';
import { Observable, Subject } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { NotificationService } from './notification.service';
import { environment } from '@environments/environment';
import { IMessage } from '..';

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
    // Инициализация сокета при изменении пользователя
    effect(() => {
      const user = this.store.selectSignal(selectUser)();
      if (user) {
        this.initializeSocket(user.token.accessToken);
      } else {
        this.disconnect(); // Отключаем сокет при отсутствии пользователя
      }
    });
  }

  /**
   * Инициализация WebSocket соединения.
   * @param accessToken Токен для аутентификации
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

    // Обработчики стандартных событий
    this.socket.on('connect', () => {
      this.notificationService.showNotification({ text: 'Socket connected', type: 'success', closeTimeout: 1500 });

      // Повторная регистрация событий после реконнекта
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
   * Регистрация события на сокете.
   * @param event Название события
   */
  private registerSocketEvent(event: string): void {
    if (!this.eventSubjects[event]) {
      this.eventSubjects[event] = new Subject<any>();
    }

    if (this.socket) {
      this.socket.on(event, (message: any) => {
        console.log(`Event received: ${event}`, message);
        this.eventSubjects[event].next(message);
      });
    }
  }

  /**
   * Подписка на событие WebSocket.
   * @param event Название события
   * @returns Observable для подписки
   */
  public onMessage(event: string): Observable<any> {
    console.log(this.eventSubjects)
    this.registerSocketEvent(event);
    return this.eventSubjects[event].asObservable();
  }

  /**
   * Отправка сообщения через WebSocket.
   * @param event Название события
   * @param message Данные для отправки
   * @param chatId Идентификатор чата
   */
  public sendMessage(event: string, message: Partial<IMessage>, chatId: string): void {
    if (!this.socket) {
      console.error('Socket is not initialized');
      return;
    }

    this.socket.emit(event, { message, chatId });
  }

  /**
   * Получение сообщений через API.
   * @param count Количество сообщений для получения
   * @returns Observable с массивом сообщений
   */
  public getMessages(count?: number): Observable<IMessage[]> {
    let params = new HttpParams();
    if (count) {
      params = params.set('count', count.toString());
    }

    return this.http.get<IMessage[]>(`${environment.baseUrl}/api/chat/list`, { params });
  }

  /**
   * Отключение WebSocket соединения.
   */
  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('Socket disconnected');
    }
  }
}
