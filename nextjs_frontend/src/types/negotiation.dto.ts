import { AuthorType, Proposta, StatusType } from "@/models/Acordos";
import { RegrasProposta } from "@/models/Usuarios";
import { Devedor } from "@/models/Devedores";

export interface NegotiationData extends Devedor {
  rules: RegrasProposta;
  proposals: Proposta[];
  status: StatusType;
  identifier: string;
  contact: string;
}

export interface ProposalMessage {
  confirmText?: string;
  messageText: string;
  isFinished: boolean;
  author: AuthorType;
  denyText?: string;
}

export interface ProposalInfos {
  installments: number;
  author: AuthorType;
  accepted: boolean;
  message: string;
  entry: number;
}

export interface TreatedApiProposal {
  message: ProposalMessage;
  proposal: ProposalInfos | null;
}

export interface InitialProposalParams {
  cpf: string | number;
  name: string;
  debit: number;
  agreementID: string;
}
