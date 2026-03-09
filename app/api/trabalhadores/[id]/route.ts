// app/api/trabalhadores/[id]/route.ts
import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export const runtime = "nodejs"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { nome, telefone, email } = await req.json()

    const trabalhador = await db.trabalhador.update({
      where: { id: parseInt(id) },
      data: { nome, telefone, email },
    })

    return NextResponse.json(trabalhador)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro ao atualizar trabalhador" }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { ativo } = await req.json()

    const trabalhador = await db.trabalhador.update({
      where: { id: parseInt(id) },
      data: { ativo },
    })

    return NextResponse.json(trabalhador)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro ao atualizar status" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const trabalhador = await db.trabalhador.findUnique({ where: { id: parseInt(id) } })
    if (!trabalhador) return NextResponse.json({ error: "Trabalhador não encontrado" }, { status: 404 })

    await db.presenca.deleteMany({ where: { trabalhadorId: parseInt(id) } })
    await db.vinculoPessoa.deleteMany({
      where: {
        OR: [
          { codigoBarras: trabalhador.codigoBarras },
          { codigoSecund: trabalhador.codigoBarras },
        ]
      }
    })
    await db.trabalhador.delete({ where: { id: parseInt(id) } })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro ao remover trabalhador" }, { status: 500 })
  }
}