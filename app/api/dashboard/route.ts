// app/api/dashboard/route.ts
import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export const runtime = "nodejs"

export async function GET() {
  try {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    const [
      totalPacientes,
      totalAlunos,
      totalInstrutores,
      totalTrabalhadores,
      pacientesAtivos,
      alunosAtivos,
      instrutoresAtivos,
      trabalhadoresAtivos,
      presencasHoje,
      ultimasPresencas,
    ] = await Promise.all([
      db.paciente.count(),
      db.aluno.count(),
      db.instrutor.count(),
      db.trabalhador.count(),
      db.paciente.count({ where: { ativo: true } }),
      db.aluno.count({ where: { ativo: true } }),
      db.instrutor.count({ where: { ativo: true } }),
      db.trabalhador.count({ where: { ativo: true } }),
      db.presenca.findMany({
        where: { horario: { gte: hoje } },
      }),
      db.presenca.findMany({
        where: { horario: { gte: hoje } },
        orderBy: { horario: "desc" },
        take: 10,
        include: {
          paciente: { select: { nome: true } },
          aluno: { select: { nome: true } },
          instrutor: { select: { nome: true } },
          trabalhador: { select: { nome: true } },
        },
      }),
    ])

    const presencasPorTipo = presencasHoje.reduce(
      (acc, p) => {
        acc[p.tipo] = (acc[p.tipo] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    return NextResponse.json({
      stats: {
        totalPessoasAtendidas: totalPacientes + totalAlunos,
        totalPessoasAtendidasDesc: `${totalAlunos} Alunos, ${totalPacientes} Pacientes, ${pacientesAtivos + alunosAtivos} Ativos`,
        totalEquipe: totalInstrutores + totalTrabalhadores,
        totalEquipeDesc: `${totalInstrutores} Instrutores, ${totalTrabalhadores} Trabalhadores, ${instrutoresAtivos + trabalhadoresAtivos} Ativos`,
        totalPresencasHoje: presencasHoje.length,
        presencasHojeDesc: Object.entries(presencasPorTipo)
          .map(([tipo, qtd]) => `${qtd} ${tipo}s`)
          .join(", "),
        pacientesHoje: presencasPorTipo["paciente"] || 0,
      },
      ultimasPresencas: ultimasPresencas.map((p) => ({
        id: p.id,
        tipo: p.tipo,
        horario: new Date(p.horario).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        codigoBarras: p.codigoBarras,
        pessoaNome:
          p.paciente?.nome ||
          p.aluno?.nome ||
          p.instrutor?.nome ||
          p.trabalhador?.nome ||
          "Desconhecido",
      })),
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro ao buscar dados" }, { status: 500 })
  }
}