import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, merge, Observable } from 'rxjs';
import { ChatsService, IMessage, SocketService } from '../../shared';
import { ChatComponent } from '../../components';
import { Router } from '@angular/router';

@Component({
  selector: 'whale-group-chat',
  standalone: true,
  imports: [ChatComponent],
  templateUrl: './group-chat.component.html',
  styleUrl: './group-chat.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupChatComponent implements OnInit {
  private socketService = inject(SocketService);
  private chatsService = inject(ChatsService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);

  public messagesS = signal<IMessage[]>([]);

  public ngOnInit(): void {
    merge(
      this.chatsService
        .getMessages('public')
        .pipe(map((msgList) => msgList.reverse())),
      this.socketService.onMessage('message').pipe(map((msg) => [msg])),
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((newMessages) => {
        this.messagesS.update((messages) => [...newMessages, ...messages]);
      });
  }

  public sendMessage(message: IMessage): void {
    this.socketService.sendMessage('message', message, 'public');
  }

  public redirectToPrivateChat(pivateChatId: string): void {
    this.router.navigate([`chat/${pivateChatId}`]);
  }
}
