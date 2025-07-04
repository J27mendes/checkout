import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleCorsOptions } from "@/utils/corsOptionsResponse";

export async function OPTIONS() {
  return handleCorsOptions();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { checkoutId, nomeCompleto, email, cpf, celular } = body;

    const checkout = await prisma.checkout.upsert({
      where: { id: checkoutId },
      update: {},
      create: { id: checkoutId },
    });

    const identify = await prisma.identify.upsert({
      where: { checkoutId: checkout.id },
      update: {
        nomeCompleto,
        email,
        cpf,
        celular,
      },
      create: {
        nomeCompleto,
        email,
        cpf,
        celular,
        checkoutId: checkout.id,
      },
    });

    return NextResponse.json(
      {
        message: "Identificação salva com sucesso!",
        data: identify,
      },
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("Erro interno:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
}
