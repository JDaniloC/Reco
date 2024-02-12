interface ApiMessage {
  role: string;
  text: string;
}

export interface ApiProposal {
  message: ApiMessage
  entry: number
  accepted: boolean
  installments: number
}

export interface ApiAnswer {
  confirm_text?: string
  deny_text?: string
  is_finished: boolean;
  message: ApiMessage;
}

export interface ApiProposalResponse {
  proposal: ApiProposal | null;
  answer: ApiAnswer;
}

export const errorMsg = "Minha conexão está ruim... Poderia repetir?";

export const defaultApiProposalResponse: ApiProposalResponse = {
  proposal: null,
  answer: {
    is_finished: false,
    message: {
      role: "assistant",
      text: errorMsg
    }
  }
}
