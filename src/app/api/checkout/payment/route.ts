import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleCorsOptions } from "@/utils/corsOptionsResponse";
import axios from "axios";

interface BraspagPayment {
  Tid: string;
  Status: number | string;
  AuthorizationCode?: string | null;
  Type?: string | null;
}

interface BraspagResponse {
  Payment: BraspagPayment;
}

export async function OPTIONS() {
  return handleCorsOptions();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      checkoutId,
      nomeNoCartao,
      cpfTitular,
      parcelas,
      cardNumber,
      expirationDate,
      cvv,
      seguro,
      amountInCents,
      brand,
    } = body;

    // Validações básicas
    if (
      !checkoutId ||
      !nomeNoCartao ||
      !cpfTitular ||
      !parcelas ||
      !cardNumber ||
      !expirationDate ||
      !cvv ||
      amountInCents === undefined ||
      !brand
    ) {
      return NextResponse.json(
        { message: "Dados obrigatórios ausentes" },
        { status: 400 }
      );
    }

    if (!/^\d{2}\/\d{4}$/.test(expirationDate)) {
      return NextResponse.json(
        { message: "Formato da data de validade inválido. Use MM/YYYY." },
        { status: 400 }
      );
    }

    const checkoutExists = await prisma.checkout.findUnique({
      where: { id: checkoutId },
    });

    if (!checkoutExists) {
      return NextResponse.json(
        { message: "checkoutId não encontrado no banco" },
        { status: 400 }
      );
    }

    const last4Digits = cardNumber.slice(-4);
    if (!last4Digits || last4Digits.length !== 4) {
      return NextResponse.json(
        { message: "Número do cartão inválido" },
        { status: 400 }
      );
    }

    // Payload para Braspag
    const braspagPayload = {
      MerchantOrderId: checkoutId,
      Customer: {
        Name: nomeNoCartao,
        Identity: cpfTitular,
      },
      Payment: {
        Type: "CreditCard",
        Amount: amountInCents,
        Installments: parcelas,
        Provider: "Simulado",
        Capture: true,
        CreditCard: {
          CardNumber: cardNumber.replace(/\s/g, ""),
          Holder: nomeNoCartao,
          ExpirationDate: expirationDate,
          SecurityCode: cvv,
          Brand: brand,
        },
      },
    };

    const isSandbox = process.env.BRASPAG_IS_SANDBOX === "true";
    const url = isSandbox
      ? "https://apisandbox.braspag.com.br/v2/sales"
      : "https://api.braspag.com.br/v2/sales";

    const headers = {
      "Content-Type": "application/json",
      MerchantId: process.env.MERCHANT_ID ?? "",
      MerchantKey: process.env.MERCHANT_KEY ?? "",
    };

    // Chamada com axios
    const { data: result } = await axios.post<BraspagResponse>(
      url,
      braspagPayload,
      { headers }
    );

    if (!result?.Payment) {
      return NextResponse.json(
        {
          message: "Resposta da Braspag não contém dados de pagamento válidos",
          raw: result,
        },
        { status: 502 }
      );
    }

    // Gravação no banco
    const payment = await prisma.payment.create({
      data: {
        validade: expirationDate,
        nomeNoCartao,
        cpfTitular,
        parcelas,
        seguro: seguro ?? false,
        status: String(result.Payment.Status ?? "unknown"),
        transactionId: result.Payment.Tid ?? "",
        authorizationCode: result.Payment.AuthorizationCode ?? null,
        paymentType: result.Payment.Type ?? null,
        last4Digits,
        checkout: {
          connect: { id: checkoutId },
        },
      },
    });

    return NextResponse.json({
      message: "Pagamento autorizado com sucesso!",
      payment,
      braspagResponse: result,
    });
  } catch (error: unknown) {
    let status = 500;
    let raw = "Erro desconhecido";

    if (typeof error === "object" && error !== null && "response" in error) {
      const err = error as {
        response: { status?: number; data?: unknown };
      };
      status = err.response?.status || 502;

      if (typeof err.response.data === "string") {
        raw = err.response.data;
      } else if (typeof err.response.data === "object") {
        raw = JSON.stringify(err.response.data, null, 2);
      } else {
        raw = "Erro sem corpo de resposta";
      }
    }

    return NextResponse.json(
      {
        message: "Erro inesperado ao processar o pagamento",
        error: raw,
        status,
      },
      { status: 502 }
    );
  }
}
