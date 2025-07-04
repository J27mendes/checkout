import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleCorsOptions } from "@/utils/corsOptionsResponse";

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

    // Requisição para a Braspag
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

    const braspagResponse = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        MerchantId: process.env.BRASPAG_MERCHANT_ID!,
        MerchantKey: process.env.BRASPAG_MERCHANT_KEY!,
      },
      body: JSON.stringify(braspagPayload),
    });

    const result = await braspagResponse.json();

    if (!braspagResponse.ok || !result.Payment) {
      return NextResponse.json(
        {
          message: "Erro da Braspag ao processar o pagamento",
          error: result,
        },
        { status: 502 }
      );
    }

    const paymentData = {
      validade: expirationDate,
      nomeNoCartao,
      cpfTitular,
      parcelas,
      seguro: seguro ?? false,
      status: result.Payment.Status ?? "unknown",
      transactionId: result.Payment.Tid ?? "",
      authorizationCode: result.Payment.AuthorizationCode ?? null,
      paymentType: result.Payment.Type ?? null,
      checkoutId,
      last4Digits,
    };

    const payment = await prisma.payment.create({
      data: paymentData,
    });

    return NextResponse.json({
      message: "Pagamento autorizado com sucesso!",
      payment,
      braspagResponse: result,
    });
  } catch (error) {
    console.error("❌ Erro ao processar pagamento:", error);
    return NextResponse.json(
      {
        message: "Erro inesperado ao processar o pagamento",
        error: String(error),
      },
      { status: 500 }
    );
  }
}
