export interface IMessage {
  message: string;
  isBot: boolean;
  denyText?: string;
  confirmText?: string;
  iteractive?: boolean;
  onConfirm?: () => void;
  onDeny?: () => void;
}

export interface IProposal {
  message: {
    role: string;
    text: string;
  };
  entry: number
  installments: number
  installment_value: number
  is_finished: boolean
  confirm_text: string
  deny_text: string
}