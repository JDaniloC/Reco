"use client";

import { apiURL } from "@/config";
import { useEffect, useState, useRef } from "react";

import { ChatProps } from "../../types/views.dto";
import { IMessage, IChatMessage } from "../../types/messages.dto";

import Message from "../Message/message";

import Styles from "./chat.module.scss";
import { useChatContext } from "../../contexts/chat-context";

async function fetchStartChat(name: string, cpf: number, debit: number) {
  return (await fetch(`${apiURL}/api/v1/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: name,
      user_id: cpf,
      total_debit: debit,
    }),
  })
    .then((response) => response.json())
    .catch((error) => {
      console.error(error);
      return { message: "Erro ao iniciar chat" };
    })) as { messages: { role: string, text: string }[] };
}

async function fetchSendMessage(cpf: number, message: string) {
  return (await fetch(`${apiURL}/api/v1/?user_id=${cpf}&message=${message}`)
    .then((response) => response.json())
    .catch((error) => {
      console.error(error);
      return { messages: [ {
        text: "Ocorreu um problema...", role: "assistant"
      }] };
    })) as IChatMessage;
}

export default function Chat({ chatData }: ChatProps) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [message, setMessage] = useState<string>("");
  const chatContainer = useRef<HTMLDivElement>(null);
  const { isAllowed } = useChatContext();

  useEffect(() => {
    async function getFirstMessage() {
      const { nome, cpf, valorDivida } = chatData;
      const cpfDevedor = Number(cpf.replaceAll(".", "").replaceAll("-", ""));
      const { messages } = await fetchStartChat(nome, cpfDevedor, valorDivida);
      setMessages(messages.map(message => ({
        message: message.text, isBot: message.role === "assistant"
      })));
      setIsLoading(false);
    }
    getFirstMessage();
  }, [chatData]);

  useEffect(() => {
    if (chatContainer) chatContainer.current?.scrollTo(
      0, chatContainer.current?.scrollHeight)
  })

  async function handleSendMessage() {
    setMessages((prev) => [...prev, { message, isBot: false }]);
    setIsLoading(true);

    const userMessage = message;
    setMessage("");

    const cpfDevedor = Number(chatData.cpf.replaceAll(".", "")
                                          .replaceAll("-", ""));
    const response = await fetchSendMessage(cpfDevedor, userMessage);
    const { message: newMessage } = response;
    setMessages((prev) => [...prev, { message: newMessage, isBot: true }]);
    setIsLoading(false);
  }

  function onMessageChange(event: any) {
    setMessage(event.target.value);
  }

  function handleKeyPress(event: any) {
    if(event.key === 'Enter'){
      handleSendMessage();
    }
  }

  return isAllowed && (
    <div className={Styles.chat}>
      <h1 className="text-2xl font-medium p-4 border-b-gray-200 border-b-2">
        {chatData.nomeCondominio}
      </h1>
      <div className="overflow-y-scroll flex-1" ref={chatContainer}>
        {messages.map((messageData, index) => (
          <Message key={index} isBot={messageData.isBot}>
            <span dangerouslySetInnerHTML={{ __html: messageData.message }}/>
          </Message>
        ))}
        {isLoading && (
          <Message isBot={true} iteractive={false}>
            <div className={Styles.loading}><span></span></div>
          </Message>
        )}
      </div>
      <div className="flex pr-4">
        <input
          value={message}
          onChange={onMessageChange}
          onKeyPress={handleKeyPress}
          className="p-4 shadow-md w-full"
          placeholder="Escreva sua mensagem"
          type="text" name="message" id="message"
        />
        <button onClick={handleSendMessage}>
          <img src="/icons/send.svg" alt="send image"
            className="w-8 h-8"/>
        </button>
      </div>
    </div>
  );
}
