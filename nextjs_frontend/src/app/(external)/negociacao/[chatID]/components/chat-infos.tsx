"use client";

import { NegotiationData } from "@/types/negotiation.dto";
import { useChatContext } from "../contexts/chat-context";

interface ChatInfosProps {
  chatData: NegotiationData;
}

export default function ChatInfos({ chatData }: Readonly<ChatInfosProps>) {
  const { proposal } = useChatContext();

  return (
    <div className="sm:w-1/5 min-w-[200px] bg-gray-100 p-4">
      <h1 className="text-2xl font-medium">
        EM NEGOCIAÇÃO
      </h1>
      <p className="text-gray-400 mt-4"> Valor da dívida </p>
      <p className="font-normal text-xl">
        R$ {chatData.valorDivida}
      </p>
      <p className="text-gray-400 mt-4"> Dívida relativa </p>
      <p className="font-normal text-xl">
        {chatData.mensalidadesAtrasadas} meses
      </p>
      {proposal && (
        <>
        <p className="text-gray-400 mt-4"> Proposta de entrada </p>
        <p className="font-normal text-xl">
          R$ {proposal.entrada > 0 ? proposal.entrada :
              proposal.entrada * chatData.valorDivida}
        </p>
        <p className="text-gray-400 mt-4"> Proposta de parcelamento </p>
        <p className="font-normal text-xl">
          {proposal.qtdParcelas} meses
        </p>
        </>
      )}
      <p className="text-gray-400 mt-4"> Informação para contato </p>
      <p className="font-normal text-xl">
        {chatData.contact}
      </p>
    </div>
  )
}