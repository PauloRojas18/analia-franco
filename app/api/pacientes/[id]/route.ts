// app/api/pacientes/[id]/route.ts
import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export const runtime = "nodejs"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { nome, especialidade, telefone, endereco } = body

    const paciente = await db.paciente.update({
      where: { id: parseInt(id) },
      data: { nome, especialidade, telefone, endereco },
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
    const body = await req.json()

    const paciente = await db.paciente.update({
      where: { id: parseInt(id) },
      data: { ativo: body.ativo },
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

    await db.presenca.deleteMany({ where: { pacienteId: parseInt(id) } })
    await db.paciente.delete({ where: { id: parseInt(id) } })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro ao remover paciente" }, { status: 500 })
  }
}