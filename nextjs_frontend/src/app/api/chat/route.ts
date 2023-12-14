import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/middlewares/mongodb";
import { apiURL } from "@/config";

import Messages, { Message } from "@/models/Messages";
import { IProposal, InitialProposalParams } from "@/types/negotiation.dto";

export async function GET(request: NextRequest) {
  connectToDatabase();

  const { searchParams } = new URL(request.url);
  const cpf = searchParams.get("cpf");
  const text = searchParams.get("text");
  const agreementID = searchParams.get("agreementID");

  if (!cpf || !text || !agreementID) {
    return NextResponse.json({ "error": "Missing params" });
  }

  const url = `${apiURL}/api/v1/?user_id=${cpf}&message=${text}`;
  const { message } = (await fetch(url).then((response) => response.json())
    .catch(() => ({ message: {
      text: "Ocorreu um problema...", role: "assistant"
    }}))) as IProposal;

  await Messages.insertMany([{
    acordoID: agreementID,
    texto: text,
    autor: "User"
  }, {
    acordoID: agreementID,
    texto: message.text,
    autor: "Bot"
  }]);

  return NextResponse.json({ message });
}

export async function POST(request: NextRequest) {
  connectToDatabase();

  const params: InitialProposalParams = await request.json();

  const oldMessages = await Messages.find({
    acordoID: params.agreementID
  });

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
      return { messages: [] };
    })) as { messages: IProposal[] };
    
  const messages = initialProposal.messages;
  if (messages.length === 1) {
    const parsedMessages: Message[] = messages.map(({ message }) => ({
        acordoID: params.agreementID,
        texto: message.text,
        autor: message.role === "assistant" ? "Bot" : "User"
      }));
    await Messages.insertMany(parsedMessages);
  }

  return NextResponse.json(initialProposal);
}
