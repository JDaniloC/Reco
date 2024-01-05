import { NextRequest, NextResponse } from "next/server";

import { faker } from '@faker-js/faker/locale/pt_BR';
import Acordos, { Acordo } from "@/models/Acordos";
import Devedores, { Devedor } from "@/models/Devedores";
import { connectToDatabase } from "@/middlewares/mongodb";

import { randomUUID } from "crypto";

interface PartialDevedor {
  nome: string;
  valorDivida: number;
}

const nomeCondominio = "teste@pbb.com.br"
const emailAdministrador = "teste@pbb.com.br";

function generateCPF(): string {
  const cpf = String(faker.number.int())
    .padStart(11, "0").slice(0, 11);
  return (
    cpf.slice(0, 3) +
    "." +
    cpf.slice(3, 6) +
    "." +
    cpf.slice(6, 9) +
    "-" +
    cpf.slice(9, 11)
  );
}

export async function POST(req: NextRequest) {
  const { nome, valorDivida }: PartialDevedor = await req.json();
  const devedor: Devedor = {
    cpf: generateCPF(),
    nome, valorDivida,
    nomeCondominio,
    emailAdministrador,
    mensalidadesAtrasadas: 1
  }

  connectToDatabase();
  const newDevedor = new Devedores(devedor);
  await newDevedor.save();

  const newAcordo: Acordo = await Acordos.create({
    identificador: randomUUID(),
    historicoValores: [],
    qtdParcelas: 3,
    entrada: 0,
    regraProposta: {
      melhorEntrada: 0,
      melhorParcela: 10,
      mesesAtraso: 1,
      piorEntrada: 0,
      piorParcela: 10,
    },
    usuarioEmail: emailAdministrador,
    cpfDevedor: newDevedor.cpf,
    valorTotal: valorDivida,
    status: "Aguardando inadimplente",
  });

  return NextResponse.json(newAcordo);
}
