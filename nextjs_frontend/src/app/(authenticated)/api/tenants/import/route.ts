import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import options from "../../auth/[...nextauth]/options";
import Devedores, { Devedor } from "@/models/Devedores";
import { faker } from '@faker-js/faker/locale/pt_BR';
import Papa from "papaparse";

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

function capitalizeName(name: string): string {
  const names = name.split(" ");
  return names.map((n) =>
    n.charAt(0).toUpperCase() + n.slice(1).toLowerCase()
  ).join(" ");
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(options);
  if (!session) {
    return NextResponse.redirect("/auth/signin");
  }

  const formData = await req.formData();
  const csvFiles = formData.getAll("files");
  let condominiumName = formData.get("condominium") as string;
  if (!condominiumName) condominiumName = "Não informado";

  let debtors: Devedor[] = [];
  for (let i = 0; i < csvFiles.length; i++) {
    const file: any = csvFiles[i];
    const fileBuffer = await file.arrayBuffer();
    const decoder = new TextDecoder("Windows-1252");
    const fileContent = decoder.decode(fileBuffer);
    const csvData = Papa.parse(fileContent, {
      header: false,
      skipEmptyLines: true,
      transform: (value: string) => value.trim()
    });

    let debtorInfos = csvData.data as string[];
    const columns = debtorInfos[1];
    const totalIdx = columns.indexOf("Total");
    const valorIdx = columns.indexOf("Valor");
    const descricaoIdx = columns.indexOf("Descrição");

    let devedor: Devedor = {
      emailAdministrador: session.user?.email ?? "",
      nomeCondominio: condominiumName,
      mensalidadesAtrasadas: 0,
      nome: "Não informado",
      cpf: generateCPF(),
      valorDivida: 0,
    }
    let skipLine = false;
    let taxaCondominial = 0;
    debtorInfos.forEach(async (line) => {
      if (skipLine) return skipLine = false;
      if (line.length === 1) {
        const [cpf, nome] = line[0].split(" - ");
        devedor.cpf += `/${cpf}`.replace(/ /g, "");
        devedor.nome = capitalizeName(nome);
        skipLine = true;
      } else if (
        taxaCondominial === 0 &&
        line[descricaoIdx].includes("Taxa Condominial")
      ) {
        taxaCondominial = Number(line[valorIdx].replace(".", "")
                                               .replace(",", "."));
      } else if (line.includes("Total")) {
        devedor.valorDivida = Number(line[totalIdx].replace(".", "")
                                                   .replace(",", "."));
        devedor.mensalidadesAtrasadas = Math.floor(
          devedor.valorDivida / (taxaCondominial || devedor.valorDivida)
        ) || 1;
        skipLine = true;

        const newDevedor = new Devedores(devedor);
        debtors.push(newDevedor);
        await newDevedor.save();

        taxaCondominial = 0;
        devedor.valorDivida = 0;
        devedor.cpf = generateCPF();
        devedor.nome = "Não informado";
        devedor.mensalidadesAtrasadas = 0;
      }
    });
  }

  return NextResponse.json(debtors);
}
