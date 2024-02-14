export interface IMessage {
  message: string;
  isBot: boolean;
  denyText?: string;
  confirmText?: string;
  iterative?: boolean;
  onConfirm?: () => void;
  onDeny?: () => void;
}
