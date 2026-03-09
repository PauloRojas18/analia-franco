// app/api/presenca/route.ts
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { TipoPessoa } from "@prisma/client"

export const runtime = "nodejs"

export async function GET() {
  try {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    const presencas = await db.presenca.findMany({
      where: { horario: { gte: hoje } },
      orderBy: { horario: "desc" },
      include: {
        paciente:    { select: { nome: true } },
        aluno:       { select: { nome: true } },
        instrutor:   { select: { nome: true } },
        trabalhador: { select: { nome: true } },
      },
    })

    return NextResponse.json(
      presencas.map((p) => ({
        id: p.id,
        tipo: p.tipo,
        horario: new Date(p.horario).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        codigoBarras: p.codigoBarras,
        pessoaNome: p.paciente?.nome ?? p.aluno?.nome ?? p.instrutor?.nome ?? p.trabalhador?.nome ?? "Desconhecido",
      }))
    )
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro ao buscar presenças" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { codigoBarras, tipo } = await req.json()

    // Busca a pessoa pelo código e tipo
    let pessoaId: number | null = null
    let nome = ""

    if (tipo === "paciente") {
      const p = await db.paciente.findUnique({ where: { codigoBarras } })
      if (p) { pessoaId = p.id; nome = p.nome }
    } else if (tipo === "aluno") {
      const p = await db.aluno.findUnique({ where: { codigoBarras } })
      if (p) { pessoaId = p.id; nome = p.nome }
    } else if (tipo === "instrutor") {
      const p = await db.instrutor.findUnique({ where: { codigoBarras } })
      if (p) { pessoaId = p.id; nome = p.nome }
    } else if (tipo === "trabalhador") {
      const p = await db.trabalhador.findUnique({ where: { codigoBarras } })
      if (p) { pessoaId = p.id; nome = p.nome }
    }

    if (!pessoaId) {
      return NextResponse.json({ error: "Pessoa não encontrada" }, { status: 404 })
    }

    const presenca = await db.presenca.create({
      data: {
        tipo: tipo as TipoPessoa,
        codigoBarras,
        ...(tipo === "paciente"    && { pacienteId: pessoaId }),
        ...(tipo === "aluno"       && { alunoId: pessoaId }),
        ...(tipo === "instrutor"   && { instrutorId: pessoaId }),
        ...(tipo === "trabalhador" && { trabalhadorId: pessoaId }),
      },
    })

    return NextResponse.json({
      id: presenca.id,
      nome,
      tipo,
      horario: new Date(presenca.horario).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      codigoBarras,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro ao registrar presença" }, { status: 500 })
  }
}