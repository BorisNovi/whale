import { IToken } from './token.interface';

export interface IUserAuth {
  username: string;
  token: IToken;
}