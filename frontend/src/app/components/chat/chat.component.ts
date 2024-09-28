import { CommonModule } from '@angular/common';
import { AfterViewChecked, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IMessage } from '../../shared';

@Component({
  selector: 'whale-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent implements AfterViewChecked {
  @Input() messages!: IMessage[]; // TODO: добавить использование сигналов для обмена между компонентами
  @Output() messageSent = new EventEmitter<IMessage>()
  public newMessage: string = '';

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

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
