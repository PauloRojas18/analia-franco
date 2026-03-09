-- CreateEnum
CREATE TYPE "TipoPessoa" AS ENUM ('paciente', 'instrutor', 'trabalhador', 'aluno');

-- CreateTable
CREATE TABLE "Paciente" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "especialidade" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "codigoBarras" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Paciente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Instrutor" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "codigoBarras" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Instrutor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trabalhador" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "codigoBarras" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Trabalhador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Aluno" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "codigoBarras" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Aluno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Presenca" (
    "id" SERIAL NOT NULL,
    "tipo" "TipoPessoa" NOT NULL,
    "horario" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "codigoBarras" TEXT NOT NULL,
    "pacienteId" INTEGER,
    "instrutorId" INTEGER,
    "trabalhadorId" INTEGER,
    "alunoId" INTEGER,

    CONSTRAINT "Presenca_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Paciente_codigoBarras_key" ON "Paciente"("codigoBarras");

-- CreateIndex
CREATE UNIQUE INDEX "Instrutor_email_key" ON "Instrutor"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Instrutor_codigoBarras_key" ON "Instrutor"("codigoBarras");

-- CreateIndex
CREATE UNIQUE INDEX "Trabalhador_email_key" ON "Trabalhador"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Trabalhador_codigoBarras_key" ON "Trabalhador"("codigoBarras");

-- CreateIndex
CREATE UNIQUE INDEX "Aluno_codigoBarras_key" ON "Aluno"("codigoBarras");

-- AddForeignKey
ALTER TABLE "Presenca" ADD CONSTRAINT "Presenca_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presenca" ADD CONSTRAINT "Presenca_instrutorId_fkey" FOREIGN KEY ("instrutorId") REFERENCES "Instrutor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presenca" ADD CONSTRAINT "Presenca_trabalhadorId_fkey" FOREIGN KEY ("trabalhadorId") REFERENCES "Trabalhador"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presenca" ADD CONSTRAINT "Presenca_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno"("id") ON DELETE SET NULL ON UPDATE CASCADE;
