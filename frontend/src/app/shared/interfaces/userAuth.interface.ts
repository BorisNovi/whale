import { IToken } from './token.interface';

export interface IUserAuth {
  username: string;
  userId: string;
  token: IToken;
}
