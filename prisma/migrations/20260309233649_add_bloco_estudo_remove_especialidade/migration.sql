/*
  Warnings:

  - You are about to drop the column `especialidade` on the `Paciente` table. All the data in the column will be lost.
  - Added the required column `blocoEstudo` to the `Aluno` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Aluno" ADD COLUMN     "blocoEstudo" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Paciente" DROP COLUMN "especialidade";
