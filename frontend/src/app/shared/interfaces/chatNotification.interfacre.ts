export interface IChatNotification {
  username: string;
  chatId: string;
  sender?: IUserInfo;
  target?: IUserInfo;
}

interface IUserInfo {
  username: string;
  userId: string;
  color: string;
}
