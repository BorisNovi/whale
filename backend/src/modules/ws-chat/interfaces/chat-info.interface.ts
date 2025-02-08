import { IUser } from 'src/modules/auth/interfaces';

export interface IChatInfo {
  chatId: string;
  sender: Partial<IUser>;
  target: Partial<IUser>;
}
