// app/api/pacientes/[id]/route.ts
import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export const runtime = "nodejs"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const paciente = await db.paciente.findUnique({ where: { id: parseInt(id) } })
    if (!paciente) return NextResponse.json({ error: "Não encontrado" }, { status: 404 })
    return NextResponse.json(paciente)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro ao buscar paciente" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { nome, telefone, endereco } = await req.json()
    const paciente = await db.paciente.update({
      where: { id: parseInt(id) },
      data: { nome, telefone, endereco },
    })
    return NextResponse.json(paciente)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro ao atualizar paciente" }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { ativo } = await req.json()
    const paciente = await db.paciente.update({
      where: { id: parseInt(id) },
      data: { ativo },
    })
    return NextResponse.json(paciente)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro ao atualizar status" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const paciente = await db.paciente.findUnique({ where: { id: parseInt(id) } })
    if (!paciente) return NextResponse.json({ error: "Paciente não encontrado" }, { status: 404 })

    // Deletar na ordem correta para não violar foreign keys
    await db.observacao.deleteMany({ where: { pacienteId: parseInt(id) } })
    await db.presenca.deleteMany({ where: { pacienteId: parseInt(id) } })
    await db.vinculoPessoa.deleteMany({
      where: {
        OR: [
          { codigoBarras: paciente.codigoBarras },
          { codigoSecund: paciente.codigoBarras },
        ]
      }
    })
    await db.paciente.delete({ where: { id: parseInt(id) } })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro ao remover paciente" }, { status: 500 })
  }
}