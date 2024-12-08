import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { INewChatNotification, SocketService } from 'app/shared';
import { RippleDirective } from 'app/shared/directives';
import { catchError, EMPTY, tap, scan } from 'rxjs';

@Component({
  selector: 'whale-items-line',
  standalone: true,
  imports: [RippleDirective],
  templateUrl: './items-line.component.html',
  styleUrl: './items-line.component.scss'
})
export class ItemsLineComponent implements OnInit {
  public privateChatData = signal<INewChatNotification[]>([]);

  private socketService = inject(SocketService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);

  public ngOnInit(): void {
    this.socketService.onMessage('newPrivateMessage')
      .pipe(
        tap(console.log),
        catchError(err => {
          console.error('WebSocket error:', err);
          return EMPTY;
        }),
        scan((acc: INewChatNotification[], msg: INewChatNotification) => {
          if (!acc.some(chat => chat.chatId === msg.chatId)) {
            return [...acc, msg];
          }
          return acc;
        }, []),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(uniqueChats => {
        this.privateChatData.set(uniqueChats);
      });
  }

  public redirectToPrivateChat(privateChatId: string): void {
    this.router.navigate([`chat/${privateChatId}`]);
  }
}
