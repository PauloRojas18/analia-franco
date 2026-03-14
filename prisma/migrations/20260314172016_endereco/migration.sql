/*
  Warnings:

  - You are about to drop the column `endereco` on the `Aluno` table. All the data in the column will be lost.
  - You are about to drop the column `endereco` on the `Paciente` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Aluno" DROP COLUMN "endereco";

-- AlterTable
ALTER TABLE "Paciente" DROP COLUMN "endereco";
