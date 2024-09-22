import { Component, DestroyRef, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectUser } from '../../state';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { Socket as s } from 'ngx-socket-io';
import { IMessage, SocketService } from '../../shared';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'whale-group-chat',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
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

  public sendMessage() {
    const messageControl = this.messageForm.controls['message'];
    const message = messageControl.value || '';
    const msg = {
      username: 'test username', // After all take username from back with message;
      message
    }
    this.socketService.sendMessage('message', msg);
    messageControl.setValue(null);
  }
}
