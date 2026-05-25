// app/(app)/relatorios/page.tsx
"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Download, Printer, FileText, Users, GraduationCap,
  Calendar, Loader2, Briefcase, BookOpen, Search,
  ChevronDown, Check, ClipboardList, UserSquare2, Trash2, HandHeart,
} from "lucide-react"
import JsBarcode from "jsbarcode"

// ─── Tipos ──────────────────────────────────────────────────────────────────

type TabType   = "todos" | "paciente" | "aluno" | "assistido" | "instrutor" | "trabalhador"
type SecaoType = "presencas" | "cadastros"

interface Presenca {
  id: number
  pessoaNome: string
  tipo: string
  tipoLabel: string
  codigoBarras: string
  data: string
  horario: string
  horarioISO: string
  curso?: string | null
}

interface Pessoa {
  id: number
  nome: string
  tipo: string
  tipoLabel: string
  codigoBarras: string
  curso?: string | null
}

// ─── Constantes ──────────────────────────────────────────────────────────────

const BADGE_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  paciente:    "default",
  aluno:       "secondary",
  assistido:   "secondary",
  instrutor:   "outline",
  trabalhador: "outline",
}

const TIPO_COR: Record<string, { bg: string; accent: string; label: string }> = {
  paciente:       { bg: "#1e6b94", accent: "#1a9e7a", label: "Paciente"    },
  aluno:          { bg: "#6d28d9", accent: "#a78bfa", label: "Aluno"       },
  aluno_externo:  { bg: "#1d4e8f", accent: "#0e8476", label: "Aluno"       },
  instrutor:      { bg: "#b45309", accent: "#fbbf24", label: "Instrutor"   },
  trabalhador:    { bg: "#ea580c", accent: "#fdba74", label: "Trabalhador" },
}

const CURSOS = ["Conheça o Espiritismo", "Nosso Lar", "Passe", "Corrente Magnética", "Vibração"]

function hoje(): string {
  return new Date().toISOString().slice(0, 10)
}

// ─── Helpers de filtragem ─────────────────────────────────────────────────────

function isAssistido(p: { tipo: string; curso?: string | null }) {
  return p.tipo === "aluno" && p.curso === "Assistidos"
}

function matchTab<T extends { tipo: string; curso?: string | null }>(item: T, tab: TabType): boolean {
  if (tab === "todos")       return true
  if (tab === "assistido")   return isAssistido(item)
  if (tab === "aluno")       return item.tipo === "aluno" && !isAssistido(item)
  return item.tipo === tab
}

// ─── Utilidades de impressão ──────────────────────────────────────────────────

function gerarBarrasSVG(codigo: string): string {
  const svgNode = document.createElementNS("http://www.w3.org/2000/svg", "svg")
  JsBarcode(svgNode, codigo, {
    format: "CODE128", width: 2, height: 40, displayValue: false, margin: 0,
  })
  return svgNode.outerHTML
}

function construirHTMLCrachas(
  lista: { nome: string; tipo: string; tipoLabel: string; codigoBarras: string; curso?: string | null }[],
  titulo: string,
): string {
  const cartoes = lista.map((p) => {
    // Resolver o tipoKey considerando assistidos e alunos externos
    const isAssist = p.tipo === "aluno" && p.curso === "Assistidos"
    const tipoKey = p.tipo === "aluno" && !isAssist ? "aluno_externo" : p.tipo
    
    const cor = TIPO_COR[tipoKey] ?? { bg: "#333", accent: "#666", label: p.tipoLabel }
    const barrasSVG = gerarBarrasSVG(p.codigoBarras)
    const iniciais = p.nome.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase()
    return `
    <div class="cracha">
      <div class="cracha-header" style="background: linear-gradient(135deg, ${cor.bg} 0%, ${cor.accent} 100%);">
        <div class="org-nome">Obras Sociais Anália Franco</div>
        <div class="avatar">${iniciais}</div>
        <div class="tipo-badge">${cor.label.toUpperCase()}</div>
      </div>
      <div class="cracha-body">
        <div class="nome">${p.nome}</div>
        <div class="divider"></div>
        <div class="barras">${barrasSVG}</div>
        <div class="codigo">${p.codigoBarras}</div>
      </div>
      <div class="cracha-footer" style="background: ${cor.bg}18; border-top: 2px solid ${cor.bg}25;">
        <div class="footer-text" style="color: ${cor.bg}">Centro Espírita Fraternidade Anália Franco</div>
      </div>
    </div>`
  }).join("")

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${titulo}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f0f2f5; padding: 24px; }
    .grade { display: flex; flex-wrap: wrap; gap: 20px; justify-content: center; }
    .cracha { width: 240px; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.15), 0 1px 4px rgba(0,0,0,0.1); background: #fff; break-inside: avoid; page-break-inside: avoid; }
    .cracha-header { padding: 20px 16px 16px; text-align: center; }
    .org-nome { font-size: 9px; font-weight: 700; color: rgba(255,255,255,0.85); letter-spacing: 1px; text-transform: uppercase; margin-bottom: 12px; }
    .avatar { width: 56px; height: 56px; border-radius: 50%; background: rgba(255,255,255,0.25); border: 2px solid rgba(255,255,255,0.5); color: #fff; font-size: 20px; font-weight: 700; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px; }
    .tipo-badge { display: inline-block; font-size: 9px; font-weight: 700; color: #fff; padding: 3px 10px; border-radius: 20px; letter-spacing: 1.5px; background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.4); }
    .cracha-body { padding: 16px; text-align: center; }
    .nome { font-size: 14px; font-weight: 700; color: #1a1a2e; line-height: 1.3; margin-bottom: 8px; }
    .divider { height: 1px; background: #eee; margin: 12px 0; }
    .barras { display: flex; justify-content: center; margin-bottom: 6px; opacity: 0.85; }
    .barras svg { max-width: 100%; height: 32px; }
    .codigo { font-family: 'Courier New', monospace; font-size: 10px; color: #888; letter-spacing: 1px; }
    .cracha-footer { padding: 8px 12px; text-align: center; }
    .footer-text { font-size: 8px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; opacity: 0.75; }
    @media print {
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      body { background: white; padding: 10px; }
      .cracha { box-shadow: 0 0 0 1px #ddd; }
    }
  </style>
</head>
<body>
  <div class="grade">${cartoes}</div>
  <script>window.onload = () => setTimeout(() => window.print(), 300)</script>
</body>
</html>`
}

// ─── Labels de exibição ───────────────────────────────────────────────────────

function labelTipo(tipoLabel: string): string {
  if (tipoLabel === "Trabalhador") return "Voluntário"
  if (tipoLabel === "Assistidos")  return "T.A Silvana Maria"
  return tipoLabel
}

// ─── Sub-componente: Seção de Presenças ──────────────────────────────────────

function SecaoPresencas() {
  const [presencas, setPresencas]       = useState<Presenca[]>([])
  const [loading, setLoading]           = useState(true)
  const [selectedDate, setSelectedDate] = useState(hoje())
  const [activeTab, setActiveTab]       = useState<TabType>("todos")
  const [search, setSearch]             = useState("")
  const [filtroCurso, setFiltroCurso]   = useState("")
  const [cursoAberto, setCursoAberto]   = useState(false)
  const [confirmandoId, setConfirmandoId] = useState<number | null>(null)
  const cursoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (cursoRef.current && !cursoRef.current.contains(e.target as Node))
        setCursoAberto(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const buscar = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ data: selectedDate })
      if (filtroCurso) params.set("curso", filtroCurso)
      const res = await fetch(`/api/relatorios?${params}`)
      const data = await res.json()
      setPresencas(data)
    } catch (err) { console.error("Erro ao buscar relatório", err) }
    finally { setLoading(false) }
  }, [selectedDate, filtroCurso])

  useEffect(() => { buscar() }, [buscar])

  async function deletarPresenca(id: number) {
    try {
      await fetch(`/api/presenca/${id}`, { method: "DELETE" })
      setConfirmandoId(null)
      buscar()
    } catch (err) { console.error("Erro ao deletar presença", err) }
  }

  // Contagens por aba
  const contagem = (tab: TabType) =>
    tab === "todos"
      ? presencas.length
      : presencas.filter(p => matchTab(p, tab)).length

  const filtradasPorTipo = presencas.filter(p => matchTab(p, activeTab))

  const filtradas = search.trim()
    ? filtradasPorTipo.filter(p =>
        p.pessoaNome.toLowerCase().includes(search.toLowerCase()) ||
        p.codigoBarras.toLowerCase().includes(search.toLowerCase()) ||
        p.tipo.toLowerCase().includes(search.toLowerCase())
      )
    : filtradasPorTipo

  function exportarCSV() {
    const linhas = [
      ["Nome", "Tipo", "Data", "Horário", "Código"],
      ...filtradas.map(p => [p.pessoaNome, labelTipo(p.tipoLabel), p.data, p.horario, p.codigoBarras]),
    ]
    const csv = linhas.map(l => l.map(c => `"${c}"`).join(",")).join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url; a.download = `presencas-${selectedDate}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  const tabs: { key: TabType; label: string; icon: React.ElementType }[] = [
    { key: "todos",       label: `Todos (${contagem("todos")})`,             icon: FileText      },
    { key: "paciente",    label: `Pacientes (${contagem("paciente")})`,      icon: Users         },
    { key: "aluno",       label: `Alunos (${contagem("aluno")})`,            icon: BookOpen      },
    { key: "assistido",   label: `Assistidos (${contagem("assistido")})`,    icon: HandHeart     },
    { key: "instrutor",   label: `Instrutores (${contagem("instrutor")})`,   icon: GraduationCap },
    { key: "trabalhador", label: `Voluntários (${contagem("trabalhador")})`, icon: Briefcase     },
  ]

  const opcoesCurso = [
    { value: "", label: "Todos os cursos" },
    ...CURSOS.map(c => ({ value: c, label: c })),
  ]

  const mostrarFiltroCurso = activeTab === "aluno"

  return (
    <div className="flex flex-col gap-6">
      {/* Ações */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-end gap-4">
          {/* Data */}
          <div className="flex flex-col gap-2">
            <label htmlFor="relDate" className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4" />Data do Relatório
            </label>
            <Input
              id="relDate"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-[200px] h-[42px]"
            />
          </div>

          {/* Filtro de curso — só na aba Alunos */}
          {mostrarFiltroCurso && (
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <BookOpen className="h-4 w-4" />Filtrar por curso
              </label>
              <div ref={cursoRef} className="relative">
                <button
                  type="button"
                  onClick={() => setCursoAberto(v => !v)}
                  className="flex items-center gap-2.5 pl-10 pr-4 py-2.5 text-sm text-left outline-none transition-all"
                  style={{
                    width: 250,
                    background: "var(--background)",
                    border: `1px solid ${cursoAberto ? "var(--primary)" : "var(--border)"}`,
                    color: filtroCurso ? "var(--foreground)" : "var(--muted-foreground)",
                    borderRadius: "var(--radius)",
                    cursor: "pointer",
                  }}
                >
                  <svg className="absolute pointer-events-none"
                    style={{ left: 14, top: "50%", transform: "translateY(-50%)" }}
                    width="15" height="15" viewBox="0 0 24 24"
                    fill="none" stroke="var(--muted-foreground)" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 12l2 2 4-4" />
                  </svg>
                  <span className="flex-1">{filtroCurso || "Todos os cursos"}</span>
                  <ChevronDown className="h-4 w-4 flex-shrink-0 transition-transform duration-200"
                    style={{ color: "var(--muted-foreground)", transform: cursoAberto ? "rotate(180deg)" : "rotate(0deg)" }} />
                </button>
                {cursoAberto && (
                  <div className="absolute top-full left-0 z-20 mt-1"
                    style={{
                      width: 230,
                      background: "color-mix(in srgb, var(--card) 96%, transparent)",
                      backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
                      border: "1px solid var(--border)", borderRadius: "var(--radius)",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.18)", padding: "6px",
                    }}
                  >
                    {opcoesCurso.map(({ value, label }) => {
                      const sel = filtroCurso === value
                      return (
                        <button key={value || "__todos__"} type="button"
                          onClick={() => { setFiltroCurso(value); setCursoAberto(false) }}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-left rounded-md"
                          style={{ background: sel ? "var(--secondary)" : "none", border: "none", cursor: "pointer", color: "var(--foreground)", fontWeight: sel ? 500 : 400 }}
                          onMouseEnter={e => { if (!sel) e.currentTarget.style.background = "var(--secondary)" }}
                          onMouseLeave={e => { if (!sel) e.currentTarget.style.background = "none" }}
                        >
                          <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center">
                            {sel && <Check className="h-3.5 w-3.5" style={{ color: "var(--primary)" }} />}
                          </span>
                          {label}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          <p className="pb-1 text-sm text-muted-foreground">
            {loading ? "Carregando..." : `${presencas.length} presença(s) encontrada(s)`}
          </p>
        </div>

        <Button variant="outline" onClick={exportarCSV} disabled={loading || filtradas.length === 0}>
          <Download className="mr-2 h-4 w-4" />Exportar CSV
        </Button>
      </div>

      {/* Busca */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, código ou tipo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Abas */}
      <div className="flex gap-1 overflow-x-auto border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setFiltroCurso(""); setConfirmandoId(null) }}
            className={`flex shrink-0 items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tabela */}
      <Card className="shadow-sm">
        <CardContent className="pt-5">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : filtradas.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Nenhuma presença encontrada para esta data.
            </p>
          ) : (
            <div className="overflow-x-auto overflow-y-auto max-h-[60vh]">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10" style={{ background: "var(--card)" }}>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Nome</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Tipo</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Data</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Horário</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden md:table-cell">Código</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtradas.map((p) => (
                    <tr
                      key={`${p.tipo}-${p.id}`}
                      className="border-b border-border last:border-0 transition-colors"
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--secondary)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <td className="px-4 py-3 font-medium">{p.pessoaNome}</td>
                      <td className="px-4 py-3">
                        <Badge variant={BADGE_VARIANT[isAssistido(p) ? "assistido" : p.tipo] ?? "outline"}>
                          {isAssistido(p) ? "T.A Silvana Maria" : labelTipo(p.tipoLabel)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {p.data} —{" "}
                        <span className="text-sm font-medium text-foreground capitalize">
                          {new Date(selectedDate + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "long" })}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-sm">{p.horario}</td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground hidden md:table-cell">{p.codigoBarras}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {confirmandoId === p.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => deletarPresenca(p.id)}
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
                            <button
                              onClick={() => setConfirmandoId(p.id)}
                              className="flex h-8 w-8 items-center justify-center rounded-md transition-colors"
                              style={{ background: "none", border: "1px solid var(--border)", color: "var(--destructive)", cursor: "pointer" }}
                              title="Remover presença"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
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
    </div>
  )
}

// ─── Sub-componente: Seção de Cadastros ──────────────────────────────────────

function SecaoCadastros() {
  const [pessoas, setPessoas]           = useState<Pessoa[]>([])
  const [loading, setLoading]           = useState(true)
  const [activeTab, setActiveTab]       = useState<TabType>("todos")
  const [search, setSearch]             = useState("")
  const [filtroCurso, setFiltroCurso]   = useState("")
  const [cursoAberto, setCursoAberto]   = useState(false)
  const cursoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (cursoRef.current && !cursoRef.current.contains(e.target as Node))
        setCursoAberto(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const buscar = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filtroCurso) params.set("curso", filtroCurso)
      const res = await fetch(`/api/pessoas?${params}`)
      const data = await res.json()
      const ordenadas: Pessoa[] = [...data].sort((a, b) =>
        a.nome.localeCompare(b.nome, "pt-BR")
      )
      setPessoas(ordenadas)
    } catch (err) { console.error("Erro ao buscar cadastros", err) }
    finally { setLoading(false) }
  }, [filtroCurso])

  useEffect(() => { buscar() }, [buscar])

  const contagem = (tab: TabType) =>
    tab === "todos" ? pessoas.length : pessoas.filter(p => matchTab(p, tab)).length

  const filtradasPorTipo = pessoas.filter(p => matchTab(p, activeTab))

  const filtradas: Pessoa[] = search.trim()
    ? filtradasPorTipo.filter(p =>
        p.nome.toLowerCase().includes(search.toLowerCase()) ||
        p.codigoBarras.toLowerCase().includes(search.toLowerCase()) ||
        p.tipo.toLowerCase().includes(search.toLowerCase())
      )
    : filtradasPorTipo

  function exportarCSV() {
    const comCurso = activeTab === "aluno" || activeTab === "assistido" || activeTab === "todos"
    const linhas = [
      ["Nome", "Tipo", "Código de Barras", ...(comCurso ? ["Curso"] : [])],
      ...filtradas.map(p => [
        p.nome,
        isAssistido(p) ? "T.A Silvana Maria" : labelTipo(p.tipoLabel),
        p.codigoBarras,
        ...(comCurso ? [p.curso ?? ""] : []),
      ]),
    ]
    const csv = linhas.map(l => l.map(c => `"${c}"`).join(",")).join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url; a.download = `cadastros-${activeTab}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  function imprimirTodosCrachas() {
    const lista = filtradas.map(p => ({
      nome: p.nome,
      tipo: p.tipo,
      tipoLabel: p.tipoLabel,
      codigoBarras: p.codigoBarras,
      curso: p.curso ?? null,
    }))
    const titulo = activeTab === "todos" ? "Todos os Cadastrados" : filtradas[0]?.tipoLabel ?? activeTab
    const html = construirHTMLCrachas(lista, `Crachás — ${titulo}`)
    const w = window.open("", "_blank")
    w?.document.write(html); w?.document.close()
  }

  const tabs: { key: TabType; label: string; icon: React.ElementType }[] = [
    { key: "todos",       label: `Todos (${contagem("todos")})`,             icon: FileText      },
    { key: "paciente",    label: `Pacientes (${contagem("paciente")})`,      icon: Users         },
    { key: "aluno",       label: `Alunos (${contagem("aluno")})`,            icon: BookOpen      },
    { key: "assistido",   label: `Assistidos (${contagem("assistido")})`,    icon: HandHeart     },
    { key: "instrutor",   label: `Instrutores (${contagem("instrutor")})`,   icon: GraduationCap },
    { key: "trabalhador", label: `Voluntários (${contagem("trabalhador")})`, icon: Briefcase     },
  ]

  const opcoesCurso = [
    { value: "", label: "Todos os cursos" },
    ...CURSOS.map(c => ({ value: c, label: c })),
  ]

  const mostrarFiltroCurso = activeTab === "aluno"
  const mostrarColCurso    = activeTab === "aluno" || activeTab === "assistido" || activeTab === "todos"

  return (
    <div className="flex flex-col gap-6">
      {/* Ações */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-end gap-4">
          {mostrarFiltroCurso && (
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <BookOpen className="h-4 w-4" />Filtrar por curso
              </label>
              <div ref={cursoRef} className="relative">
                <button
                  type="button"
                  onClick={() => setCursoAberto(v => !v)}
                  className="flex items-center gap-2.5 pl-10 pr-4 py-2.5 text-sm text-left outline-none transition-all"
                  style={{
                    width: 250,
                    background: "var(--background)",
                    border: `1px solid ${cursoAberto ? "var(--primary)" : "var(--border)"}`,
                    color: filtroCurso ? "var(--foreground)" : "var(--muted-foreground)",
                    borderRadius: "var(--radius)",
                    cursor: "pointer",
                  }}
                >
                  <svg className="absolute pointer-events-none"
                    style={{ left: 14, top: "50%", transform: "translateY(-50%)" }}
                    width="15" height="15" viewBox="0 0 24 24"
                    fill="none" stroke="var(--muted-foreground)" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 12l2 2 4-4" />
                  </svg>
                  <span className="flex-1">{filtroCurso || "Todos os cursos"}</span>
                  <ChevronDown className="h-4 w-4 flex-shrink-0 transition-transform duration-200"
                    style={{ color: "var(--muted-foreground)", transform: cursoAberto ? "rotate(180deg)" : "rotate(0deg)" }} />
                </button>
                {cursoAberto && (
                  <div className="absolute top-full left-0 z-20 mt-1"
                    style={{
                      width: 230,
                      background: "color-mix(in srgb, var(--card) 96%, transparent)",
                      backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
                      border: "1px solid var(--border)", borderRadius: "var(--radius)",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.18)", padding: "6px",
                    }}
                  >
                    {opcoesCurso.map(({ value, label }) => {
                      const sel = filtroCurso === value
                      return (
                        <button key={value || "__todos__"} type="button"
                          onClick={() => { setFiltroCurso(value); setCursoAberto(false) }}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-left rounded-md"
                          style={{ background: sel ? "var(--secondary)" : "none", border: "none", cursor: "pointer", color: "var(--foreground)", fontWeight: sel ? 500 : 400 }}
                          onMouseEnter={e => { if (!sel) e.currentTarget.style.background = "var(--secondary)" }}
                          onMouseLeave={e => { if (!sel) e.currentTarget.style.background = "none" }}
                        >
                          <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center">
                            {sel && <Check className="h-3.5 w-3.5" style={{ color: "var(--primary)" }} />}
                          </span>
                          {label}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          <p className="pb-1 text-sm text-muted-foreground">
            {loading ? "Carregando..." : `${pessoas.length} pessoa(s) cadastrada(s)`}
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={exportarCSV} disabled={loading || filtradas.length === 0}>
            <Download className="mr-2 h-4 w-4" />Exportar CSV
          </Button>
          <Button onClick={imprimirTodosCrachas} disabled={loading || filtradas.length === 0}>
            <Printer className="mr-2 h-4 w-4" />Imprimir Todos os Crachás
          </Button>
        </div>
      </div>

      {/* Busca */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, código ou tipo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Abas */}
      <div className="flex gap-1 overflow-x-auto border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setFiltroCurso("") }}
            className={`flex shrink-0 items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tabela */}
      <Card className="shadow-sm">
        <CardContent className="pt-5">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : filtradas.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Nenhuma pessoa encontrada.
            </p>
          ) : (
            <div className="overflow-x-auto overflow-y-auto max-h-[60vh]">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10" style={{ background: "var(--card)" }}>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Nome</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Tipo</th>
                    {mostrarColCurso && (
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden md:table-cell">Curso</th>
                    )}
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden md:table-cell">Código</th>
                  </tr>
                </thead>
                <tbody>
                  {filtradas.map((p) => (
                    <tr
                      key={`${p.tipo}-${p.id}`}
                      className="border-b border-border last:border-0 transition-colors"
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--secondary)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <td className="px-4 py-3 font-medium">{p.nome}</td>
                      <td className="px-4 py-3">
                        <Badge variant={BADGE_VARIANT[isAssistido(p) ? "assistido" : p.tipo] ?? "outline"}>
                          {isAssistido(p) ? "T.A Silvana Maria" : labelTipo(p.tipoLabel)}
                        </Badge>
                      </td>
                      {mostrarColCurso && (
                        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                          {p.curso ?? <span className="italic opacity-50">—</span>}
                        </td>
                      )}
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground hidden md:table-cell">{p.codigoBarras}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function RelatoriosPage() {
  const [secao, setSecao] = useState<SecaoType>("presencas")

  const secoes: { key: SecaoType; label: string; descricao: string; icon: React.ElementType }[] = [
    { key: "presencas", label: "Presenças",  descricao: "Histórico de presenças por data",              icon: ClipboardList },
    { key: "cadastros", label: "Cadastros",  descricao: "Todas as pessoas registradas no sistema",      icon: UserSquare2   },
  ]

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Consulte presenças, cadastros e gere crachás
        </p>
      </div>

      {/* Alternador de seção */}
      <div
        className="inline-flex rounded-lg p-1 gap-1"
        style={{
          background: "var(--secondary)",
          border: "1px solid var(--border)",
          width: "fit-content",
        }}
      >
        {secoes.map((s) => {
          const ativo = secao === s.key
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => setSecao(s.key)}
              className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-150"
              style={{
                background: ativo ? "var(--background)" : "transparent",
                color: ativo ? "var(--foreground)" : "var(--muted-foreground)",
                boxShadow: ativo ? "0 1px 4px rgba(0,0,0,0.10)" : "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              <s.icon className="h-4 w-4" />
              {s.label}
            </button>
          )
        })}
      </div>

      <p className="text-sm text-muted-foreground -mt-4">
        {secoes.find(s => s.key === secao)?.descricao}
      </p>

      {secao === "presencas" ? <SecaoPresencas /> : <SecaoCadastros />}
    </div>
  )
}