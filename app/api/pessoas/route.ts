// app/api/pessoas/route.ts
import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export const runtime = "nodejs"

const TIPO_LABEL: Record<string, string> = {
  paciente:    "Paciente",
  aluno:       "Aluno",
  instrutor:   "Instrutor",
  trabalhador: "Trabalhador",
}

/**
 * GET /api/pessoas
 *
 * Query params (todos opcionais):
 *   tipo   = paciente | aluno | instrutor | trabalhador
 *            → restringe a apenas um tipo de pessoa
 *   curso  = string (ex: "Nosso Lar")
 *            → filtra alunos por blocoEstudo; ignorado se tipo != aluno
 *   ativo  = "true" | "false" (padrão: sem filtro — traz todos)
 *
 * Retorna array de:
 *   { id, nome, tipo, tipoLabel, codigoBarras, curso? }
 * ordenado alfabeticamente por nome.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const tipoParam  = searchParams.get("tipo")   // opcional
    const cursoParam = searchParams.get("curso")  // opcional, só afeta alunos
    const ativoParam = searchParams.get("ativo")  // opcional

    // Converte "ativo" para boolean | undefined
    const ativoBool =
      ativoParam === "true"  ? true  :
      ativoParam === "false" ? false :
      undefined // sem filtro por padrão

    const whereAtivo = ativoBool !== undefined ? { ativo: ativoBool } : {}

    // ── Busca em paralelo nas 4 tabelas ──────────────────────────────────────
    const [pacientes, alunos, instrutores, trabalhadores] = await Promise.all([
      // Pacientes
      (!tipoParam || tipoParam === "paciente")
        ? db.paciente.findMany({
            where: whereAtivo,
            select: { id: true, nome: true, codigoBarras: true, ativo: true },
            orderBy: { nome: "asc" },
          })
        : Promise.resolve([]),

      // Alunos (filtra por curso se fornecido)
      (!tipoParam || tipoParam === "aluno")
        ? db.aluno.findMany({
            where: {
              ...whereAtivo,
              ...(cursoParam ? { blocoEstudo: cursoParam } : {}),
            },
            select: { id: true, nome: true, codigoBarras: true, blocoEstudo: true, ativo: true },
            orderBy: { nome: "asc" },
          })
        : Promise.resolve([]),

      // Instrutores
      (!tipoParam || tipoParam === "instrutor")
        ? db.instrutor.findMany({
            where: whereAtivo,
            select: { id: true, nome: true, codigoBarras: true, ativo: true },
            orderBy: { nome: "asc" },
          })
        : Promise.resolve([]),

      // Trabalhadores
      (!tipoParam || tipoParam === "trabalhador")
        ? db.trabalhador.findMany({
            where: whereAtivo,
            select: { id: true, nome: true, codigoBarras: true, ativo: true },
            orderBy: { nome: "asc" },
          })
        : Promise.resolve([]),
    ])

    // ── Normaliza para formato unificado ─────────────────────────────────────
    type PessoaUnificada = {
      id: number
      nome: string
      tipo: string
      tipoLabel: string
      codigoBarras: string
      curso: string | null
    }

    const resultado: PessoaUnificada[] = [
      ...pacientes.map(p => ({
        id:           p.id,
        nome:         p.nome,
        tipo:         "paciente",
        tipoLabel:    TIPO_LABEL.paciente,
        codigoBarras: p.codigoBarras,
        curso:        null,
      })),
      ...alunos.map(a => ({
        id:           a.id,
        nome:         a.nome,
        tipo:         "aluno",
        tipoLabel:    TIPO_LABEL.aluno,
        codigoBarras: a.codigoBarras,
        curso:        (a as any).blocoEstudo ?? null,
      })),
      ...instrutores.map(i => ({
        id:           i.id,
        nome:         i.nome,
        tipo:         "instrutor",
        tipoLabel:    TIPO_LABEL.instrutor,
        codigoBarras: i.codigoBarras,
        curso:        null,
      })),
      ...trabalhadores.map(t => ({
        id:           t.id,
        nome:         t.nome,
        tipo:         "trabalhador",
        tipoLabel:    TIPO_LABEL.trabalhador,
        codigoBarras: t.codigoBarras,
        curso:        null,
      })),
    ]

    // Ordenação alfabética global (pt-BR, case-insensitive)
    resultado.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" }))

    return NextResponse.json(resultado)
  } catch (error) {
    console.error("[/api/pessoas] erro:", error)
    return NextResponse.json({ error: "Erro ao buscar cadastros" }, { status: 500 })
  }
}