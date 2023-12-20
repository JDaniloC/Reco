import { NegotiationData } from "@/types/negotiation.dto";

interface ChatInfosProps {
  chatData: NegotiationData;
}

export default function ChatInfos({ chatData }: ChatInfosProps) {
  const proposals = chatData.proposals;
  const lastProposal = proposals.length > 0 ?
      proposals[proposals.length - 1] : null;

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
      {lastProposal && (
        <>
        <p className="text-gray-400 mt-4"> Proposta de entrada </p>
        <p className="font-normal text-xl">
          R$ {lastProposal.entrada < 0 ? lastProposal.entrada :
              lastProposal.entrada * chatData.valorDivida}
        </p>
        <p className="text-gray-400 mt-4"> Proposta de parcelamento </p>
        <p className="font-normal text-xl">
          {lastProposal.qtdParcelas} meses
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