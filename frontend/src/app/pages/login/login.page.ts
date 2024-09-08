import { Component, DestroyRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService, IUserAuth } from '../../shared';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { of, switchMap } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'whale-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss'
})
export class LoginPageComponent {

  public userAuthData: IUserAuth | null = null; // TODO: Add username and token to state manager after all

  public loginForm = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(10)])
  });

  constructor(
    private authService: AuthService,
    private router: Router,
    private destroyRef: DestroyRef
  ) {}

  public onSubmit(): void {
    const username = this.loginForm.controls.username.value || '';

    this.authService.logIn(username)
    .pipe(switchMap((userAuthData) => {
      this.userAuthData = userAuthData; // TODO: Add data to state here and redirect
      this.redirectLoginedUser(userAuthData);
      return of(null);
    }), takeUntilDestroyed(this.destroyRef))
    .subscribe();
  }

  private redirectLoginedUser(authData: IUserAuth): void {
    this.router.navigate(['/chat/0', { state: authData }]);
  }
}
