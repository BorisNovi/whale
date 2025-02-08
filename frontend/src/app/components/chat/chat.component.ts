import { CommonModule } from '@angular/common';
import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  Output,
  Signal,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IMessage } from '../../shared';
import { Store } from '@ngrx/store';
import { selectUser } from '../../state';
import { RippleDirective } from 'app/shared/directives/ripple.directive';

@Component({
  selector: 'whale-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, RippleDirective],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatComponent implements AfterViewChecked {
  @Input() messagesS!: Signal<IMessage[]>;
  @Output() messageSent = new EventEmitter<IMessage>();
  @Output() userClicked = new EventEmitter<string>();

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  public newMessage = '';

  private store = inject(Store);
  public currentUser = this.store.selectSignal(selectUser);

  public sendMessage(): void {
    if (this.newMessage.trim()) {
      this.messageSent.emit({
        text: this.newMessage,
        userId: this.currentUser()?.userId ?? '',
      });
      this.newMessage = '';
      this.scrollToBottom();
    }
  }

  public onUsernameClick(userId: string): void {
    const currentUser = this.currentUser();
    if (currentUser?.userId === userId) return;
    this.userClicked.emit(`${this.currentUser()?.userId}:${userId}`);
  }

  private scrollToBottom(): void {
    this.messagesContainer.nativeElement.scrollTop =
      this.messagesContainer.nativeElement.scrollHeight;
  }

  public ngAfterViewChecked(): void {
    this.scrollToBottom();
  }
}
