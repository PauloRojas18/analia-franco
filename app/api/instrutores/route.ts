// app/api/instrutores/route.ts
import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export const runtime = "nodejs"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search") ?? ""

    const instrutores = await db.instrutor.findMany({
      where: search ? {
        OR: [
          { nome: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { codigoBarras: { contains: search, mode: "insensitive" } },
        ],
      } : undefined,
      orderBy: { nome: "asc" },
    })

    return NextResponse.json(instrutores)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro ao buscar instrutores" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { nome, telefone, email } = body

    if (!nome || !telefone || !email) {
      return NextResponse.json({ error: "Todos os campos são obrigatórios" }, { status: 400 })
    }

    const ultimo = await db.instrutor.findFirst({
      where: { codigoBarras: { startsWith: "CEFAFI" } },
      orderBy: { codigoBarras: "desc" },
    })

    const proximoNum = ultimo
      ? String(parseInt(ultimo.codigoBarras.replace("CEFAFI", "")) + 1).padStart(6, "0")
      : "000001"
    const codigoBarras = `CEFAFI${proximoNum}`

    const instrutor = await db.instrutor.create({
      data: { nome, telefone, email, codigoBarras },
    })

    return NextResponse.json(instrutor, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro ao criar instrutor" }, { status: 500 })
  }
}