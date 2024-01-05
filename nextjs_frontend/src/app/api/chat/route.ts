import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/middlewares/mongodb";
import { apiURL } from "@/config";

import Messages, { Message } from "@/models/Messages";
import Acordos, { AuthorType, StatusType } from "@/models/Acordos";
import { ApiProposal, ApiProposalResponse } from "./chat.dto";
import {
  InitialProposalParams,
  TreatedApiProposal
} from "@/types/negotiation.dto";

const errorMsg = "Minha conexão está ruim... Poderia repetir a pergunta?";

export async function GET(
  request: NextRequest
): Promise<NextResponse<TreatedApiProposal | { error: string }>> {
  connectToDatabase();

  const { searchParams } = new URL(request.url);
  const cpf = searchParams.get("cpf");
  const text = searchParams.get("text");
  const agreementID = searchParams.get("agreementID");

  if (!cpf || !text || !agreementID) {
    return NextResponse.json({ "error": "Missing params" });
  }

  const url = `${apiURL}/api/v1/?user_id=${cpf}&message=${text}`;
  let response: ApiProposalResponse = {
    answer: {
      role: "assistant",
      text: errorMsg,
    },
    is_finished: false,
    proposal: null,
    confirm_text: "",
    deny_text: ""
  };
  for (let i = 0; i < 2 && response.answer.text === errorMsg; i++) {
    const attemptResponse = (await fetch(url)
      .then((response) => response.json())
      .catch(() => null)) as ApiProposalResponse;
    if (attemptResponse !== null) {
      response = attemptResponse;
    }
  }

  const newMessages: Message[] = [{
    acordoID: agreementID,
    texto: text,
    autor: "User"
  }];

  if (response.answer.text !== errorMsg) {
    newMessages.push({
      acordoID: agreementID,
      texto: response.answer.text,
      autor: "Bot"
    });
  }
  await Messages.insertMany(newMessages);

  const {
    confirm_text: confirmText,
    is_finished: isFinished,
    deny_text: denyText,
    answer
  } = response;

  let proposal: TreatedApiProposal["proposal"] = null
  if (response.proposal) {
    const { installments, accepted, entry } = response.proposal;
    const { role, text: message } = response.proposal.message;
    proposal = {
      installments, accepted, entry, message,
      author: role === "assistant" ? "Bot" : "User"
    };
  }

  const author: AuthorType = "Bot" as AuthorType;
  return NextResponse.json({
    message: {
      messageText: answer.text, author,
      isFinished, confirmText, denyText
    },
    proposal: proposal
  });
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<TreatedApiProposal[]>> {
  connectToDatabase();

  const params: InitialProposalParams = await request.json();
  const agreement = await Acordos.findOne({
    identificador: params.agreementID
  });
  const oldMessages = await Messages.find({
    acordoID: params.agreementID
  });

  const finishedStatus: StatusType[] = [
    "Acordo aceito", "Acordo recusado", "Aguardando aprovação"
  ];
  if (finishedStatus.includes(agreement.status)) {
    return NextResponse.json(oldMessages.map(({ autor, texto }) => ({
      message: {
        author: autor,
        isFinished: true,
        messageText: texto,
        confirmText: "",
        denyText: ""
      },
      proposal: null
    })));
  }

  const initialProposal = (await fetch(`${apiURL}/api/v1/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: params.name,
      user_id: params.cpf,
      total_debit: params.debit,
      old_messages: oldMessages.map(({ autor, texto }) => ({
        role: autor === "Bot" ? "assistant" : "user",
        text: texto
      }))
    }),
  }).then((response) => response.json())
    .catch(() => {
      return { messages: [], is_finished: false };
    })) as { messages: ApiProposal[], is_finished: boolean };
    
  const messages = initialProposal.messages;
  if (oldMessages.length === 0 && messages.length === 1) {
    const parsedMessages: Message[] = messages.map(({ message }) => ({
      acordoID: params.agreementID,
      texto: message.text,
      autor: message.role === "assistant" ? "Bot" : "User"
    }));
    await Messages.insertMany(parsedMessages);
  }

  return NextResponse.json(messages.map(({ message }) => ({
    message: {
      author: message.role === "assistant" ? "Bot" : "User",
      isFinished: initialProposal.is_finished,
      messageText: message.text,
      confirmText: "",
      denyText: ""
    },
    proposal: null
  })));
}
