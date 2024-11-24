import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
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

  public messagesS = signal<IMessage[]>([]);

  public ngOnInit(): void {
    this.chatId = this.route.snapshot.paramMap.get('id') || '';

    // this.socketService.getMessages()
    // .pipe(takeUntilDestroyed(this.destroyRef))
    // .subscribe(msgList => this.messagesS.update(_ => [...msgList.reverse()]));

    // this.socketService.onMessage('message')
    //   .pipe(takeUntilDestroyed(this.destroyRef))
    //   .subscribe(msg => this.messagesS.update(messages => [msg, ...messages]));
  }

  public sendMessage(message: IMessage) {
    this.socketService.sendMessage('message', message);
  }

}
