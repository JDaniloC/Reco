import { Devedor } from "@/models/Devedores";

interface DebtorCardProps {
  tenant: Devedor;
  openModal: (debtor: Devedor) => void;
  onRemove: (id: string) => void;
}

export default function DebtorCard({
  tenant, openModal, onRemove
}: DebtorCardProps) {
  async function handleRemoveTenant() {
    onRemove(tenant.cpf);
  }
  function handleStartAgreement() {
    openModal(tenant);
  }

  return (
    <div className="w-full py-4 px-8 flex flex-col md:flex-row flex-wrap
                    items-start md:items-center justify-between rounded-xl
                    shadow bg-white">
      <div className="flex flex-col items-start gap-1 w-full md:w-2/12">
        <span
          className="font-normal text-xl w-full whitespace-nowrap
                         overflow-hidden text-ellipsis ">
          {tenant.nome}
        </span>
      </div>
      <div className="w-36 pb-1 flex md:block items-center gap-2">
        <p className="font-normal">Condomínio:</p>
        <div className="flex items-center gap-1 pt-1 text-xs font-light whitespace-nowrap">
          {tenant?.nomeCondominio}
        </div>
      </div>
      <div className="w-32 pb-1 flex md:block items-center gap-2">
        <p className="font-normal">Dívida relativa:</p>
        <div className="flex items-center gap-1 text-xs font-light whitespace-nowrap">
          <span className="pt-1">
            {tenant.mensalidadesAtrasadas} meses
          </span>
        </div>
      </div>
      <div className="w-20 pb-1 flex md:block items-center gap-2">
        <p className="font-normal">Dívida:</p>
        <div className="flex items-center gap-1 text-xs font-light whitespace-nowrap">
          <span className="pt-1">R$ {tenant.valorDivida?.toLocaleString("pt-BR")}</span>
        </div>
      </div>
      <div className="w-44 flex items-center justify-end">
        <button
          className="w-full h-10  rounded-md text-white
                  text-s font-normal text-center bg-primary"
          onClick={handleStartAgreement}>
          Negociar
        </button>
      </div>
      <button
        onClick={handleRemoveTenant}
        className="text-5xl text-gray-500 hover:text-gray-700 ml-[-3rem]">
        &times;
      </button>
    </div>
  );
}
