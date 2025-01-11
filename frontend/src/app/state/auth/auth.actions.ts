import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { IToken, IUserAuth } from '../../shared';
import { HttpErrorResponse } from '@angular/common/http';

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    'Log In': props<{ username: string }>(),
    'Log In Success': props<{ user: IUserAuth }>(),
    'Log In Failure': props<{ error: HttpErrorResponse }>(),
    'Log Out': emptyProps(),
    'Log Out Success': props<{ message: string }>(),
    'Log Out Failure': props<{ error: HttpErrorResponse }>(),
    'Refresh Token': emptyProps(),
    'Refresh Token Success': props<{ token: IToken }>(),
    'Refresh Token Failure': props<{ error: HttpErrorResponse }>(),
  },
});
