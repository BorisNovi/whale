import { IToken } from './token.interface';

export interface IUser {
  username: string;
  userId: string;
  token: IToken;
  color: string;
  lastSeen: Date;
}
