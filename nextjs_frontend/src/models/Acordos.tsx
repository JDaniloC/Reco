import mongoose from "mongoose";
import { RegrasProposta } from "./Usuarios";

export type StatusType =
  | "Aguardando inadimplente"
  | "Aguardando proposta"
  | "Primeira proposta"
  | "Disputando propostas"
  | "Aguardando aprovação"
  | "Acordo aceito"
  | "Acordo recusado";

export type AuthorType = "Bot" | "User";

export interface Proposta {
  autor: AuthorType;
  aceito: boolean;
  entrada: number;
  mensagem?: string;
  status: StatusType;
  qtdParcelas: number;
}

export interface Acordo {
  identificador: string;
  dataAtualizacao?: Date;
  dataCriacao?: Date;

  usuarioEmail: string;
  cpfDevedor: string;
  status: StatusType;

  entrada: number;
  valorTotal: number;
  qtdParcelas: number;
  historicoValores: Proposta[];
  regraProposta: RegrasProposta;
}

const AcordoSchema = new mongoose.Schema({
  identificador: {
    type: String,
    required: true,
  },
  dataCriacao: {
    type: Date,
    default: Date.now,
  },
  dataAtualizacao: {
    type: Date,
    default: Date.now,
  },
  usuarioEmail: {
    type: String,
    required: true,
  },
  cpfDevedor: {
    type: String,
    required: true,
  },
  status: String,
  entrada: Number,
  valorTotal: Number,
  qtdParcelas: Number,
  regraProposta: {
    mesesAtraso: Number,
    melhorEntrada: {
      type: Number,
      default: 0,
    },
    melhorParcela: Number,
    piorParcela: Number,
    piorEntrada: {
      type: Number,
      default: 0
    },
  },
  historicoValores: [
    {
      autor: String,
      status: String,
      entrada: Number,
      aceito: Boolean,
      mensagem: String,
      qtdParcelas: Number,
    },
  ],
});

export default mongoose.models.Acordos ||
  mongoose.model("Acordos", AcordoSchema);
