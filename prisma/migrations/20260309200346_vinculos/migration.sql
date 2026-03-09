-- CreateTable
CREATE TABLE "VinculoPessoa" (
    "id" SERIAL NOT NULL,
    "codigoBarras" TEXT NOT NULL,
    "tipoPrincipal" "TipoPessoa" NOT NULL,
    "codigoSecund" TEXT NOT NULL,
    "tipoSecund" "TipoPessoa" NOT NULL,

    CONSTRAINT "VinculoPessoa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VinculoPessoa_codigoBarras_tipoSecund_key" ON "VinculoPessoa"("codigoBarras", "tipoSecund");
