import { CommonModule } from '@angular/common';
import { AfterViewChecked, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, inject, Input, Output, Signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IMessage } from '../../shared';
import { Store } from '@ngrx/store';
import { selectUser } from '../../state';

@Component({
  selector: 'whale-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatComponent implements AfterViewChecked {
  @Input() messagesS!: Signal<IMessage[]>;
  @Output() messageSent = new EventEmitter<IMessage>()

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  public newMessage: string = '';

  private store = inject(Store);
  public currentUser = this.store.selectSignal(selectUser);

  public sendMessage(): void {
    if (this.newMessage.trim()) {
      this.messageSent.emit({ message: this.newMessage })
      this.newMessage = '';
      this.scrollToBottom();
    }
  }

  private scrollToBottom(): void {
    this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
  }

  public ngAfterViewChecked(): void {
    this.scrollToBottom();
  }
}
