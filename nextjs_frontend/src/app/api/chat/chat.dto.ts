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

export interface ApiProposalResponse {
  proposal: ApiProposal | null;
  is_finished: boolean;
  confirm_text: string
  answer: ApiMessage;
  deny_text: string
}
