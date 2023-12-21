import { serverURL } from "@/config";
import React from "react";

import { ChatProvider } from "./contexts/chat-context";
import { NegotiationData } from "@/types/negotiation.dto";

import LoadingBar from "@/components/Loading/loading";
import ChatModal from "./components/chat-modal";
import ChatInfos from "./components/chat-infos";
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

  return (
    <div className="flex w-full h-full bg-gray-100 justify-center
                    flex-col-reverse sm:flex-row">
      <ChatProvider>
        <ChatModal cpf={chatData.cpf} />
        <Chat chatData={chatData}/>
        <ChatInfos chatData={chatData} />
      </ChatProvider>
    </div>
  );
}
