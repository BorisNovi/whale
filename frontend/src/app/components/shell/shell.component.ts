import { ChangeDetectionStrategy, Component, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterOutlet } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { selectAuthState, AuthActions, AuthState } from '../../state';
import { Observable } from 'rxjs';
import { NotificationLineComponent } from '../notification-line/notification-line.component';

@Component({
  selector: 'whale-shell',
  standalone: true,
  imports: [RouterOutlet, NotificationLineComponent],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShellComponent {
  public authState$: Observable<AuthState>;
  public isAuthentificated = false;

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
        this.router.navigate(['/']);
      }
    })
  }


  public logout(): void {
    this.store.dispatch(AuthActions.logOut())
  }

}
