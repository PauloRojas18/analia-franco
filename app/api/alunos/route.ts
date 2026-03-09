// app/api/alunos/route.ts
import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export const runtime = "nodejs"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search") ?? ""

    const alunos = await db.aluno.findMany({
      where: search ? {
        OR: [
          { nome: { contains: search, mode: "insensitive" } },
          { telefone: { contains: search } },
          { codigoBarras: { contains: search, mode: "insensitive" } },
        ],
      } : undefined,
      orderBy: { nome: "asc" },
    })

    return NextResponse.json(alunos)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro ao buscar alunos" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { nome, telefone, endereco } = await req.json()

    if (!nome || !telefone || !endereco) {
      return NextResponse.json({ error: "Todos os campos são obrigatórios" }, { status: 400 })
    }

    const ultimo = await db.aluno.findFirst({
      where: { codigoBarras: { startsWith: "CEFASA" } },
      orderBy: { codigoBarras: "desc" },
    })

    const proximoNum = ultimo
      ? String(parseInt(ultimo.codigoBarras.replace("CEFASA", "")) + 1).padStart(6, "0")
      : "000001"

    const aluno = await db.aluno.create({
      data: { nome, telefone, endereco, codigoBarras: `CEFASA${proximoNum}` },
    })

    return NextResponse.json(aluno, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro ao criar aluno" }, { status: 500 })
  }
}