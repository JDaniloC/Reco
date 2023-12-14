import { RegrasProposta } from "@/models/Usuarios";
import { Devedor } from "@/models/Devedores";
import { Proposta, StatusType } from "@/models/Acordos";

export interface NegotiationData extends Devedor {
    rules: RegrasProposta;
    proposals: Proposta[];
    status: StatusType;
    identifier: string;
    contact: string;
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

export interface InitialProposalParams {
  cpf: string | number;
  name: string;
  debit: number;
  agreementID: string;
}
