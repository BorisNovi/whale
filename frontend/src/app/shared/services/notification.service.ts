import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { INotificationLine } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notificationSubject = new BehaviorSubject<INotificationLine | null>(
    null,
  );
  public notification$ = this.notificationSubject.asObservable();

  public showNotification(data: INotificationLine): void {
    this.notificationSubject.next(data);
  }
}
