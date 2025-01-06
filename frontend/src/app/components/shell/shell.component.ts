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
import {
  catchError,
  EMPTY,
  from,
  map,
  merge,
  mergeMap,
  Observable,
  pipe,
  scan,
  tap,
} from 'rxjs';
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
import { selectChats, selectChatsState } from 'app/state/chats/chats.selectors';
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
    this.chatsState$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((chatsState) => {
        this.privateChatData.set(chatsState.chats);
      });
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
