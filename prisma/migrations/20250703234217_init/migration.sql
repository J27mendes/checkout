-- CreateEnum
CREATE TYPE "TipoEntrega" AS ENUM ('GRATUITO', 'EXPRESSO_SEGURO');

-- CreateTable
CREATE TABLE "Checkout" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Checkout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Identify" (
    "id" SERIAL NOT NULL,
    "nomeCompleto" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "cpf" VARCHAR(20) NOT NULL,
    "celular" VARCHAR(20) NOT NULL,
    "checkoutId" TEXT NOT NULL,

    CONSTRAINT "Identify_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" SERIAL NOT NULL,
    "cep" VARCHAR(9) NOT NULL,
    "endereco" TEXT NOT NULL,
    "numero" VARCHAR(10) NOT NULL,
    "bairro" TEXT NOT NULL,
    "complemento" TEXT,
    "destinatario" TEXT NOT NULL,
    "formaEntrega" "TipoEntrega" NOT NULL,
    "checkoutId" TEXT NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" SERIAL NOT NULL,
    "last4Digits" VARCHAR(4) NOT NULL,
    "validade" VARCHAR(7) NOT NULL,
    "nomeNoCartao" TEXT NOT NULL,
    "cpfTitular" VARCHAR(11) NOT NULL,
    "parcelas" INTEGER NOT NULL,
    "seguro" BOOLEAN NOT NULL DEFAULT false,
    "status" VARCHAR(50) NOT NULL,
    "transactionId" VARCHAR(100) NOT NULL,
    "authorizationCode" VARCHAR(50),
    "paymentType" VARCHAR(30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkoutId" TEXT NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Identify_checkoutId_key" ON "Identify"("checkoutId");

-- CreateIndex
CREATE UNIQUE INDEX "Address_checkoutId_key" ON "Address"("checkoutId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_checkoutId_key" ON "Payment"("checkoutId");

-- AddForeignKey
ALTER TABLE "Identify" ADD CONSTRAINT "Identify_checkoutId_fkey" FOREIGN KEY ("checkoutId") REFERENCES "Checkout"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_checkoutId_fkey" FOREIGN KEY ("checkoutId") REFERENCES "Checkout"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_checkoutId_fkey" FOREIGN KEY ("checkoutId") REFERENCES "Checkout"("id") ON DELETE CASCADE ON UPDATE CASCADE;
