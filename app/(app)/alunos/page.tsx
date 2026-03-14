"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Pencil,
  UserX,
  UserCheck,
  Trash2,
  Loader2,
  X,
  Link2,
  Unlink,
  IdCard,
  ChevronDown,
  Check,
} from "lucide-react";
import ModalCracha from "@/components/ModalCracha";

interface Aluno {
  id: number;
  nome: string;
  blocoEstudo: string;
  telefone: string;
  endereco: string;
  ativo: boolean;
  codigoBarras: string;
}

interface FormData {
  nome: string;
  blocoEstudo: string;
  telefone: string;
  endereco: string;
}

interface Vinculo {
  tipo: string;
  nome: string;
  codigoBarras: string;
}

interface ResultadoBusca {
  tipo: string;
  nome: string;
  codigoBarras: string;
}

interface CrachaInfo {
  nome: string;
  tipo: string;
  codigoBarras: string;
  subtitulo?: string;
}

const FORM_VAZIO: FormData = {
  nome: "",
  blocoEstudo: "",
  telefone: "",
  endereco: "",
};

const TIPO_LABEL: Record<string, string> = {
  paciente: "Paciente",
  aluno: "Aluno",
  instrutor: "Instrutor",
  trabalhador: "Trabalhador",
};

const CURSOS = [
  "Conheça o Espiritísmo",
  "Nosso Lar",
  "Passe",
  "Corrente Magnética",
  "Vibração",
];

const campos = [
  {
    key: "nome" as const,
    label: "Nome",
    placeholder: "Nome completo",
    icon: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  },
  {
    key: "telefone" as const,
    label: "Telefone",
    placeholder: "(11) 99999-9999",
    icon: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12 19.79 19.79 0 0 1 1.1 3.38 2 2 0 0 1 3.08 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16z",
  },
] as const;

export default function AlunosPage() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Aluno | null>(null);
  const [form, setForm] = useState<FormData>(FORM_VAZIO);
  const [erroForm, setErroForm] = useState("");
  const [confirmandoId, setConfirmandoId] = useState<number | null>(null);
  const [vinculos, setVinculos] = useState<Vinculo[]>([]);
  const [buscaVinculo, setBuscaVinculo] = useState("");
  const [resultadosBusca, setResultadosBusca] = useState<ResultadoBusca[]>([]);
  const [buscandoVinculo, setBuscandoVinculo] = useState(false);
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const [crachaAberto, setCrachaAberto] = useState<CrachaInfo | null>(null);
  const [cursoAberto, setCursoAberto] = useState(false);

  const buscaRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const cursoRef = useRef<HTMLDivElement>(null);

  // ── Fechar dropdown de curso ao clicar fora ──────────────────────────────
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (cursoRef.current && !cursoRef.current.contains(e.target as Node))
        setCursoAberto(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Fechar dropdown de vínculo ao clicar fora ────────────────────────────
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        buscaRef.current &&
        !buscaRef.current.contains(e.target as Node)
      )
        setMostrarDropdown(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Buscar alunos ────────────────────────────────────────────────────────
  const buscarAlunos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/alunos?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      setAlunos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erro ao buscar alunos", err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(buscarAlunos, 300);
    return () => clearTimeout(t);
  }, [buscarAlunos]);

  // ── Buscar vínculos ──────────────────────────────────────────────────────
  const buscarVinculos = useCallback(async (codigoBarras: string) => {
    try {
      const res = await fetch(`/api/vinculos/lista?codigoBarras=${codigoBarras}`);
      if (res.ok) setVinculos(await res.json());
    } catch (err) {
      console.error("Erro ao buscar vínculos", err);
    }
  }, []);

  useEffect(() => {
    if (buscaVinculo.length < 2) {
      setResultadosBusca([]);
      return;
    }
    const t = setTimeout(async () => {
      setBuscandoVinculo(true);
      try {
        const res = await fetch(
          `/api/vinculos?nome=${encodeURIComponent(buscaVinculo)}&excluirTipo=aluno`,
        );
        const data = await res.json();
        setResultadosBusca(
          data.filter(
            (r: ResultadoBusca) =>
              r.tipo !== "instrutor" &&
              !vinculos.some((v) => v.codigoBarras === r.codigoBarras),
          ),
        );
        setMostrarDropdown(true);
      } catch (err) {
        console.error("Erro na busca", err);
      } finally {
        setBuscandoVinculo(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [buscaVinculo, vinculos]);

  // ── Ações do modal ───────────────────────────────────────────────────────
  function abrirNovo() {
    setEditando(null);
    setForm(FORM_VAZIO);
    setErroForm("");
    setVinculos([]);
    setBuscaVinculo("");
    setCursoAberto(false);
    setModalAberto(true);
  }

  function abrirEditar(a: Aluno) {
    setEditando(a);
    setForm({
      nome: a.nome,
      blocoEstudo: a.blocoEstudo,
      telefone: a.telefone,
      endereco: a.endereco,
    });
    setErroForm("");
    setVinculos([]);
    setBuscaVinculo("");
    setCursoAberto(false);
    setModalAberto(true);
    buscarVinculos(a.codigoBarras);
  }

  function fecharModal() {
    setModalAberto(false);
    setEditando(null);
    setForm(FORM_VAZIO);
    setErroForm("");
    setVinculos([]);
    setBuscaVinculo("");
    setResultadosBusca([]);
    setCursoAberto(false);
  }

  async function adicionarVinculo(resultado: ResultadoBusca) {
    if (!editando) {
      setVinculos((prev) => [...prev, resultado]);
      setBuscaVinculo("");
      setResultadosBusca([]);
      setMostrarDropdown(false);
      return;
    }
    try {
      await fetch("/api/vinculos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigoBarras: editando.codigoBarras,
          tipoPrincipal: "aluno",
          codigoSecund: resultado.codigoBarras,
          tipoSecund: resultado.tipo,
        }),
      });
      setVinculos((prev) => [...prev, resultado]);
      setBuscaVinculo("");
      setResultadosBusca([]);
      setMostrarDropdown(false);
    } catch (err) {
      console.error("Erro ao vincular", err);
    }
  }

  async function removerVinculo(vinculo: Vinculo) {
    if (!editando) {
      setVinculos((prev) => prev.filter((v) => v.codigoBarras !== vinculo.codigoBarras));
      return;
    }
    try {
      await fetch("/api/vinculos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigoBarras: editando.codigoBarras,
          tipoSecund: vinculo.tipo,
        }),
      });
      setVinculos((prev) => prev.filter((v) => v.codigoBarras !== vinculo.codigoBarras));
    } catch (err) {
      console.error("Erro ao remover vínculo", err);
    }
  }

  async function salvar() {
    if (!form.nome || !form.blocoEstudo || !form.telefone || !form.endereco) {
      setErroForm("Preencha todos os campos.");
      return;
    }
    setSalvando(true);
    setErroForm("");
    try {
      const res = await fetch(
        editando ? `/api/alunos/${editando.id}` : "/api/alunos",
        {
          method: editando ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      );
      if (!res.ok) {
        const d = await res.json();
        setErroForm(d.error || "Erro ao salvar.");
        return;
      }
      const salvo = await res.json();
      if (!editando && vinculos.length > 0) {
        await Promise.all(
          vinculos.map((v) =>
            fetch("/api/vinculos", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                codigoBarras: salvo.codigoBarras,
                tipoPrincipal: "aluno",
                codigoSecund: v.codigoBarras,
                tipoSecund: v.tipo,
              }),
            }),
          ),
        );
      }
      fecharModal();
      buscarAlunos();
    } catch {
      setErroForm("Erro de conexão.");
    } finally {
      setSalvando(false);
    }
  }

  async function toggleAtivo(a: Aluno) {
    try {
      await fetch(`/api/alunos/${a.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ativo: !a.ativo }),
      });
      buscarAlunos();
    } catch (err) {
      console.error(err);
    }
  }

  async function deletar(id: number) {
    try {
      await fetch(`/api/alunos/${id}`, { method: "DELETE" });
      setConfirmandoId(null);
      buscarAlunos();
    } catch (err) {
      console.error(err);
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Alunos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie o cadastro de alunos da casa espírita
          </p>
        </div>
        <Button onClick={abrirNovo}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Aluno
        </Button>
      </div>

      {/* Busca */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, bloco ou código..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabela */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">
            {loading ? "Carregando..." : `${alunos.length} aluno(s) encontrado(s)`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : alunos.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Nenhum aluno encontrado.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Nome</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden md:table-cell">Curso</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden md:table-cell">Telefone</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden lg:table-cell">Endereço</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Código de Barras</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {alunos.map((a) => (
                    <tr
                      key={a.id}
                      className="border-b border-border last:border-0 transition-colors"
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--secondary)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td className="px-4 py-3 font-medium">{a.nome}</td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <Badge variant="secondary">{a.blocoEstudo}</Badge>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">{a.telefone}</td>
                      <td className="px-4 py-3 hidden lg:table-cell max-w-[200px] truncate text-muted-foreground">{a.endereco}</td>
                      <td className="px-4 py-3">
                        <Badge variant={a.ativo ? "default" : "outline"}>
                          {a.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell font-mono text-xs text-muted-foreground">{a.codigoBarras}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="default"
                            size="icon"
                            title="Ver Crachá"
                            style={{ cursor: "pointer" }}
                            onClick={() =>
                              setCrachaAberto({
                                nome: a.nome,
                                tipo: "aluno",
                                codigoBarras: a.codigoBarras,
                                subtitulo: a.blocoEstudo,
                              })
                            }
                          >
                            <IdCard className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" style={{ cursor: "pointer" }} onClick={() => abrirEditar(a)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" style={{ cursor: "pointer" }} onClick={() => toggleAtivo(a)}>
                            {a.ativo ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                          </Button>
                          {confirmandoId === a.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => deletar(a.id)}
                                className="h-8 px-3 text-xs font-semibold rounded-md"
                                style={{ background: "var(--destructive)", color: "#fff", border: "none", cursor: "pointer" }}
                              >
                                Confirmar
                              </button>
                              <button
                                onClick={() => setConfirmandoId(null)}
                                className="h-8 px-3 text-xs font-semibold rounded-md"
                                style={{ background: "var(--muted)", color: "var(--muted-foreground)", border: "1px solid var(--border)", cursor: "pointer" }}
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="icon"
                              style={{ color: "var(--destructive)", cursor: "pointer" }}
                              onClick={() => setConfirmandoId(a.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Modal criar / editar ──────────────────────────────────────────── */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div
            className="absolute inset-0"
            style={{ background: "color-mix(in srgb, var(--sidebar-bg) 75%, transparent)" }}
            onClick={fecharModal}
          />

          {/* Painel */}
          <div
            className="relative z-10 w-full max-w-md flex flex-col"
            style={{
              maxHeight: "90vh",
              background: "color-mix(in srgb, var(--card) 92%, transparent)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid var(--border)",
              borderRadius: "calc(var(--radius) * 2)",
              boxShadow: "0 24px 48px rgba(0,0,0,0.35), 0 1px 0 rgba(255,255,255,0.06) inset",
            }}
          >
            <div className="p-8 overflow-y-auto modal-scroll flex-1">
              {/* Título */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold" style={{ color: "var(--primary)", letterSpacing: "-0.3px" }}>
                  {editando ? "Editar Aluno" : "Novo Aluno"}
                </h2>
                <button
                  onClick={fecharModal}
                  className="flex h-8 w-8 items-center justify-center rounded-md"
                  style={{ background: "var(--muted)", color: "var(--muted-foreground)", border: "none", cursor: "pointer" }}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Campos de texto */}
              <div className="flex flex-col gap-4">
                {/* Nome */}
                {campos.map(({ key, label, placeholder, icon }) => (
                  <div key={key} className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
                      {label}
                    </label>
                    <div className="relative">
                      <svg
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                        width="15" height="15" viewBox="0 0 24 24"
                        fill="none" stroke="var(--muted-foreground)" strokeWidth="2"
                      >
                        <path d={icon} />
                      </svg>
                      <input
                        type="text"
                        placeholder={placeholder}
                        value={form[key]}
                        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 text-sm transition-all outline-none"
                        style={{
                          background: "var(--background)",
                          border: "1px solid var(--border)",
                          color: "var(--foreground)",
                          borderRadius: "var(--radius)",
                        }}
                      />
                    </div>
                  </div>
                ))}

                {/* ── Select customizado: Curso ───────────────────────────── */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
                    Curso
                  </label>
                  <div ref={cursoRef} className="relative">
                    {/* Botão que abre o dropdown */}
                    <button
                      type="button"
                      onClick={() => setCursoAberto((v) => !v)}
                      className="w-full flex items-center gap-2.5 pl-10 pr-4 py-3 text-sm text-left outline-none transition-all"
                      style={{
                        background: "var(--background)",
                        border: `1px solid ${cursoAberto ? "var(--primary)" : "var(--border)"}`,
                        color: form.blocoEstudo ? "var(--foreground)" : "var(--muted-foreground)",
                        borderRadius: "var(--radius)",
                        cursor: "pointer",
                      }}
                    >
                      {/* Ícone escudo/curso */}
                      <svg
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                        width="15" height="15" viewBox="0 0 24 24"
                        fill="none" stroke="var(--muted-foreground)" strokeWidth="2"
                      >
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 12l2 2 4-4" />
                      </svg>
                      <span className="flex-1">
                        {form.blocoEstudo || "Selecione um curso..."}
                      </span>
                      {/* Chevron animado */}
                      <ChevronDown
                        className="h-4 w-4 flex-shrink-0 transition-transform duration-200"
                        style={{
                          color: "var(--muted-foreground)",
                          transform: cursoAberto ? "rotate(180deg)" : "rotate(0deg)",
                        }}
                      />
                    </button>

                    {/* Lista de opções */}
                    {cursoAberto && (
                      <div
                        className="absolute top-full left-0 right-0 z-20 mt-1"
                        style={{
                          background: "color-mix(in srgb, var(--card) 96%, transparent)",
                          backdropFilter: "blur(16px)",
                          WebkitBackdropFilter: "blur(16px)",
                          border: "1px solid var(--border)",
                          borderRadius: "var(--radius)",
                          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                          padding: "6px",
                        }}
                      >
                        {CURSOS.map((curso) => {
                          const selecionado = form.blocoEstudo === curso;
                          return (
                            <button
                              key={curso}
                              type="button"
                              onClick={() => {
                                setForm({ ...form, blocoEstudo: curso });
                                setCursoAberto(false);
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-left rounded-md transition-colors"
                              style={{
                                background: selecionado ? "var(--secondary)" : "none",
                                border: "none",
                                cursor: "pointer",
                                color: selecionado ? "var(--foreground)" : "var(--foreground)",
                                fontWeight: selecionado ? 500 : 400,
                              }}
                              onMouseEnter={(e) => {
                                if (!selecionado) e.currentTarget.style.background = "var(--secondary)";
                              }}
                              onMouseLeave={(e) => {
                                if (!selecionado) e.currentTarget.style.background = "none";
                              }}
                            >
                              {/* Espaço para o checkmark */}
                              <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center">
                                {selecionado && (
                                  <Check className="h-3.5 w-3.5" style={{ color: "var(--primary)" }} />
                                )}
                              </span>
                              {curso}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
                {/* ── fim select curso ────────────────────────────────────── */}
              </div>

              {/* Divisor */}
              <div className="mt-6" style={{ borderTop: "1px solid var(--border)" }} />

              {/* Vínculos */}
              <div className="mt-5 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Link2 className="h-4 w-4" style={{ color: "var(--primary)" }} />
                  <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
                    Vínculos (crachá único)
                  </span>
                </div>

                {vinculos.length > 0 && (
                  <div className="flex flex-col gap-2">
                    {vinculos.map((v) => (
                      <div
                        key={v.codigoBarras}
                        className="flex items-center justify-between px-3 py-2.5 rounded-md"
                        style={{ background: "var(--background)", border: "1px solid var(--border)" }}
                      >
                        <div>
                          <span className="text-sm font-medium">{v.nome}</span>
                          <span className="ml-2 text-xs" style={{ color: "var(--muted-foreground)" }}>
                            {TIPO_LABEL[v.tipo]}
                          </span>
                        </div>
                        <button
                          onClick={() => removerVinculo(v)}
                          className="flex h-6 w-6 items-center justify-center rounded"
                          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--destructive)" }}
                        >
                          <Unlink className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Campo busca vínculo */}
                <div className="relative">
                  <svg
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    width="15" height="15" viewBox="0 0 24 24"
                    fill="none" stroke="var(--muted-foreground)" strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                  <input
                    ref={buscaRef}
                    type="text"
                    placeholder="Buscar pessoa para vincular..."
                    value={buscaVinculo}
                    onChange={(e) => setBuscaVinculo(e.target.value)}
                    onFocus={() => resultadosBusca.length > 0 && setMostrarDropdown(true)}
                    className="w-full pl-10 pr-4 py-3 text-sm outline-none"
                    style={{
                      background: "var(--background)",
                      border: "1px solid var(--border)",
                      color: "var(--foreground)",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  {buscandoVinculo && (
                    <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                  {mostrarDropdown && resultadosBusca.length > 0 && (
                    <div
                      ref={dropdownRef}
                      className="absolute top-full left-0 right-0 z-10 mt-1 overflow-hidden"
                      style={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius)",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                      }}
                    >
                      {resultadosBusca.map((r) => (
                        <button
                          key={`${r.tipo}-${r.codigoBarras}`}
                          onClick={() => adicionarVinculo(r)}
                          className="flex w-full items-center justify-between px-4 py-2.5 text-sm text-left"
                          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--foreground)" }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--secondary)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                        >
                          <span className="font-medium">{r.nome}</span>
                          <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                            {TIPO_LABEL[r.tipo]}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                  Alunos podem ser vinculados a pacientes e trabalhadores (não instrutores).
                </p>
              </div>

              {/* Erro */}
              {erroForm && (
                <p className="mt-4 text-sm" style={{ color: "var(--destructive)" }}>
                  {erroForm}
                </p>
              )}

              {/* Aviso código */}
              {!editando && (
                <p className="mt-3 text-xs" style={{ color: "var(--muted-foreground)" }}>
                  Código gerado automaticamente com prefixo{" "}
                  <span className="font-mono font-semibold">CEFAFA</span>.
                </p>
              )}

              {/* Divisor + Botões */}
              <div className="mt-6" style={{ borderTop: "1px solid var(--border)" }} />
              <div className="mt-6 flex gap-2">
                <button
                  onClick={fecharModal}
                  disabled={salvando}
                  className="flex-1 py-3 text-sm font-semibold"
                  style={{
                    background: "var(--muted)",
                    color: "var(--muted-foreground)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    cursor: salvando ? "not-allowed" : "pointer",
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={salvar}
                  disabled={salvando}
                  className="flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2"
                  style={{
                    background: salvando ? "var(--muted)" : "var(--primary)",
                    color: salvando ? "var(--muted-foreground)" : "var(--primary-foreground)",
                    border: "none",
                    borderRadius: "var(--radius)",
                    cursor: salvando ? "not-allowed" : "pointer",
                  }}
                >
                  {salvando && (
                    <svg
                      width="15" height="15" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" strokeWidth="2.5"
                      style={{ animation: "spin 0.8s linear infinite" }}
                    >
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                  )}
                  {editando ? "Salvar alterações" : "Criar aluno"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal crachá */}
      {crachaAberto && (
        <ModalCracha
          nome={crachaAberto.nome}
          tipo={crachaAberto.tipo}
          codigoBarras={crachaAberto.codigoBarras}
          subtitulo={crachaAberto.subtitulo}
          onFechar={() => setCrachaAberto(null)}
        />
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input::placeholder { color: var(--muted-foreground); opacity: 0.6; }
        .modal-scroll::-webkit-scrollbar { display: none; }
        .modal-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}