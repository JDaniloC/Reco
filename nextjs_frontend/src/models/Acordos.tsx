import mongoose from "mongoose";

export interface Acordo {
  id: number;
  usuarioEmail: string;
  cpfDevedor: string;
  dataAcordo?: Date;
  status: "ACEITO PELAS PARTES" | "NEGADO PELO INADIMPLENTE" | "EM ANÁLISE";
  valor: number;
  juros: number;
  diaPagamento: number;
  qtdParcelas: number;
  descricao: string;
}

export interface AcordoIdentificado extends Acordo {
  nomeDevedor: string;
  nomeCondominio: string;
}

const AcordoSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true
  },
  usuarioEmail: {
    type: String,
    required: true
  },
  cpfDevedor: {
    type: String,
    required: true
  },
  dataAcordo: {
    type: Date,
    default: Date.now
  },
  status: String,
  valor: Number,
  juros: Number,
  diaPagamento: Number,
  qtdParcelas: Number,
  descricao: String
});

export default mongoose.models.Acordos || mongoose.model("Acordos", AcordoSchema);
