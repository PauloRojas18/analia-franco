// app/(app)/relatorios/page.tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Download, Printer, FileText, Users, GraduationCap, Calendar, Loader2, Briefcase, BookOpen, Search } from "lucide-react"
import JsBarcode from "jsbarcode"

type TabType = "todos" | "paciente" | "aluno" | "instrutor" | "trabalhador"

interface Presenca {
  id: number
  pessoaNome: string
  tipo: string
  tipoLabel: string
  codigoBarras: string
  data: string
  horario: string
  horarioISO: string
}

const BADGE_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  paciente: "default",
  aluno: "secondary",
  instrutor: "outline",
  trabalhador: "outline",
}

const TIPO_COR: Record<string, { bg: string; accent: string; label: string }> = {
  paciente:    { bg: "#1e6b94", accent: "#1a9e7a", label: "Paciente"     },
  aluno:       { bg: "#6d28d9", accent: "#a78bfa", label: "Aluno"        },
  instrutor:   { bg: "#b45309", accent: "#fbbf24", label: "Instrutor"    },
  trabalhador: { bg: "#ea580c", accent: "#fdba74", label: "Trabalhador" },
}

function hoje(): string {
  return new Date().toISOString().slice(0, 10)
}

function gerarBarrasSVG(codigo: string): string {
  const svgNode = document.createElementNS("http://www.w3.org/2000/svg", "svg")

  JsBarcode(svgNode, codigo, {
    format: "CODE128",
    width: 2,
    height: 40,
    displayValue: false,
    margin: 0,
  })

  return svgNode.outerHTML
}

export default function RelatoriosPage() {
  const [presencas, setPresencas] = useState<Presenca[]>([])
  const [loading, setLoading] = useState(true)
const [selectedDate, setSelectedDate] = useState(hoje())
  const [activeTab, setActiveTab] = useState<TabType>("todos")
  const [search, setSearch] = useState("")

  const buscar = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/relatorios?data=${selectedDate}`)
      const data = await res.json()
      setPresencas(data)
    } catch (err) { console.error("Erro ao buscar relatório", err) }
    finally { setLoading(false) }
  }, [selectedDate])

  useEffect(() => { buscar() }, [buscar])

  const contagem = (tipo: string) => presencas.filter(p => p.tipo === tipo).length

const filtradasPorTipo = activeTab === "todos"
    ? presencas
    : presencas.filter(p => p.tipo === activeTab)

  const filtradas = search.trim()
    ? filtradasPorTipo.filter(p =>
        p.pessoaNome.toLowerCase().includes(search.toLowerCase()) ||
        p.codigoBarras.toLowerCase().includes(search.toLowerCase())
      )
    : filtradasPorTipo

  function exportarCSV() {
    const linhas = [
      ["Nome", "Tipo", "Data", "Horário", "Código"],
      ...filtradas.map(p => [p.pessoaNome, p.tipoLabel, p.data, p.horario, p.codigoBarras]),
    ]
    const csv = linhas.map(l => l.map(c => `"${c}"`).join(",")).join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `presencas-${selectedDate}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function imprimirCrachas() {
  const dataFormatada = new Date(selectedDate + "T12:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit", month: "long", year: "numeric"
  })

  const cartoes = filtradas.map((p) => {
    const cor = TIPO_COR[p.tipo] ?? { bg: "#333", accent: "#666", label: p.tipoLabel }
    const barrasSVG = gerarBarrasSVG(p.codigoBarras)
    const iniciais = p.pessoaNome.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase()

    return `
    <div class="cracha">
      <div class="cracha-header" style="background: linear-gradient(135deg, ${cor.bg} 0%, ${cor.accent} 100%);">
        <div class="org-nome">Obras Sociais Anália Franco</div>
        <div class="avatar">${iniciais}</div>
        <div class="tipo-badge">${cor.label.toUpperCase()}</div>
      </div>
      <div class="cracha-body">
        <div class="nome">${p.pessoaNome}</div>
        <div class="divider"></div>
        <div class="barras">${barrasSVG}</div>
        <div class="codigo">${p.codigoBarras}</div>
      </div>
      <div class="cracha-footer" style="background: ${cor.bg}18; border-top: 2px solid ${cor.bg}25;">
        <div class="footer-text" style="color: ${cor.bg}">Centro Espírita Fraternidade Anália Franco</div>
      </div>
    </div>`
    }).join("")

    const html = `<!DOCTYPE html>
  <html lang="pt-BR">
  <head>
    <meta charset="UTF-8">
    <title>Crachás — ${dataFormatada}</title>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }

      body {
        font-family: 'Segoe UI', Arial, sans-serif;
        background: #f0f2f5;
        padding: 24px;
      }

      h1.titulo {
        text-align: center;
        font-size: 16px;
        color: #444;
        margin-bottom: 24px;
        font-weight: 400;
        letter-spacing: 0.5px;
      }

      .grade {
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
        justify-content: center;
      }

      .cracha {
        width: 240px;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15), 0 1px 4px rgba(0,0,0,0.1);
        background: #fff;
        break-inside: avoid;
        page-break-inside: avoid;
      }

      .cracha-header {
        padding: 20px 16px 16px;
        text-align: center;
      }

      .org-nome {
        font-size: 9px;
        font-weight: 700;
        color: rgba(255,255,255,0.85);
        letter-spacing: 1px;
        text-transform: uppercase;
        margin-bottom: 12px;
      }

      .avatar {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: rgba(255,255,255,0.25);
        border: 2px solid rgba(255,255,255,0.5);
        color: #fff;
        font-size: 20px;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 10px;
      }

      .tipo-badge {
        display: inline-block;
        font-size: 9px;
        font-weight: 700;
        color: #fff;
        padding: 3px 10px;
        border-radius: 20px;
        letter-spacing: 1.5px;
        background: rgba(255,255,255,0.2);
        border: 1px solid rgba(255,255,255,0.4);
      }

      .cracha-body {
        padding: 16px;
        text-align: center;
      }

      .nome {
        font-size: 14px;
        font-weight: 700;
        color: #1a1a2e;
        line-height: 1.3;
        margin-bottom: 8px;
      }

      .divider {
        height: 1px;
        background: #eee;
        margin: 12px 0;
      }

      .barras {
        display: flex;
        justify-content: center;
        margin-bottom: 6px;
        opacity: 0.85;
      }

      .barras svg { max-width: 100%; height: 32px; }

      .codigo {
        font-family: 'Courier New', monospace;
        font-size: 10px;
        color: #888;
        letter-spacing: 1px;
      }

      .cracha-footer {
        padding: 8px 12px;
        text-align: center;
      }

      .footer-text {
        font-size: 8px;
        font-weight: 600;
        letter-spacing: 0.5px;
        text-transform: uppercase;
        opacity: 0.75;
      }

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

    const w = window.open("", "_blank")
    w?.document.write(html)
    w?.document.close()
  }

  const tabs: { key: TabType; label: string; count: number; icon: React.ElementType }[] = [
    { key: "todos",       label: "Todos",         count: presencas.length,     icon: FileText      },
    { key: "paciente",    label: "Pacientes",     count: contagem("paciente"), icon: Users         },
    { key: "aluno",       label: "Alunos",        count: contagem("aluno"),    icon: BookOpen      },
    { key: "instrutor",   label: "Instrutores",   count: contagem("instrutor"),icon: GraduationCap },
    { key: "trabalhador", label: "Trabalhador", count: contagem("trabalhador"),icon: Briefcase   },
  ]

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
          <p className="mt-1 text-sm text-muted-foreground">Consulte histórico de presenças e gere crachás</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportarCSV} disabled={loading || filtradas.length === 0}>
            <Download className="mr-2 h-4 w-4" />Exportar CSV
          </Button>
          <Button onClick={imprimirCrachas} disabled={loading || filtradas.length === 0}>
            <Printer className="mr-2 h-4 w-4" />Imprimir Crachás
          </Button>
        </div>
      </div>

<div className="flex items-center gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="relDate" className="flex items-center gap-2 text-sm font-medium">
            <Calendar className="h-4 w-4" />Data do Relatório
          </label>
          <div className="flex items-center gap-3">
            <Input id="relDate" type="date" value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)} className="w-[200px]" />
          </div>
        </div>
        <p className="self-end pb-1 text-sm text-muted-foreground">
          {loading ? "Carregando..." : `${presencas.length} presença(s) encontrada(s)`}
        </p>
      </div>

<div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou código..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-border">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex shrink-0 items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}>
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label === 'Trabalhador' ? 'Voluntário' : tab.label} ({tab.count})
          </button>
        ))}
      </div>

      <Card className="shadow-sm">
        <CardContent className="pt-5">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : filtradas.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Nenhuma presença encontrada para esta data.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Nome</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Tipo</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Data</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Horário</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden md:table-cell">Código</th>
                  </tr>
                </thead>
                <tbody>
                  {filtradas.map((p) => (
                    <tr key={p.id} className="border-b border-border last:border-0 transition-colors"
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--secondary)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <td className="px-4 py-3 font-medium">{p.pessoaNome}</td>
                      <td className="px-4 py-3">
                        <Badge variant={BADGE_VARIANT[p.tipo] ?? "outline"}>{p.tipoLabel === 'Trabalhador' ? 'Voluntário' : p.tipoLabel}</Badge>
                      </td>
                      <td className="px-4 py-3">{p.data} - 
                        <span className="text-sm font-medium text-foreground capitalize">
                          {new Date(selectedDate + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "long" })}
                        </span>                        
                      </td>
                      <td className="px-4 py-3 font-mono text-sm">{p.horario}</td>
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
