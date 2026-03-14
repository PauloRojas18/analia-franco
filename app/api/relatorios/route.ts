// app/api/relatorios/route.ts
import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export const runtime = "nodejs"

const TIPO_LABEL: Record<string, string> = {
  paciente: "Paciente",
  aluno: "Aluno",
  instrutor: "Instrutor",
  trabalhador: "Trabalhador",
}

export async function GET(req: Request) {
  try{
    const { searchParams } = new URL(req.url)
    const data = searchParams.get("data")
    const curso = searchParams.get("curso") // novo

    let whereHorario: any = {}
    if (data) {
      const inicio = new Date(`${data}T00:00:00.000Z`)
      const fim = new Date(`${data}T23:59:59.999Z`)
      whereHorario = { horario: { gte: inicio, lte: fim } }
    }

    // Se filtrou por curso, só traz presenças de alunos daquele curso
    if (curso) {
      whereHorario = { ...whereHorario, tipo: "aluno", aluno: { blocoEstudo: curso } }
    }

    const presencas = await db.presenca.findMany({
      where: whereHorario,
      orderBy: { horario: "desc" },
      include: {
        paciente:    { select: { nome: true, codigoBarras: true } },
        aluno:       { select: { nome: true, codigoBarras: true, blocoEstudo: true } },
        instrutor:   { select: { nome: true, codigoBarras: true } },
        trabalhador: { select: { nome: true, codigoBarras: true } },
      },
    })



    const resultado = presencas.map((p) => {
      const pessoa = p.paciente ?? p.aluno ?? p.instrutor ?? p.trabalhador
      const dt = new Date(p.horario)
      return {
        id: p.id,
        pessoaNome: pessoa?.nome ?? "—",
        tipo: p.tipo,
        tipoLabel: TIPO_LABEL[p.tipo] ?? p.tipo,
        codigoBarras: pessoa?.codigoBarras ?? p.codigoBarras,
        data: dt.toLocaleDateString("pt-BR"),
        horario: dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        horarioISO: p.horario,
      }
    })

    return NextResponse.json(resultado)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro ao buscar relatório" }, { status: 500 })
  }
}