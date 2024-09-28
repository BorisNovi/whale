import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { IMessage, SocketService } from '../../shared';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChatComponent } from '../../components';

@Component({
  selector: 'whale-group-chat',
  standalone: true,
  imports: [ChatComponent],
  templateUrl: './group-chat.component.html',
  styleUrl: './group-chat.component.scss'
})
export class GroupChatComponent {
  private socketService = inject(SocketService);
  public messages: IMessage[] = [];

  public messageForm = new FormGroup({
    message: new FormControl('', [Validators.required])
  });

  constructor(private destroyRef: DestroyRef) {
    this.socketService.onMessage('message')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(msg => this.messages.push(msg));
  }

  public sendMessage(message: IMessage) {
    const messageControl = this.messageForm.controls['message'];
    // const message = messageControl.value || '';

    this.socketService.sendMessage('message', message );
    messageControl.setValue(null);
  }
}
