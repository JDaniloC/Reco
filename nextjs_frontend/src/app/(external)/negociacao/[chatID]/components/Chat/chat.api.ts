import { serverURL } from "@/config";
import {
  TreatedApiProposal,
  InitialProposalParams
} from "@/types/negotiation.dto";
import { Proposta } from "@/models/Acordos";

async function fetchStartChat(params: InitialProposalParams) {
  return (await fetch(`${serverURL}/api/chat/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  }).then((response) => response.json())
    .catch((error) => {
      console.error(error);
      return [];
    })) as TreatedApiProposal[];
}

async function fetchSendMessage(
  agreementID: string, cpf: number, message: string,
  value?: number, installments?: number
) {
  let url = `${serverURL}/api/chat/?cpf=${cpf}&text=${message}`;
  if (value && installments) {
    url += `&value=${value}&installments=${installments}`;
  }
  return (await fetch(url + `&agreementID=${agreementID}`)
    .then((response) => response.json())
    .catch((error) => {
      console.error(error);
      return { message: { messageText: "Ocorreu um problema..." }};
    })) as TreatedApiProposal;
}

async function fetchUpdateProposal(
  identifier: string,
  newProposal: Proposta
) {
  return (await fetch(`${serverURL}/api/proposal/${identifier}/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newProposal),
  }).then((response) => response.json())
    .catch((error) => {
      console.error(error);
    }));
}

export default {
  fetchStartChat,
  fetchSendMessage,
  fetchUpdateProposal
}