import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TipoEntrega } from "@prisma/client";
import { handleCorsOptions } from "@/utils/corsOptionsResponse";

export async function OPTIONS() {
  return handleCorsOptions();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      checkoutId,
      cep,
      endereco,
      numero,
      bairro,
      complemento,
      destinatario,
      formaEntrega,
    } = body;

    if (!["GRATUITO", "EXPRESSO_SEGURO"].includes(formaEntrega)) {
      return NextResponse.json(
        { message: "Forma de entrega inválida" },
        { status: 400 }
      );
    }

    const address = await prisma.address.upsert({
      where: { checkoutId },
      update: {
        cep,
        endereco,
        numero,
        bairro,
        complemento,
        destinatario,
        formaEntrega: formaEntrega as TipoEntrega,
      },
      create: {
        cep,
        endereco,
        numero,
        bairro,
        complemento,
        destinatario,
        formaEntrega: formaEntrega as TipoEntrega,
        checkoutId,
      },
    });

    return NextResponse.json(
      {
        message: "Endereço salvo com sucesso!",
        data: address,
      },
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("Erro interno ao salvar endereço:", error);
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
