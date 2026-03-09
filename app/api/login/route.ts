import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { email, senha } = body;

    const usuario = await db.usuario.findUnique({
      where: { email },
    });

    if (!usuario || usuario.senha !== senha) {
      return NextResponse.json(
        { error: "Credenciais inválidas" },
        { status: 401 }
      );
    }

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro no servidor" },
      { status: 500 }
    );
  }
}

