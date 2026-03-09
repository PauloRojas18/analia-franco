// app/api/presenca/resolver/route.ts
import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export const runtime = "nodejs"

// Resolve um código de barras para todos os vínculos da pessoa
export async function POST(req: Request) {
  try {
    const { codigoBarras } = await req.json()

    const vinculos: { tipo: string; nome: string; codigoBarras: string }[] = []

    // Busca em todas as tabelas
    const [paciente, aluno, instrutor, trabalhador] = await Promise.all([
      db.paciente.findUnique({ where: { codigoBarras } }),
      db.aluno.findUnique({ where: { codigoBarras } }),
      db.instrutor.findUnique({ where: { codigoBarras } }),
      db.trabalhador.findUnique({ where: { codigoBarras } }),
    ])

    if (paciente) vinculos.push({ tipo: "paciente",    nome: paciente.nome,    codigoBarras: paciente.codigoBarras })
    if (aluno)    vinculos.push({ tipo: "aluno",       nome: aluno.nome,       codigoBarras: aluno.codigoBarras })
    if (instrutor) vinculos.push({ tipo: "instrutor",  nome: instrutor.nome,   codigoBarras: instrutor.codigoBarras })
    if (trabalhador) vinculos.push({ tipo: "trabalhador", nome: trabalhador.nome, codigoBarras: trabalhador.codigoBarras })

    // Busca também vínculos secundários via VinculoPessoa
    const vinculosSecund = await db.vinculoPessoa.findMany({
      where: { codigoBarras },
    })

    for (const v of vinculosSecund) {
      const jaAdicionado = vinculos.some(vv => vv.tipo === v.tipoSecund)
      if (!jaAdicionado) {
        // Busca o nome da pessoa vinculada
        let nome = ""
        if (v.tipoSecund === "paciente") {
          const p = await db.paciente.findUnique({ where: { codigoBarras: v.codigoSecund } })
          if (p) nome = p.nome
        } else if (v.tipoSecund === "aluno") {
          const p = await db.aluno.findUnique({ where: { codigoBarras: v.codigoSecund } })
          if (p) nome = p.nome
        } else if (v.tipoSecund === "instrutor") {
          const p = await db.instrutor.findUnique({ where: { codigoBarras: v.codigoSecund } })
          if (p) nome = p.nome
        } else if (v.tipoSecund === "trabalhador") {
          const p = await db.trabalhador.findUnique({ where: { codigoBarras: v.codigoSecund } })
          if (p) nome = p.nome
        }
        if (nome) vinculos.push({ tipo: v.tipoSecund, nome, codigoBarras: v.codigoSecund })
      }
    }

    if (vinculos.length === 0) {
      return NextResponse.json({ error: "Código não encontrado" }, { status: 404 })
    }

    return NextResponse.json({ vinculos })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro ao resolver código" }, { status: 500 })
  }
}