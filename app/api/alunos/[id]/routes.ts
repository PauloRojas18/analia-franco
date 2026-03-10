// app/api/alunos/[id]/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { nome, blocoEstudo, telefone, endereco } = await req.json();

    const aluno = await db.aluno.update({
      where: { id: parseInt(id) },
      data: { nome, blocoEstudo, telefone, endereco },
    });

    return NextResponse.json(aluno);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao atualizar aluno" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { ativo } = await req.json();

    const aluno = await db.aluno.update({
      where: { id: parseInt(id) },
      data: { ativo },
    });

    return NextResponse.json(aluno);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao atualizar status" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const aluno = await db.aluno.findUnique({ where: { id: parseInt(id) } });
    if (!aluno)
      return NextResponse.json(
        { error: "Aluno não encontrado" },
        { status: 404 },
      );

    await db.presenca.deleteMany({ where: { alunoId: parseInt(id) } });
    await db.vinculoPessoa.deleteMany({
      where: {
        OR: [
          { codigoBarras: aluno.codigoBarras },
          { codigoSecund: aluno.codigoBarras },
        ],
      },
    });
    await db.aluno.delete({ where: { id: parseInt(id) } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao remover aluno" },
      { status: 500 },
    );
  }
}
