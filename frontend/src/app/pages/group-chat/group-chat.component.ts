import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { IMessage, SocketService } from '../../shared';
import { ChatComponent } from '../../components';
import { Router } from '@angular/router';

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
  private router = inject(Router);

  public messagesS = signal<IMessage[]>([]);

  public ngOnInit(): void {
    this.socketService.getMessages('public')
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(msgList => this.messagesS.update(_ => [...msgList.reverse()]));

    this.socketService.onMessage('message')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(msg => this.messagesS.update(messages => [msg, ...messages]));
  }

  public sendMessage(message: IMessage): void {
    this.socketService.sendMessage('message', message, 'public');
  }

  public redirectToPrivateChat(pivateChatId: string): void {
    this.router.navigate([`chat/${pivateChatId}`]);
  }
}
