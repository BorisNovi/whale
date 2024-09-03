import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FirstTestsService } from '../../shared/services/first-tests.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'whale-chat-room',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-room.page.html',
  styleUrl: './chat-room.page.scss'
})
export class ChatRoomPage implements OnInit {
  public chatId = '';
  public data$?: Observable<{ id: number, value: string }>;

  constructor(private route: ActivatedRoute, private ft: FirstTestsService) {}

  public ngOnInit(): void {
    this.chatId = this.route.snapshot.paramMap.get('id') || '';

    this.data$ = this.ft.getTest({ id: 0, key: 'abc' });
  }

}
