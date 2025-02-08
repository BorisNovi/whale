import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  Input,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterOutlet } from '@angular/router';
import { Store, select } from '@ngrx/store';
import {
  selectAuthState,
  AuthActions,
  AuthState,
  ChatsActions,
} from '../../state';
import { Observable, tap } from 'rxjs';
import { NotificationLineComponent } from '../notification-line/notification-line.component';
import {
  ESSidebarComponent,
  ESSidebarDividerComponent,
  ESSidebarSpacerComponent,
  ESSidebarToggleComponent,
  ESSidebarScrollableComponent,
} from '../sidebar';
import { ESSidebarMenuComponent } from '../sidebar/sidebar-menu/sidebar-menu.component';
import { ESSidebarItemComponent } from '../sidebar/sidebar-item/sidebar-item.component';
import {
  ChatsService,
  IChatNotification,
  IUserAuth,
  SocketService,
  ThemeService,
} from 'app/shared';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';
import { selectChatsState } from 'app/state/chats/chats.selectors';
import { ChatsState } from 'app/state/chats/chats.reducer';

@Component({
  selector: 'whale-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    NotificationLineComponent,
    ESSidebarComponent,
    ESSidebarToggleComponent,
    ESSidebarDividerComponent,
    ESSidebarSpacerComponent,
    ESSidebarScrollableComponent,
    ESSidebarMenuComponent,
    ESSidebarItemComponent,
    IconComponent,
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellComponent implements OnInit {
  public authState$: Observable<AuthState>;
  public chatsState$: Observable<ChatsState>;
  public user: IUserAuth | null = null;
  public isAuthentificated = false;

  public privateChatData = signal<IChatNotification[]>([]);

  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  private store = inject(Store);

  public themeService = inject(ThemeService);
  public chatsService = inject(ChatsService);
  public socketService = inject(SocketService);

  // @Input() color: 'default' | 'primary' | 'secondary';
  // @Input() width: number;
  // @Input() maxWidth: number;
  // @Input() minWidth: number;
  @Input() isOpen = false;
  // @Input() behavior: 'click' | 'hover';
  // @Input() exclusive: boolean;
  // @Input() disabled: boolean;

  constructor() {
    this.authState$ = this.store.pipe(select(selectAuthState));
    this.chatsState$ = this.store.pipe(select(selectChatsState));

    this.authState$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((authData) => {
        this.user = authData.user;
        this.isAuthentificated = authData.isAuthenticated;

        if (!authData.isAuthenticated) {
          this.router.navigate(['/sign-in']);
        }
      });
  }

  public ngOnInit(): void {
    this.store.dispatch(ChatsActions.loadChatsRequest());

    this.store
      .pipe(select(selectChatsState))
      .pipe(
        tap((chat) => console.log('Chats:', chat)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((chatsState) => {
        this.privateChatData.set(chatsState.chats);
      });

    // merge(
    //   this.chatsService
    //     .getChats()
    //     .pipe(mergeMap((chats: IChatNotification[]) => from(chats))),
    //   this.socketService
    //     .onMessage('newChat')
    //     .pipe(tap((chats) => console.log('Chat by ws in shell:', chats))),
    // )
    //   .pipe(
    //     tap((chats) => console.log(chats)),
    //     catchError((err) => {
    //       console.error('WebSocket error:', err);
    //       return EMPTY;
    //     }),
    //     scan((acc: IChatNotification[], msg: IChatNotification) => {
    //       if (!acc.some((chat) => chat.chatId === msg.chatId)) {
    //         return [...acc, msg];
    //       }
    //       return acc;
    //     }, []),
    //     tap((chats) => console.log(chats)),
    //     takeUntilDestroyed(this.destroyRef),
    //   )
    //   .subscribe((uniqueChats) => {
    //     this.privateChatData.set(uniqueChats);
    //   });
  }

  public redirectToGlobalChat(): void {
    this.router.navigate(['group-chat']);
  }

  public redirectToPrivateChat(privateChatId: string): void {
    this.router.navigate([`chat/${privateChatId}`]);
  }

  public logout(): void {
    this.store.dispatch(AuthActions.logOut());
  }
}
