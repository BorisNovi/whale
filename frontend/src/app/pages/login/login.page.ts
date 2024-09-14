import { Component, DestroyRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService, IUserAuth } from '../../shared';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, of, switchMap } from 'rxjs';
import { Router } from '@angular/router';

import { AuthActions, AuthState, selectAuthState } from '../../state';
import { select, Store } from '@ngrx/store';

@Component({
  selector: 'whale-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss'
})
export class LoginPageComponent {

  public userAuthData: IUserAuth | null = null; // TODO: Add username and token to state manager after all
  public authState$: Observable<AuthState>;

  public loginForm = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(10)])
  });

  constructor(
    private router: Router,
    private store: Store,
    private destroyRef: DestroyRef
  ) {
    this.authState$ = this.store.pipe(select(selectAuthState));

    this.authState$
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe((authData) => {
      if (authData.isAuthenticated && authData.user) {
        this.redirectLoginedUser(authData.user);
      }
    })
  }

  public onSubmit(): void {
    const username = this.loginForm.controls.username.value || '';
    this.store.dispatch(AuthActions.logIn({ username }));
  }

  private redirectLoginedUser(authData: IUserAuth): void {
    this.router.navigate(['/chat/0', { state: authData }]);
  }
}
