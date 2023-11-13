import Image from "next/image";
import Link from "next/link";

interface NotificationCardProps {
  type: "Sucesso" | "Erro" | "Aviso" | "Informação";
  tenantName: string;
  tenantCpf: string;
  condominiumName: string;
  message: string;
  onRemove: () => void;
}

export default function NotificationCard({
  type,
  tenantName,
  tenantCpf,
  condominiumName,
  message,
  onRemove
}: NotificationCardProps) {
  const color =
    type === "Sucesso"
      ? "bg-green-400"
      : type === "Erro"
      ? "bg-red-600"
      : type === "Aviso"
      ? "bg-yellow-400"
      : "bg-blue-700";

  const icon =
    type === "Sucesso"
      ? "/icons/check_circle_green.svg"
      : type === "Erro"
      ? "/icons/error_circle.svg"
      : type === "Aviso"
      ? "/icons/warning_circle.svg"
      : "/icons/info_circle.svg";

  const title =
    type === "Sucesso"
      ? "Sucesso no acordo de:"
      : type === "Erro"
      ? "Erro no acordo:"
      : type === "Aviso"
      ? "Aviso sobre o acordo:"
      : "Informação sobre acordo:";

  return (
    <div className="w-full h-20 flex items-center gap-5">
      <span className={"w-1 h-full " + color} />
      <Image src={icon} alt="icon" width={27} height={27} />
      <Link href={`/agreements/${tenantCpf}`} onClick={onRemove}
            className="py-1 pl-0 pr-4 flex flex-col">
        <h1 className="font-semibold text-black">{title}</h1>
        <span className="text-sm font-medium text-neutral-700">
          {tenantName} | {condominiumName}
        </span>
        <span className="mt-2 text-xs text-neutral-400">{message}</span>
      </Link>
      <button onClick={onRemove} className="ml-auto">
        <Image src="/icons/x_circle.svg" alt="icon" width={27} height={27} />
      </button>
    </div>
  );
}
