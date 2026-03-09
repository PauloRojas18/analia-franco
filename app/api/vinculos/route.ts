// app/api/vinculos/route.ts
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { TipoPessoa } from "@prisma/client"

export const runtime = "nodejs"

// Busca pessoas por nome para vinculação (excluindo instrutores para pacientes/alunos)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const nome = searchParams.get("nome") ?? ""
  const excluirTipo = searchParams.get("excluirTipo") ?? ""

  if (nome.length < 2) return NextResponse.json([])

  const resultados: { tipo: string; nome: string; codigoBarras: string }[] = []

  const where = { nome: { contains: nome, mode: "insensitive" as const } }

  const [pacientes, alunos, instrutores, trabalhadores] = await Promise.all([
    excluirTipo !== "paciente"    ? db.paciente.findMany({ where, take: 5 })    : Promise.resolve([]),
    excluirTipo !== "aluno"       ? db.aluno.findMany({ where, take: 5 })       : Promise.resolve([]),
    excluirTipo !== "instrutor"   ? db.instrutor.findMany({ where, take: 5 })   : Promise.resolve([]),
    excluirTipo !== "trabalhador" ? db.trabalhador.findMany({ where, take: 5 }) : Promise.resolve([]),
  ])

  for (const p of pacientes)    resultados.push({ tipo: "paciente",    nome: p.nome, codigoBarras: p.codigoBarras })
  for (const p of alunos)       resultados.push({ tipo: "aluno",       nome: p.nome, codigoBarras: p.codigoBarras })
  for (const p of instrutores)  resultados.push({ tipo: "instrutor",   nome: p.nome, codigoBarras: p.codigoBarras })
  for (const p of trabalhadores) resultados.push({ tipo: "trabalhador", nome: p.nome, codigoBarras: p.codigoBarras })

  return NextResponse.json(resultados.slice(0, 10))
}

// Cria ou remove um vínculo
export async function POST(req: Request) {
  try {
    const { codigoBarras, tipoPrincipal, codigoSecund, tipoSecund } = await req.json()

    // Regra: pacientes/alunos não podem vincular com instrutores
    const bloqueados = [
      ["paciente", "instrutor"],
      ["aluno", "instrutor"],
      ["instrutor", "paciente"],
      ["instrutor", "aluno"],
    ]
    const bloqueado = bloqueados.some(([a, b]) => tipoPrincipal === a && tipoSecund === b)
    if (bloqueado) {
      return NextResponse.json({ error: "Este vínculo não é permitido" }, { status: 400 })
    }

    const vinculo = await db.vinculoPessoa.upsert({
      where: { codigoBarras_tipoSecund: { codigoBarras, tipoSecund: tipoSecund as TipoPessoa } },
      update: { codigoSecund, tipoPrincipal: tipoPrincipal as TipoPessoa },
      create: { codigoBarras, tipoPrincipal: tipoPrincipal as TipoPessoa, codigoSecund, tipoSecund: tipoSecund as TipoPessoa },
    })

    return NextResponse.json(vinculo)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro ao criar vínculo" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { codigoBarras, tipoSecund } = await req.json()

    await db.vinculoPessoa.delete({
      where: { codigoBarras_tipoSecund: { codigoBarras, tipoSecund: tipoSecund as TipoPessoa } },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro ao remover vínculo" }, { status: 500 })
  }
}