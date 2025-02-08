export interface IMessage {
  text: string;
  userId: string;
  color?: string; // Только на получение
  username?: string; // Только на получение
  timestamp?: string; // Только на получение
}
