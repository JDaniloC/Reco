import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/middlewares/mongodb";
import options from "../../auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

import Acordos, { Acordo, Proposta, StatusType } from "@/models/Acordos";
import { Devedor } from "@/models/Devedores";
import { Usuario } from "@/models/Usuarios";
import { NegotiationData } from "@/types/negotiation.dto";
import { notificate } from "./notification";

interface AgreementAgg extends Acordo {
  administrador: Usuario;
  devedor: Devedor;
}

interface AgreementAgg2 extends Acordo {
  devedor: Devedor;
}
interface Context {
  params: { chatID: string }
}

export async function GET(request: NextRequest, context: Context) {
  connectToDatabase();

  const identificador = context.params.chatID;
  const agreements: AgreementAgg[] = await Acordos.aggregate([
    { $match: { identificador } },
    {
      $lookup: {
        from: "devedores",
        localField: "cpfDevedor",
        foreignField: "cpf",
        as: "devedor",
      },
    },
    {
      $lookup: {
        from: "usuarios",
        localField: "usuarioEmail",
        foreignField: "email",
        as: "administrador",
      },
    },
    { $unwind: { path: "$administrador" } },
    { $unwind: { path: "$devedor" } },
  ]);
  if (agreements.length === 0) {
    return NextResponse.json({ "error": "No agreements found" });
  }

  const agreement: AgreementAgg = agreements[0];
  const devedor: Devedor = agreement.devedor;
  const response: NegotiationData = {
    nome: devedor.nome,
    valorDivida: devedor.valorDivida,
    nomeCondominio: devedor.nomeCondominio,
    mensalidadesAtrasadas: devedor.mensalidadesAtrasadas,
    emailAdministrador: agreement.usuarioEmail,
    contact: agreement.administrador.contact,
    proposals: agreement.historicoValores,
    identifier: agreement.identificador,
    rules: agreement.regraProposta,
    cpf: agreement.cpfDevedor,
    status: agreement.status,
  };

  return NextResponse.json(response);
}

export async function POST(request: NextRequest, context: Context) {
  connectToDatabase();

  const identificador = context.params.chatID;
  const newProposal: Proposta = await request.json();

  const agreements: AgreementAgg2[] = await Acordos.aggregate([
    { $match: { identificador } },
    {
      $lookup: {
        from: "devedores",
        localField: "cpfDevedor",
        foreignField: "cpf",
        as: "devedor",
      },
    },
    { $unwind: { path: "$devedor" } },
  ]);
  if (agreements.length === 0) {
    return NextResponse.json({ "error": "No agreement found" });
  }
  const agreement: AgreementAgg2 = agreements[0];
  const history = agreement.historicoValores;

  const session = await getServerSession(options);
  let status: StatusType = "Aguardando proposta";
  const canAccept = history.length > 0 &&
      history[history.length - 1].aceito;
  if (session && canAccept) {
    status = "Acordo recusado";
    if (newProposal.aceito) {
      status = "Acordo aceito";
    }
  } else {
    if (newProposal.aceito) {
      status = "Aguardando aprovação";
    } else if (history.length === 0) {
      status = "Primeira proposta";
    } else {
      status = "Disputando propostas"
    }
  }

  const noProposalStatus: StatusType[] = [
    "Acordo aceito", "Acordo recusado", "Aguardando proposta"
  ]
  if (!noProposalStatus.includes(status)) {
    history.push(newProposal);
  }

  const { entrada, qtdParcelas } = newProposal;
  const dataAtualizacao = new Date();

  const updatedProposal = await Acordos.findOneAndUpdate(
    { identificador },
    { $set: {
      dataAtualizacao, status,
      entrada, qtdParcelas,
      historicoValores: history,
    } },
    { new: true }
  );

  notificate(agreement.devedor, updatedProposal);
  revalidatePath("/agreements/[chatID]/page");
  revalidatePath("/agreements/page");
  return NextResponse.json(updatedProposal);
}