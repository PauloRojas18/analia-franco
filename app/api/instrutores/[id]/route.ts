// app/api/instrutores/[id]/route.ts
import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export const runtime = "nodejs"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { nome, telefone, email } = await req.json()

    const instrutor = await db.instrutor.update({
      where: { id: parseInt(id) },
      data: { nome, telefone, email },
    })

    return NextResponse.json(instrutor)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro ao atualizar instrutor" }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { ativo } = await req.json()

    const instrutor = await db.instrutor.update({
      where: { id: parseInt(id) },
      data: { ativo },
    })

    return NextResponse.json(instrutor)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro ao atualizar status" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    await db.presenca.deleteMany({ where: { instrutorId: parseInt(id) } })
    await db.vinculoPessoa.deleteMany({ where: { 
      OR: [
        { codigoBarras: (await db.instrutor.findUnique({ where: { id: parseInt(id) } }))?.codigoBarras ?? "" },
        { codigoSecund: (await db.instrutor.findUnique({ where: { id: parseInt(id) } }))?.codigoBarras ?? "" },
      ]
    }})
    await db.instrutor.delete({ where: { id: parseInt(id) } })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro ao remover instrutor" }, { status: 500 })
  }
}