"use client";

import { createContext, useContext, useState } from "react";
import { TreatedApiProposal } from "@/types/negotiation.dto";
import { Proposta, StatusType } from "@/models/Acordos";

interface ChatContext {
  proposal: null | Proposta;
  isAllowed: boolean;
  setIsAllowed: React.Dispatch<React.SetStateAction<boolean>>;
  makeProposal: (data: TreatedApiProposal|Proposta, status: StatusType) => Proposta;
}

interface ChatProviderProps {
  children: React.ReactNode;
}

export const ChatContext = createContext<ChatContext | null>(null);

export function ChatProvider({ children }: Readonly<ChatProviderProps>) {
  const [isAllowed, setIsAllowed] = useState<boolean>(true);
  const [proposal, setProposal] = useState<null | Proposta>(null);

  function makeProposal(data: TreatedApiProposal|Proposta, status: StatusType) {
    let newProposal: Proposta;
    if ("message" in data) {
      const { proposal, message } = data;
      newProposal = {
        qtdParcelas: proposal?.installments ?? 0,
        mensagem: proposal?.message ?? "",
        autor: proposal?.author ?? "User",
        entrada: proposal?.entry ?? 0,
        aceito: message.isFinished,
        status
      };
    } else {
      newProposal = data as Proposta;
    }
    
    setProposal(newProposal);
    return newProposal;
  }

  return (
    <ChatContext.Provider value={{
      proposal,
      isAllowed,
      makeProposal,
      setIsAllowed,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) throw new Error("ChatContext not found!");
  return context;
}
