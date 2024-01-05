import { NextRequest, NextResponse } from "next/server";
import { options } from "../auth/[...nextauth]/options";
import { getServerSession } from "next-auth/next";

import Messages from "@/models/Messages";
import Acordos, { Acordo } from "@/models/Acordos";
import Devedores, { Devedor } from "@/models/Devedores";
import { connectToDatabase } from "@/middlewares/mongodb";

export async function GET() {
  connectToDatabase();
  const session = await getServerSession(options);
  if (!session) {
    return NextResponse.redirect("/auth/signin");
  }

  const devedores: Devedor[] = await Devedores.aggregate([
    { $match: { emailAdministrador: session.user?.email } },
    {
      $lookup: {
        from: "acordos",
        localField: "cpf",
        foreignField: "cpfDevedor",
        as: "acordos",
      },
    },
    { $match: { acordos: { $size: 0 } } },
    { $unset: "acordos" },
  ]);

  return NextResponse.json(devedores);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(options);
  if (!session) {
    return NextResponse.redirect("/auth/signin");
  }

  const devedor: Devedor = await req.json();
  devedor.emailAdministrador = session.user?.email ?? "";

  connectToDatabase();

  const newDevedor = new Devedores(devedor);
  await newDevedor.save();

  return NextResponse.json(newDevedor);
}

// This function was implement here because the cpf wasn't a number
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(options);
  if (!session) {
    return NextResponse.redirect("/auth/signin");
  }

  connectToDatabase();

  const { searchParams } = new URL(request.url);
  const cpfDevedor = searchParams.get("cpf");

  const acordo: Acordo | null = await Acordos.findOne({
    cpfDevedor, usuarioEmail: session.user?.email
  });
  if (acordo) {
    await Messages.deleteMany({ acordoID: acordo.identificador });
    await Acordos.findOneAndRemove({ cpfDevedor });
  }

  const devedor = await Devedores.findOneAndRemove({
    cpf: cpfDevedor, emailAdministrador: session.user?.email
  });
  if (!devedor) {
    return NextResponse.json({
      "error": "No debtor found"
    });
  }
  return NextResponse.json(devedor);
}
