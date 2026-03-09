// app/api/trabalhadores/route.ts
import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export const runtime = "nodejs"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search") ?? ""

    const trabalhadores = await db.trabalhador.findMany({
      where: search ? {
        OR: [
          { nome: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { codigoBarras: { contains: search, mode: "insensitive" } },
        ],
      } : undefined,
      orderBy: { nome: "asc" },
    })

    return NextResponse.json(trabalhadores)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro ao buscar trabalhadores" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { nome, telefone, email } = await req.json()

    if (!nome || !telefone || !email) {
      return NextResponse.json({ error: "Todos os campos são obrigatórios" }, { status: 400 })
    }

    const ultimo = await db.trabalhador.findFirst({
      where: { codigoBarras: { startsWith: "CEFAST" } },
      orderBy: { codigoBarras: "desc" },
    })

    const proximoNum = ultimo
      ? String(parseInt(ultimo.codigoBarras.replace("CEFAST", "")) + 1).padStart(6, "0")
      : "000001"

    const trabalhador = await db.trabalhador.create({
      data: { nome, telefone, email, codigoBarras: `CEFAST${proximoNum}` },
    })

    return NextResponse.json(trabalhador, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro ao criar trabalhador" }, { status: 500 })
  }
}