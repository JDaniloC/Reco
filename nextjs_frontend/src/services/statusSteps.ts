import { StatusType } from "@/models/Acordos";

export function getStatusStep(status: StatusType) {
  switch (status) {
    case "Aguardando proposta":
      return 1;
    case "Primeira proposta":
      return 2;
    case "Disputando propostas":
      return 3;
    case "Aguardando aprovação":
      return 4;
    case "Acordo recusado":
      return 5;
    case "Acordo aceito":
      return 5;
    default:
      return 0;
  }
}