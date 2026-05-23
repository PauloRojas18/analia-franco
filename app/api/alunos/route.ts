// app/api/alunos/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") ?? "";

    const alunos = await db.aluno.findMany({
      where: search
        ? {
            OR: [
              { nome: { contains: search, mode: "insensitive" } },
              { blocoEstudo: { contains: search, mode: "insensitive" } },
              { telefone: { contains: search } },
              { codigoBarras: { contains: search, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: { nome: "asc" },
    });

    return NextResponse.json(alunos);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao buscar alunos" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const { nome, blocoEstudo, oficina, telefone } = await req.json();

    if (!nome || !blocoEstudo || !telefone) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios" },
        { status: 400 },
      );
    }

    const aluno = await db.$transaction(async (tx) => {
      const result = await tx.$queryRaw<[{ max_num: number | null }]>`
        SELECT MAX(CAST(SUBSTRING("codigoBarras" FROM 7) AS INTEGER)) AS max_num
        FROM "Aluno"
        WHERE "codigoBarras" ~ '^CEFAFA[0-9]{6}$'
      `;

      const proximoNum = String((result[0]?.max_num ?? 0) + 1).padStart(6, "0");

      return tx.aluno.create({
        data: {
          nome,
          blocoEstudo,
          oficina: blocoEstudo === "Assistidos" ? (oficina ?? null) : null,
          telefone,
          codigoBarras: `CEFAFA${proximoNum}`,
        },
      });
    });

    return NextResponse.json(aluno, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao criar aluno" }, { status: 500 });
  }
}