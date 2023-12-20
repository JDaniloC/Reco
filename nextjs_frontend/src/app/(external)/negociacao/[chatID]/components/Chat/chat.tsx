"use client";

import { serverURL } from "@/config";
import { useEffect, useState, useRef } from "react";

import { ChatProps } from "../../types/views.dto";
import { IMessage } from "../../types/messages.dto";
import { IProposal, InitialProposalParams } from "@/types/negotiation.dto";

import Message from "../Message/message";

import Styles from "./chat.module.scss";
import { useChatContext } from "../../contexts/chat-context";

async function fetchStartChat(params: InitialProposalParams) {
  return (await fetch(`${serverURL}/api/chat/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  }).then((response) => response.json())
    .catch((error) => {
      console.error(error);
      return { messages: [] };
    })) as { messages: IProposal[] };
}

async function fetchSendMessage(
  agreementID: string, cpf: number, message: string
) {
  const url = `${serverURL}/api/chat/?cpf=${cpf}&text=${message}`;
  return (await fetch(url + `&agreementID=${agreementID}`)
    .then((response) => response.json())
    .catch((error) => {
      console.error(error);
      return { message: {
        text: "Ocorreu um problema...", role: "assistant",
        confirm_text: "", deny_text: "", is_finished: false
      }};
    })) as IProposal;
}

export default function Chat({ chatData }: ChatProps) {
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [iteractive, setIteractive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [messages, setMessages] = useState<IMessage[]>([]);
  const [message, setMessage] = useState<string>("");
  const chatContainer = useRef<HTMLDivElement>(null);
  const { isAllowed } = useChatContext();

  useEffect(() => {
    if (chatContainer) chatContainer.current?.scrollTo(
      0, chatContainer.current?.scrollHeight)
  })

  function createMessage({
    confirm_text, deny_text, message, is_finished
  }: IProposal): IMessage {
    const iteractive = typeof confirm_text === "string" &&
      confirm_text !== "" && deny_text !== "";
    const isBot = message.role === "assistant";
    setIteractive(iteractive);
    setIsFinished(is_finished);
    return {
      message: message.text, isBot, iteractive,
      confirmText: confirm_text, denyText: deny_text,
      onConfirm: () => { handleSendMessage(confirm_text) },
      onDeny: () => { handleSendMessage(deny_text) },
    }
  }

  useEffect(() => {
    async function getFirstMessage() {
      const { nome, cpf, valorDivida, identifier } = chatData;
      const cpfDevedor = Number(cpf.replaceAll(".", "").replaceAll("-", ""));
      const { messages } = await fetchStartChat({
        name: nome, cpf: cpfDevedor, debit: valorDivida,
        agreementID: identifier
      });
      setMessages(messages.map(message => createMessage(message)));
      setIsLoading(false);
    }
    getFirstMessage();
  }, [chatData]);

  async function handleSendMessage(newMessage: string) {
    setIsLoading(true);
    setIteractive(false);
    setMessages((prev) => [...prev, {
      message: newMessage as string, isBot: false
    }]);
    setMessage("");

    const cpfDevedor = Number(chatData.cpf.replaceAll(".", "")
                                          .replaceAll("-", ""));
    const response = await fetchSendMessage(
      chatData.identifier, cpfDevedor, newMessage
    );
    setMessages((prev) => [...prev, createMessage(response)]);
    setIsLoading(false);
  }

  function onMessageChange(event: any) {
    setMessage(event.target.value);
  }

  function handleKeyPress(event: any) {
    if (event.key === 'Enter') {
      handleSendMessage(message);
    }
  }

  function handleSubmit() {
    handleSendMessage(message);
  }

  return isAllowed && (
    <div className={Styles.chat}>
      <h1 className="text-2xl font-medium p-4 border-b-gray-200 border-b-2">
        {chatData.nomeCondominio}
      </h1>
      <div className="overflow-y-scroll flex-1" ref={chatContainer}>
        {messages.map((messageData, index) => (
          <Message key={index} isBot={messageData.isBot}
            iteractive={messageData.iteractive &&
                        index === messages.length - 1}
            acceptText={messageData.confirmText}
            onConfirm={messageData.onConfirm}
            denyText={messageData.denyText}
            onDeny={messageData.onDeny}
          >
            <span dangerouslySetInnerHTML={{ __html: messageData.message }}/>
          </Message>
        ))}
        {isLoading && (
          <Message isBot={true} iteractive={false}>
            <div className={Styles.loading}><span></span></div>
          </Message>
        )}
        {isFinished && (
          <Message isBot={true} iteractive={false}>
            <div className="text-[#F59E0B] font-normal text-lg">
              Agradecemos por compartilhar sua proposta, Estamos avaliando-a e retornaremos em breve.
            </div>
          </Message>
        )}
      </div>
      
      {(!isFinished && !iteractive) && (
        <div className="flex pr-4">
          <input
            value={message}
            onChange={onMessageChange}
            onKeyPress={handleKeyPress}
            className="p-4 shadow-md w-full"
            placeholder="Escreva sua mensagem"
            type="text" name="message" id="message"
          />
          <button onClick={handleSubmit}>
            <img src="/icons/send.svg" alt="send image"
              className="w-8 h-8"/>
          </button>
        </div>
      )}
    </div>
  );
}