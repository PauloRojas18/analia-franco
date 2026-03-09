// app/api/vinculos/lista/route.ts
import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export const runtime = "nodejs"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const codigoBarras = searchParams.get("codigoBarras") ?? ""

  if (!codigoBarras) return NextResponse.json([])

  try {
    const vinculos = await db.vinculoPessoa.findMany({
      where: { codigoBarras },
    })

    const resultado = await Promise.all(
      vinculos.map(async (v) => {
        let nome = ""
        if (v.tipoSecund === "paciente") {
          const p = await db.paciente.findUnique({ where: { codigoBarras: v.codigoSecund } })
          nome = p?.nome ?? ""
        } else if (v.tipoSecund === "aluno") {
          const p = await db.aluno.findUnique({ where: { codigoBarras: v.codigoSecund } })
          nome = p?.nome ?? ""
        } else if (v.tipoSecund === "instrutor") {
          const p = await db.instrutor.findUnique({ where: { codigoBarras: v.codigoSecund } })
          nome = p?.nome ?? ""
        } else if (v.tipoSecund === "trabalhador") {
          const p = await db.trabalhador.findUnique({ where: { codigoBarras: v.codigoSecund } })
          nome = p?.nome ?? ""
        }
        return { tipo: v.tipoSecund, nome, codigoBarras: v.codigoSecund }
      })
    )

    return NextResponse.json(resultado.filter(r => r.nome !== ""))
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro ao buscar vínculos" }, { status: 500 })
  }
}