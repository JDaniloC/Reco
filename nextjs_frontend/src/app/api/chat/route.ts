import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/middlewares/mongodb";
import { apiURL } from "@/config";

import Messages, { Message } from "@/models/Messages";
import Acordos, { AuthorType, StatusType } from "@/models/Acordos";
import {
  errorMsg,
  ApiPostResponse,
  ApiProposalResponse,
  defaultApiProposalResponse,
} from "./chat.dto";
import {
  InitialProposalParams,
  TreatedApiProposal
} from "@/types/negotiation.dto";

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

  const value = searchParams.get("value");
  const installments = searchParams.get("installments");

  let baseURL = `${apiURL}/api/v1/`;
  let params = `?user_id=${cpf}&message=${text}`;
  if (value && installments) {
    baseURL += "proposal/";
    params += `&value=${value}&installments=${installments}`;
  }

  let response: ApiProposalResponse = defaultApiProposalResponse;
  let lastMessageText = response.answer.message.text;
  for (let i = 0; i < 2 && lastMessageText === errorMsg; i++) {
    const attemptResponse = (await fetch(baseURL+params)
      .then((response) => response.json())
      .catch(() => null)) as ApiProposalResponse;
    if (attemptResponse !== null) {
      response = attemptResponse;
      lastMessageText = response.answer.message.text;
    }
  }

  const newMessages: Message[] = [{
    acordoID: agreementID,
    texto: text,
    autor: "User"
  }];

  if (lastMessageText !== errorMsg) {
    newMessages.push({
      texto: lastMessageText,
      acordoID: agreementID,
      autor: "Bot"
    });
  }
  await Messages.insertMany(newMessages);

  const {
    require_input: inputRequired,
    confirm_text: confirmText,
    is_finished: isFinished,
    deny_text: denyText,
    message: answer
  } = response.answer;

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
      messageText: answer.text, author, isFinished,
      confirmText, denyText, inputRequired
    },
    proposal
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
        inputRequired: false,
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
      return { messages: [], answer: defaultApiProposalResponse.answer };
    })) as ApiPostResponse;

  const { messages, answer } = initialProposal;
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
      messageText: message.text,
      denyText: answer.deny_text,
      isFinished: answer.is_finished,
      confirmText: answer.confirm_text,
      inputRequired: answer.require_input
    },
    proposal: null
  })));
}
