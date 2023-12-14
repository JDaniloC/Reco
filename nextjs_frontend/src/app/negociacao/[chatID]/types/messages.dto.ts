export interface IMessage {
  message: string;
  isBot: boolean;
  denyText?: string;
  confirmText?: string;
  iteractive?: boolean;
  onConfirm?: () => void;
  onDeny?: () => void;
}
