-- CreateTable
CREATE TABLE "Observacao" (
    "id" SERIAL NOT NULL,
    "pacienteId" INTEGER NOT NULL,
    "numero" INTEGER NOT NULL,
    "descricao" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Observacao_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Observacao" ADD CONSTRAINT "Observacao_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
