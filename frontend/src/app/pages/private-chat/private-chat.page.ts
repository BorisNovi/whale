import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { distinctUntilChanged, filter, map, merge, Observable, switchMap, tap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ChatComponent } from 'app/components';
import { IMessage, SocketService } from 'app/shared';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'whale-private-chat',
  standalone: true,
  imports: [CommonModule, ChatComponent],
  templateUrl: './private-chat.page.html',
  styleUrl: './private-chat.page.scss'
})
export class PrivateChatPage implements OnInit {
  public chatId = '';

  private socketService = inject(SocketService);
  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute)

  public messagesS = signal<IMessage[] | []>([]);

  public ngOnInit(): void {
    this.route.paramMap
      .pipe(
      map(params => params.get('id')),
      filter((id): id is string => !!id),
      distinctUntilChanged(),
      tap(chatId => {
        this.chatId = chatId;
        this.messagesS.set([]);
        this.socketService.sendMessage('joinPrivateChat', {}, chatId); 
      }),
    switchMap(chatId =>
        merge(
          this.socketService.getMessages(chatId).pipe(map(msgList => msgList.reverse())),
          this.socketService.onMessage('privateMessage').pipe(map(msg => [msg]))
        )
      ),
      takeUntilDestroyed(this.destroyRef)
    )
    .subscribe(newMessages => {
      this.messagesS.update(messages => [...newMessages, ...messages]);
    });
  }

  public sendMessage(message: IMessage): void {
    this.socketService.sendMessage('privateMessage', message, this.chatId);
  }
}
