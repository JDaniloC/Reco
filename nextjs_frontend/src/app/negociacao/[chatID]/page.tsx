import { serverURL } from "@/config";
import React from "react";

import { ChatProvider } from "./contexts/chat-context";
import { NegotiationData } from "@/types/negotiation.dto";

import LoadingBar from "@/components/Loading/loading";
import ChatModal from "./components/chat-modal";
import Chat from "./components/Chat/chat";

async function fetchChatData(chatID: string) {
  return (await fetch(`${serverURL}/api/proposal/${chatID}/`)
    .then((response) => response.json())
    .catch((error) => {
      console.error(error);
      return null;
    })) as NegotiationData | null;
}

interface ChatPageProps {
  params: {
    chatID: string;
  };
}

export default async function ChatPage({ params }: ChatPageProps) {
  const chatData = await fetchChatData(params.chatID);

  if (!chatData) return <LoadingBar />;
  const proposals = chatData.proposals;

  return (
    <div className="flex w-full h-full max-h-[calc(100vh-4rem)] bg-gray-100
                    justify-center flex-col-reverse sm:flex-row">
      <ChatProvider>
        <ChatModal cpf={chatData.cpf} />
        <Chat chatData={chatData} />
      </ChatProvider>
      <div className="sm:w-1/5 min-w-[200px] bg-gray-100 p-4">
        <h1 className="text-2xl font-medium">
          EM NEGOCIAÇÃO
        </h1>
        <p className="text-gray-400 mt-4"> Valor da dívida </p>
        <p className="font-normal text-xl">
          R$ {chatData.valorDivida}
        </p>
        <p className="text-gray-400 mt-4"> Desconto </p>
        <p className="font-normal text-xl">
          0%
        </p>
        <p className="text-gray-400 mt-4"> Atraso relativo </p>
        <p className="font-normal text-xl">
          {chatData.mensalidadesAtrasadas} meses
        </p>
        {proposals.length > 0 && (
          <>
          <p className="text-gray-400 mt-4"> Proposta de entrada </p>
          <p className="font-normal text-xl">
            R$ {proposals[proposals.length - 1].entrada < 0 ?
                proposals[proposals.length - 1].entrada :
                proposals[proposals.length - 1].entrada * chatData.valorDivida}
          </p>
          <p className="text-gray-400 mt-4"> Proposta de parcelamento </p>
          <p className="font-normal text-xl">
            {proposals[proposals.length - 1].qtdParcelas} meses
          </p>
          </>
        )}
        <p className="text-gray-400 mt-4"> Informação para contato </p>
        <p className="font-normal text-xl">
          {chatData.contact}
        </p>
      </div>
    </div>
  );
}
