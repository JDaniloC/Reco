export interface INotification {
  type: "Sucesso" | "Erro" | "Aviso" | "Informação";
  condominiumName: string;
  identifier: string;
  tenantName: string;
  tenantCpf: string;
  message: string;
}
