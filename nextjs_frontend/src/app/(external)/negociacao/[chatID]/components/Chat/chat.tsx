"use client";

import { useChatContext } from "../../contexts/chat-context";
import { useEffect, useState, useRef } from "react";
import Styles from "./chat.module.scss";

import { IMessage } from "../../types/messages.dto";
import { ChatProps } from "../../types/views.dto";
import { StatusType } from "@/models/Acordos";
import {
  ProposalMessage,
  TreatedApiProposal
} from "@/types/negotiation.dto";

import { UserInputMessageProps } from "@/components/UserInput/user-input.dto";
import UserInput from "@/components/UserInput/user-input";
import Message from "../Message/message";
import chatAPI from "./chat.api";

export default function Chat({ chatData }: ChatProps) {
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [iterative, setIterative] = useState<boolean>(false);
  const [showInput, setShowInput] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [messages, setMessages] = useState<IMessage[]>([]);
  const [message, setMessage] = useState<string>("");
  const chatContainer = useRef<HTMLDivElement>(null);
  const { isAllowed, makeProposal } = useChatContext();

  useEffect(() => {
    if (chatContainer) chatContainer.current?.scrollTo(
      0, chatContainer.current?.scrollHeight)
  })

  function createMessage(proposal: ProposalMessage): IMessage {
    const { denyText, confirmText, isFinished, inputRequired } = proposal;
    const iterative = confirmText !== "" && denyText !== "" &&
                      typeof confirmText !== "undefined";
    const isBot = proposal.author === "Bot";

    setIterative(iterative);
    setIsFinished(isFinished);
    setShowInput(inputRequired);

    return {
      message: proposal.messageText,
      isBot, iterative, confirmText, denyText,
      onConfirm: () => { handleSendMessage(confirmText) },
      onDeny: () => { handleSendMessage(denyText) },
    }
  }

  useEffect(() => {
    async function getFirstMessage() {
      const { nome, cpf, valorDivida, identifier } = chatData;
      const cpfDevedor = Number(cpf.replaceAll(".", "")
                                   .replaceAll("-", ""));
      let messages = [] as TreatedApiProposal[];
      for (let i = 0; i < 2 && messages.length === 0; i++) {
        messages = await chatAPI.fetchStartChat({
          name: nome, cpf: cpfDevedor, debit: valorDivida,
          agreementID: identifier
        });
      }
      setMessages(messages.map(msg => createMessage(msg.message)));
      if (chatData.proposals.length > 0) {
        const { proposals } = chatData;
        const lastIndex = proposals.length - 1;
        const lastProposal = proposals[lastIndex];
        makeProposal(lastProposal, chatData.status);
      }
      setIsLoading(false);
    }
    getFirstMessage();
  }, [chatData]);

  async function handleSendMessage(
    message?: string, value?: number, installments?: number
  ) {
    if (!message) return;

    setIsLoading(true);
    setIterative(false);
    setMessages((prev) => [...prev, { message, isBot: false }]);
    setMessage("");

    const cpfDevedor = Number(chatData.cpf.replaceAll(".", "")
                                          .replaceAll("-", ""));
    const response = await chatAPI.fetchSendMessage(
      chatData.identifier, cpfDevedor, message, value, installments
    );

    if (messages.length === 1 || response.proposal) {
      const status = "Aguardando proposta" as StatusType;
      const newProposal = makeProposal(response, status);
      if (newProposal.entrada > 0 || newProposal.qtdParcelas > 0) {
        chatAPI.fetchUpdateProposal(chatData.identifier, newProposal);
      }
    }

    setMessages((prev) => [...prev, createMessage(response.message)]);
    setIsLoading(false);
  }

  function sendProposal(proposal: UserInputMessageProps) {
    const message = `Proposta: R$${proposal.value.toFixed(2)} em ` +
                    `${proposal.installment} parcelas. ` +
                    `Motivo: ${proposal.reason}`;
    handleSendMessage(message, proposal.value, proposal.installment);
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
            iterative={messageData.iterative && index === messages.length - 1}
            acceptText={messageData.confirmText}
            onConfirm={messageData.onConfirm}
            denyText={messageData.denyText}
            onDeny={messageData.onDeny}
          >
            <span dangerouslySetInnerHTML={{ __html: messageData.message }}/>
          </Message>
        ))}
        {isLoading && (
          <Message isBot={true} iterative={false}>
            <div className={Styles.loading}><span></span></div>
          </Message>
        )}
        {isFinished && (
          <Message isBot={true} iterative={false}>
            <div className="text-[#F59E0B] font-normal text-lg">
              Agradecemos por compartilhar sua proposta, Estamos avaliando-a e retornaremos em breve.
            </div>
          </Message>
        )}
      </div>
      
      {(!isFinished && !iterative && !isLoading && !showInput) && (
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
            <img src="/icons/send.svg" alt="send button icon"
                 className="w-8 h-8"/>
          </button>
        </div>
      )}

      {showInput && <UserInput
        divida={chatData.valorDivida}
        onConfirm={sendProposal}
        showReason={true}
      />}
    </div>
  );
}
