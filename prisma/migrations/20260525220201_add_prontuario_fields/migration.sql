/*
  Warnings:

  - A unique constraint covering the columns `[pacienteId,numero]` on the table `Observacao` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Observacao" DROP CONSTRAINT "Observacao_pacienteId_fkey";

-- DropForeignKey
ALTER TABLE "Presenca" DROP CONSTRAINT "Presenca_alunoId_fkey";

-- DropForeignKey
ALTER TABLE "Presenca" DROP CONSTRAINT "Presenca_instrutorId_fkey";

-- DropForeignKey
ALTER TABLE "Presenca" DROP CONSTRAINT "Presenca_pacienteId_fkey";

-- DropForeignKey
ALTER TABLE "Presenca" DROP CONSTRAINT "Presenca_trabalhadorId_fkey";

-- AlterTable
ALTER TABLE "Aluno" ADD COLUMN     "endereco" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Instrutor" ADD COLUMN     "endereco" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Paciente" ADD COLUMN     "dataPrimeiraConsulta" TIMESTAMP(3),
ADD COLUMN     "dataUltimaConsulta" TIMESTAMP(3),
ADD COLUMN     "endereco" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "totalConsultas" INTEGER NOT NULL DEFAULT 4;

-- AlterTable
ALTER TABLE "Trabalhador" ADD COLUMN     "endereco" TEXT NOT NULL DEFAULT '';

-- CreateIndex
CREATE INDEX "Observacao_pacienteId_idx" ON "Observacao"("pacienteId");

-- CreateIndex
CREATE UNIQUE INDEX "Observacao_pacienteId_numero_key" ON "Observacao"("pacienteId", "numero");

-- CreateIndex
CREATE INDEX "Presenca_pacienteId_idx" ON "Presenca"("pacienteId");

-- CreateIndex
CREATE INDEX "Presenca_instrutorId_idx" ON "Presenca"("instrutorId");

-- CreateIndex
CREATE INDEX "Presenca_trabalhadorId_idx" ON "Presenca"("trabalhadorId");

-- CreateIndex
CREATE INDEX "Presenca_alunoId_idx" ON "Presenca"("alunoId");

-- CreateIndex
CREATE INDEX "Presenca_codigoBarras_idx" ON "Presenca"("codigoBarras");

-- CreateIndex
CREATE INDEX "VinculoPessoa_codigoBarras_idx" ON "VinculoPessoa"("codigoBarras");

-- CreateIndex
CREATE INDEX "VinculoPessoa_codigoSecund_idx" ON "VinculoPessoa"("codigoSecund");

-- AddForeignKey
ALTER TABLE "Presenca" ADD CONSTRAINT "Presenca_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presenca" ADD CONSTRAINT "Presenca_instrutorId_fkey" FOREIGN KEY ("instrutorId") REFERENCES "Instrutor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presenca" ADD CONSTRAINT "Presenca_trabalhadorId_fkey" FOREIGN KEY ("trabalhadorId") REFERENCES "Trabalhador"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presenca" ADD CONSTRAINT "Presenca_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Observacao" ADD CONSTRAINT "Observacao_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
