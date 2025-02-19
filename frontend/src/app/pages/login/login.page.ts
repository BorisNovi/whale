import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  signal,
  WritableSignal,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { IUserAuth } from '../../shared';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

import { AuthActions, AuthState, selectAuthState } from '../../state';
import { select, Store } from '@ngrx/store';
import { RippleDirective } from 'app/shared/directives';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'whale-login',
  standalone: true,
  imports: [ReactiveFormsModule, RippleDirective, CommonModule],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPageComponent {
  public userAuthData: IUserAuth | null = null;
  public authState$: Observable<AuthState>;
  public authErrorS: WritableSignal<HttpErrorResponse | null> = signal(null);

  public loginForm = new FormGroup({
    username: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(10),
    ]),
  });

  constructor(
    private router: Router,
    private store: Store,
    private destroyRef: DestroyRef,
  ) {
    this.authState$ = this.store.pipe(select(selectAuthState));

    this.authState$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((authData) => {
        if (authData.isAuthenticated && authData.user) {
          this.redirectLoginedUser();
        }

        if (authData.error) {
          this.authErrorS.set(authData.error);
        }
      });

    this.loginForm.controls['username'].valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.authErrorS.set(null));
  }

  public onSubmit(): void {
    const username = this.loginForm.controls.username.value || '';
    this.store.dispatch(AuthActions.logIn({ username }));
  }

  private redirectLoginedUser(): void {
    this.router.navigate(['/group-chat']);
  }
}
