"use client";

import { useChatContext } from "../../contexts/chat-context";
import { useEffect, useState, useRef } from "react";
import Styles from "./chat.module.scss";

import { ChatProps } from "../../types/views.dto";
import { IMessage } from "../../types/messages.dto";
import { ProposalMessage } from "@/types/negotiation.dto";

import Message from "../Message/message";
import chatAPI from "./chat.api";

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

  function createMessage(proposal: ProposalMessage): IMessage {
    const { denyText, confirmText, isFinished } = proposal;
    const iteractive = confirmText !== "" && denyText !== "";
    const isBot = proposal.author === "Bot";

    setIteractive(iteractive);
    setIsFinished(isFinished);

    return {
      message: proposal.messageText,
      isBot, iteractive, confirmText, denyText,
      onConfirm: () => { handleSendMessage(confirmText) },
      onDeny: () => { handleSendMessage(denyText) },
    }
  }

  useEffect(() => {
    async function getFirstMessage() {
      const { nome, cpf, valorDivida, identifier } = chatData;
      const cpfDevedor = Number(cpf.replaceAll(".", "")
                                   .replaceAll("-", ""));
      const messages = await chatAPI.fetchStartChat({
        name: nome, cpf: cpfDevedor, debit: valorDivida,
        agreementID: identifier
      });
      setMessages(messages.map(msg => createMessage(msg.message)));
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
    const response = await chatAPI.fetchSendMessage(
      chatData.identifier, cpfDevedor, newMessage
    );

    if (messages.length === 1 || response.proposal) {
      chatAPI.fetchUpdateProposal(chatData.identifier, {
        qtdParcelas: response.proposal?.installments || 0,
        mensagem: response.proposal?.message || "",
        autor: response.proposal?.author || "User",
        entrada: response.proposal?.entry || 0,
        aceito: response.message.isFinished,
        status: "Aguardando proposta"
      });
    }

    setMessages((prev) => [...prev, createMessage(response.message)]);
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
      
      {(!isFinished && !iteractive && !isLoading) && (
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
