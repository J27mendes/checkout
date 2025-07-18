import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { valor, descricao }: { valor: number; descricao: string } =
      await req.json();

    if (!valor || !descricao) {
      return NextResponse.json(
        { message: "Valor e descrição são obrigatórios." },
        { status: 400 }
      );
    }

    console.log(
      "💰 Simulando PIX com valor:",
      valor,
      "e descrição:",
      descricao
    );

    return NextResponse.json({
      message: "Simulação de pagamento PIX com sucesso",
      banco: "Banco Inter",
      valorOriginal: valor,
      descricao,
      qrCode:
        "00020101021226880014BR.GOV.BCB.PIX2555qrcode-pix-simulado-banco-inter52040000530398654041.235802BR5925EMPRESA TESTE LTDA6009SaoPaulo62070503***6304ABCD",
      pixCopiaCola:
        "00020126580014BR.GOV.BCB.PIX00000000000000000000052040000530398654041.235802BR5925EMPRESA TESTE LTDA6009SaoPaulo62070503***6304WXYZ",
    });
  } catch (error) {
    console.error("❌ Erro ao simular PIX:", error);
    return NextResponse.json(
      { message: "Erro ao simular pagamento Pix." },
      { status: 500 }
    );
  }
}
