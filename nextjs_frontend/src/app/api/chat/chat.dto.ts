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
  require_input: boolean;
  confirm_text: string;
  deny_text: string;
  message: ApiMessage;
  is_finished: boolean;
}

export interface ApiProposalResponse {
  proposal: ApiProposal | null;
  answer: ApiAnswer;
}

export interface ApiPostResponse {
  messages: ApiProposal[];
  answer: ApiAnswer;
}

export const errorMsg = "Minha conexão está ruim... Poderia repetir?";

export const defaultApiProposalResponse: ApiProposalResponse = {
  proposal: null,
  answer: {
    require_input: false,
    is_finished: false,
    confirm_text: "",
    deny_text: "",
    message: {
      role: "assistant",
      text: errorMsg
    },
  }
}
