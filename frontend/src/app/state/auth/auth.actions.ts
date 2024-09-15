import { createAction, createActionGroup, emptyProps, props } from '@ngrx/store';
import { IUserAuth } from '../../shared';

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    'Log In': props<{ username: string }>(),
    'Log In Success': props<{ user: IUserAuth }>(),
    'Log In Failure': props<{ error: string }>(),
    'Log Out': emptyProps(),
    'Log Out Success': props<{ message: string }>(),
    'Log Out Failure': props<{ error: string }>(),
  }
});
