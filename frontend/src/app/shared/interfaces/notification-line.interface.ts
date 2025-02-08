export interface INotificationLine {
  type: 'info' | 'success' | 'error';
  text: string;
  closeTimeout: number;
}
