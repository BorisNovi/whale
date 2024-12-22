import { ChangeDetectionStrategy, Component, DestroyRef, Input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterOutlet } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { selectAuthState, AuthActions, AuthState } from '../../state';
import { Observable } from 'rxjs';
import { NotificationLineComponent } from '../notification-line/notification-line.component';
import { RippleDirective } from 'app/shared/directives';
import { ItemsLineComponent } from '../items-line/items-line.component';
import { ESSidebarComponent, ESSidebarDividerComponent, ESSidebarSpacerComponent, ESSidebarToggleComponent, ESSidebarScrollableComponent } from '../sidebar';

@Component({
  selector: 'whale-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    NotificationLineComponent,
    RippleDirective,
    ItemsLineComponent,
    ESSidebarComponent,
    ESSidebarToggleComponent,
    ESSidebarDividerComponent,
    ESSidebarSpacerComponent,
    ESSidebarScrollableComponent
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShellComponent {
  public authState$: Observable<AuthState>;
  public isAuthentificated = false;
  

  // @Input() color: 'default' | 'primary' | 'secondary';
  // @Input() width: number;
  // @Input() maxWidth: number;
  // @Input() minWidth: number;
  @Input() isOpen: boolean = false;
  // @Input() behavior: 'click' | 'hover';
  // @Input() exclusive: boolean;
  // @Input() disabled: boolean;

  constructor(
    private router: Router,
    private store: Store,
    private destroyRef: DestroyRef
  ) {
    this.authState$ = this.store.pipe(select(selectAuthState));

    this.authState$
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe((authData) => {
      this.isAuthentificated = authData.isAuthenticated;

      if (!authData.isAuthenticated) {
        this.router.navigate(['/sign-in']);
      }
    })
  }


  public logout(): void {
    this.store.dispatch(AuthActions.logOut())
  }

}
