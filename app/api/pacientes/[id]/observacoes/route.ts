// app/api/pacientes/[id]/observacoes/route.ts
import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export const runtime = "nodejs"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const pacienteId = parseInt(id)

    // Verificar se paciente existe
    const paciente = await db.paciente.findUnique({
      where: { id: pacienteId },
    })

    if (!paciente) {
      return NextResponse.json({ error: "Paciente não encontrado" }, { status: 404 })
    }

    // Buscar observações ordenadas por número
    const observacoes = await db.observacao.findMany({
      where: { pacienteId },
      orderBy: { numero: "asc" },
      select: {
        id: true,
        numero: true,
        descricao: true,
        data: true,
      },
    })

    return NextResponse.json(observacoes)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Erro ao buscar observações" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { numero, descricao } = await req.json()
    const pacienteId = parseInt(id)

    // Validações
    if (!numero || typeof numero !== "number") {
      return NextResponse.json(
        { error: "Número da observação é obrigatório e deve ser um número" },
        { status: 400 }
      )
    }

    if (!descricao || typeof descricao !== "string") {
      return NextResponse.json(
        { error: "Descrição é obrigatória" },
        { status: 400 }
      )
    }

    const descricaoTrimmed = descricao.trim()
    if (descricaoTrimmed.length === 0) {
      return NextResponse.json(
        { error: "Descrição não pode estar vazia" },
        { status: 400 }
      )
    }

    // Verificar se paciente existe
    const paciente = await db.paciente.findUnique({
      where: { id: pacienteId },
    })

    if (!paciente) {
      return NextResponse.json({ error: "Paciente não encontrado" }, { status: 404 })
    }

    // Verificar se já existe observação com este número
    const existente = await db.observacao.findFirst({
      where: { pacienteId, numero },
    })

    let observacao

    if (existente) {
      // Atualizar se já existe
      observacao = await db.observacao.update({
        where: { id: existente.id },
        data: {
          descricao: descricaoTrimmed,
          data: new Date(),
        },
        select: {
          id: true,
          numero: true,
          descricao: true,
          data: true,
        },
      })
    } else {
      // Criar se não existe
      observacao = await db.observacao.create({
        data: {
          pacienteId,
          numero,
          descricao: descricaoTrimmed,
        },
        select: {
          id: true,
          numero: true,
          descricao: true,
          data: true,
        },
      })
    }

    return NextResponse.json(observacao, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Erro ao salvar observação" },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { numero } = await req.json()
    const pacienteId = parseInt(id)

    if (!numero || typeof numero !== "number") {
      return NextResponse.json(
        { error: "Número da observação é obrigatório" },
        { status: 400 }
      )
    }

    // Verificar se observação existe
    const observacao = await db.observacao.findFirst({
      where: { pacienteId, numero },
    })

    if (!observacao) {
      return NextResponse.json(
        { error: "Observação não encontrada" },
        { status: 404 }
      )
    }

    // Deletar observação
    await db.observacao.delete({
      where: { id: observacao.id },
    })

    return NextResponse.json({ ok: true, message: "Observação deletada com sucesso" })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Erro ao deletar observação" },
      { status: 500 }
    )
  }
}