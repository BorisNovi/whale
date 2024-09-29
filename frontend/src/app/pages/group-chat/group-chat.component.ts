import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { IMessage, SocketService } from '../../shared';
import { ChatComponent } from '../../components';

@Component({
  selector: 'whale-group-chat',
  standalone: true,
  imports: [ChatComponent],
  templateUrl: './group-chat.component.html',
  styleUrl: './group-chat.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GroupChatComponent implements OnInit {
  private socketService = inject(SocketService);
  private destroyRef = inject(DestroyRef);

  public messagesS = signal<IMessage[]>([]);

  public ngOnInit(): void {
    this.socketService.getMessages()
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(msgList => this.messagesS.update(_ => [...msgList.reverse()]));

    this.socketService.onMessage('message')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(msg => this.messagesS.update(messages => [msg, ...messages]));
  }

  public sendMessage(message: IMessage) {
    this.socketService.sendMessage('message', message);
  }
}
