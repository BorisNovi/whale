import { ChangeDetectionStrategy, Component, DestroyRef, inject, Input, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterOutlet } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { selectAuthState, AuthActions, AuthState } from '../../state';
import { catchError, EMPTY, Observable, scan, tap } from 'rxjs';
import { NotificationLineComponent } from '../notification-line/notification-line.component';
import { ESSidebarComponent, ESSidebarDividerComponent, ESSidebarSpacerComponent, ESSidebarToggleComponent, ESSidebarScrollableComponent } from '../sidebar';
import { ESSidebarMenuComponent } from '../sidebar/sidebar-menu/sidebar-menu.component';
import { ESSidebarItemComponent } from '../sidebar/sidebar-item/sidebar-item.component';
import { IconChevronLineW300Component, IconCogLineW500Component, IconGlobalLineW500Component, IconMailLineW500Component } from 'app/shared/icon-components';
import { IChatNotification, IUserAuth, SocketService } from 'app/shared';

@Component({
  selector: 'whale-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    NotificationLineComponent,
    ESSidebarComponent,
    ESSidebarToggleComponent,
    ESSidebarDividerComponent,
    ESSidebarSpacerComponent,
    ESSidebarScrollableComponent,
    ESSidebarMenuComponent,
    ESSidebarItemComponent,
    IconChevronLineW300Component,
    IconMailLineW500Component,
    IconGlobalLineW500Component,
    IconCogLineW500Component
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShellComponent implements OnInit {
  public authState$: Observable<AuthState>;
  public user: IUserAuth | null = null;
  public isAuthentificated = false;

  public privateChatData = signal<IChatNotification[]>([]);

  private socketService = inject(SocketService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  private store = inject(Store);
  

  // @Input() color: 'default' | 'primary' | 'secondary';
  // @Input() width: number;
  // @Input() maxWidth: number;
  // @Input() minWidth: number;
  @Input() isOpen: boolean = false;
  // @Input() behavior: 'click' | 'hover';
  // @Input() exclusive: boolean;
  // @Input() disabled: boolean;

  constructor() {
    this.authState$ = this.store.pipe(select(selectAuthState));

    this.authState$
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe((authData) => {
      this.user = authData.user;
      this.isAuthentificated = authData.isAuthenticated;

      if (!authData.isAuthenticated) {
        this.router.navigate(['/sign-in']);
      }
    })
  }

  public ngOnInit(): void {
    this.socketService.getChats(this.user?.userId || '')
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe((chats) => console.log(chats));

    this.socketService.onMessage('newPrivateMessage')
      .pipe(
        tap(console.log),
        catchError(err => {
          console.error('WebSocket error:', err);
          return EMPTY;
        }),
        scan((acc: IChatNotification[], msg: IChatNotification) => {
          if (!acc.some(chat => chat.chatId === msg.chatId)) {
            return [...acc, msg];
          }
          return acc;
        }, []),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(uniqueChats => {
        this.privateChatData.set(uniqueChats);
      });
  }

  public redirectToGlobalChat(): void {
    this.router.navigate(['group-chat']);
  }

  public redirectToPrivateChat(privateChatId: string): void {
    this.router.navigate([`chat/${privateChatId}`]);
  }

  public logout(): void {
    this.store.dispatch(AuthActions.logOut())
  }
}
