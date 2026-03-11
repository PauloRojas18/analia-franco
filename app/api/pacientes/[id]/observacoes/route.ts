// app/api/pacientes/[id]/observacoes/route.ts
import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export const runtime = "nodejs"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const observacoes = await db.observacao.findMany({
      where: { pacienteId: parseInt(id) },
      orderBy: { numero: "asc" },
    })
    return NextResponse.json(observacoes)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro ao buscar observações" }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { numero, descricao } = await req.json()

    // Verifica se já existe observação para este número
    const existente = await db.observacao.findFirst({
      where: { pacienteId: parseInt(id), numero },
    })

    if (existente) {
      // Atualiza se já existe
      const obs = await db.observacao.update({
        where: { id: existente.id },
        data: { descricao, data: new Date() },
      })
      return NextResponse.json(obs)
    }

    const obs = await db.observacao.create({
      data: {
        pacienteId: parseInt(id),
        numero,
        descricao,
      },
    })
    return NextResponse.json(obs)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro ao salvar observação" }, { status: 500 })
  }
}