import { Component, DestroyRef, inject, Input, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { INewChatNotification, SocketService } from 'app/shared';
import { RippleDirective } from 'app/shared/directives';

// XXX: Компонент временный
@Component({
  selector: 'whale-items-line',
  standalone: true,
  imports: [RippleDirective],
  templateUrl: './items-line.component.html',
  styleUrl: './items-line.component.scss'
})
export class ItemsLineComponent implements OnInit {
  public prvateChatData = signal<INewChatNotification[]>([]);

  private socketService = inject(SocketService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);

  public ngOnInit(): void {
    this.socketService.onMessage('newPrivateMessage')
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(msg => {
        const { chatId, username } = msg;
        this.prvateChatData.update(currentData => [...currentData, { chatId, username }]);
      });
  }

  public redirectToPrivateChat(pivateChatId: string): void {
    this.router.navigate([`chat/${pivateChatId}`]);
  }
}
