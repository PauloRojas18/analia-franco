// app/api/pacientes/route.ts
import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export const runtime = "nodejs"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search") ?? ""

    const pacientes = await db.paciente.findMany({
      where: search ? {
        OR: [
          { nome: { contains: search, mode: "insensitive" } },
          { telefone: { contains: search } },
          { codigoBarras: { contains: search, mode: "insensitive" } },
        ],
      } : undefined,
      orderBy: { nome: "asc" },
    })

    return NextResponse.json(pacientes)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro ao buscar pacientes" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { nome, especialidade, telefone, endereco } = body

    if (!nome || !especialidade || !telefone || !endereco) {
      return NextResponse.json({ error: "Todos os campos são obrigatórios" }, { status: 400 })
    }

    // Gera próximo código de barras
    const ultimo = await db.paciente.findFirst({
      where: { codigoBarras: { startsWith: "CEFASP" } },
      orderBy: { codigoBarras: "desc" },
    })

    const proximoNum = ultimo
      ? String(parseInt(ultimo.codigoBarras.replace("CEFASP", "")) + 1).padStart(6, "0")
      : "000001"
    const codigoBarras = `CEFASP${proximoNum}`

    const paciente = await db.paciente.create({
      data: { nome, especialidade, telefone, endereco, codigoBarras },
    })

    return NextResponse.json(paciente, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro ao criar paciente" }, { status: 500 })
  }
}