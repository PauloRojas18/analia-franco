// app/api/pacientes/[id]/route.ts
import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export const runtime = "nodejs"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const paciente = await db.paciente.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        nome: true,
        telefone: true,
        endereco: true,
        ativo: true,
        codigoBarras: true,
        totalConsultas: true,
        dataPrimeiraConsulta: true,
        dataUltimaConsulta: true,
        createdAt: true,
      },
    })

    if (!paciente) {
      return NextResponse.json({ error: "Paciente não encontrado" }, { status: 404 })
    }

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

    if (!nome || !telefone) {
      return NextResponse.json(
        { error: "Nome e telefone são obrigatórios" },
        { status: 400 }
      )
    }

    const paciente = await db.paciente.update({
      where: { id: parseInt(id) },
      data: {
        nome,
        telefone,
        endereco: endereco || "",
      },
      select: {
        id: true,
        nome: true,
        telefone: true,
        endereco: true,
        ativo: true,
        codigoBarras: true,
        totalConsultas: true,
        dataPrimeiraConsulta: true,
        dataUltimaConsulta: true,
        createdAt: true,
      },
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
    const pacienteId = parseInt(id)

    // Construir objeto de dados a atualizar dinamicamente
    const dadosAtualizacao: any = {}

    // Campos simples
    if ("nome" in body) dadosAtualizacao.nome = body.nome
    if ("telefone" in body) dadosAtualizacao.telefone = body.telefone
    if ("endereco" in body) dadosAtualizacao.endereco = body.endereco || ""
    if ("ativo" in body) dadosAtualizacao.ativo = Boolean(body.ativo)

    // Campos do prontuário
    if ("totalConsultas" in body) {
      dadosAtualizacao.totalConsultas = parseInt(body.totalConsultas)
    }
    if ("dataPrimeiraConsulta" in body && body.dataPrimeiraConsulta) {
      dadosAtualizacao.dataPrimeiraConsulta = new Date(body.dataPrimeiraConsulta)
    }
    if ("dataUltimaConsulta" in body && body.dataUltimaConsulta) {
      dadosAtualizacao.dataUltimaConsulta = new Date(body.dataUltimaConsulta)
    }

    // Validar se há algo para atualizar
    if (Object.keys(dadosAtualizacao).length === 0) {
      return NextResponse.json(
        { error: "Nenhum dado para atualizar" },
        { status: 400 }
      )
    }

    const paciente = await db.paciente.update({
      where: { id: pacienteId },
      data: dadosAtualizacao,
      select: {
        id: true,
        nome: true,
        telefone: true,
        endereco: true,
        ativo: true,
        codigoBarras: true,
        totalConsultas: true,
        dataPrimeiraConsulta: true,
        dataUltimaConsulta: true,
        createdAt: true,
      },
    })

    return NextResponse.json(paciente)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro ao atualizar paciente" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const pacienteId = parseInt(id)

    const paciente = await db.paciente.findUnique({
      where: { id: pacienteId },
    })

    if (!paciente) {
      return NextResponse.json({ error: "Paciente não encontrado" }, { status: 404 })
    }

    // Deletar na ordem correta para não violar foreign keys
    // 1. Observações
    await db.observacao.deleteMany({
      where: { pacienteId: pacienteId },
    })

    // 2. Presenças
    await db.presenca.deleteMany({
      where: { pacienteId: pacienteId },
    })

    // 3. Vínculos de pessoa
    await db.vinculoPessoa.deleteMany({
      where: {
        OR: [
          { codigoBarras: paciente.codigoBarras },
          { codigoSecund: paciente.codigoBarras },
        ],
      },
    })

    // 4. Paciente
    await db.paciente.delete({
      where: { id: pacienteId },
    })

    return NextResponse.json({ ok: true, message: "Paciente deletado com sucesso" })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro ao remover paciente" }, { status: 500 })
  }
}