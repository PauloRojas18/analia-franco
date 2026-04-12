// app/(app)/presenca/page.tsx
"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScanBarcode, Clock, CheckCircle2, AlertCircle, X } from "lucide-react"

interface Presenca {
  id: number
  pessoaNome: string
  tipo: string
  horario: string
  codigoBarras: string
}

interface Vinculo {
  tipo: string
  nome: string
  codigoBarras: string
}

interface StatusLeitura {
  tipo: "sucesso" | "erro" | "aguardando"
  mensagem: string
  submensagem?: string
}

const TIPO_LABEL: Record<string, string> = {
  paciente: "Paciente",
  aluno: "Aluno",
  instrutor: "Instrutor",
  trabalhador: "Voluntário",
}

const TIPO_COR: Record<string, string> = {
  paciente: "default",
  aluno: "default",
  instrutor: "secondary",
  trabalhador: "secondary",
}

export default function PresencaPage() {
  const [barcode, setBarcode] = useState("")
  const [presencas, setPresencas] = useState<Presenca[]>([])
  const [status, setStatus] = useState<StatusLeitura>({ tipo: "aguardando", mensagem: "Aguardando leitura...", submensagem: "Passe o crachá no leitor para registrar a presença" })
  const [popupVinculos, setPopupVinculos] = useState<{ vinculos: Vinculo[]; codigoOrigem: string } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const buscarPresencas = useCallback(async () => {
    try {
      const res = await fetch("/api/presenca")
      const data = await res.json()
      setPresencas(data)
    } catch {
      console.error("Erro ao buscar presenças")
    }
  }, [])

  useEffect(() => {
    buscarPresencas()
    inputRef.current?.focus()
  }, [buscarPresencas])

  // Foca o input ao clicar em qualquer lugar da área
  useEffect(() => {
    const handler = () => inputRef.current?.focus()
    document.addEventListener("click", handler)
    return () => document.removeEventListener("click", handler)
  }, [])

  async function processarCodigo(codigo: string) {
    if (!codigo.trim()) return
    setBarcode("")

    try {
      const res = await fetch("/api/presenca/resolver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigoBarras: codigo.trim() }),
      })
      const data = await res.json()

      if (!res.ok) {
        setStatus({ tipo: "erro", mensagem: "Crachá não encontrado", submensagem: `Código: ${codigo}` })
        setTimeout(() => setStatus({ tipo: "aguardando", mensagem: "Aguardando leitura...", submensagem: "Passe o crachá no leitor para registrar a presença" }), 3000)
        return
      }

      // Tem múltiplos vínculos — mostrar popup
      if (data.vinculos && data.vinculos.length > 1) {
        setPopupVinculos({ vinculos: data.vinculos, codigoOrigem: codigo.trim() })
        return
      }

      // Vínculo único — registrar direto
      await registrarPresenca(data.vinculos[0].codigoBarras, data.vinculos[0].tipo)
    } catch {
      setStatus({ tipo: "erro", mensagem: "Erro de conexão", submensagem: "Tente novamente" })
      setTimeout(() => setStatus({ tipo: "aguardando", mensagem: "Aguardando leitura...", submensagem: "Passe o crachá no leitor para registrar a presença" }), 3000)
    }
  }

  async function registrarPresenca(codigoBarras: string, tipo: string) {
    setPopupVinculos(null)
    try {
      const res = await fetch("/api/presenca", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigoBarras, tipo }),
      })
      const data = await res.json()

      if (!res.ok) {
        setStatus({ tipo: "erro", mensagem: data.error || "Erro ao registrar", submensagem: `Código: ${codigoBarras}` })
      } else {
        setStatus({
          tipo: "sucesso",
          mensagem: `${data.nome} — ${TIPO_LABEL[data.tipo] ?? data.tipo}`,
          submensagem: `Presença registrada às ${data.horario}`,
        })
        buscarPresencas()
      }
    } catch {
      setStatus({ tipo: "erro", mensagem: "Erro de conexão", submensagem: "Tente novamente" })
    } finally {
      setTimeout(() => {
        setStatus({ tipo: "aguardando", mensagem: "Aguardando leitura...", submensagem: "Passe o crachá no leitor para registrar a presença" })
        inputRef.current?.focus()
      }, 3000)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") processarCodigo(barcode)
  }

  const statusBg = {
    aguardando: "rgba(30,107,148,0.08)",
    sucesso: "rgba(42,157,90,0.1)",
    erro: "rgba(217,83,79,0.1)",
  }
  const statusCor = {
    aguardando: "var(--primary)",
    sucesso: "var(--success)",
    erro: "var(--destructive)",
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Registrar Presença</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Passe o crachá no leitor de código de barras ou digite o código manualmente
        </p>
      </div>

      {/* Área de leitura */}
      <div className="flex flex-col items-center gap-6 rounded-lg border-2 border-dashed border-border bg-card p-12">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl" style={{ background: "rgba(30,107,148,0.08)" }}>
          <ScanBarcode className="h-10 w-10 text-primary" />
        </div>

        <div className="text-center">
          <h2 className="text-lg font-semibold">Área de Leitura</h2>
          <p className="text-sm text-muted-foreground">
            Posicione o crachá no leitor ou digite o código abaixo
          </p>
        </div>

        <div className="flex w-full max-w-md gap-3">
          <input
            ref={inputRef}
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Código de barras..."
            autoFocus
            className="flex-1 px-4 py-2.5 text-center font-mono text-sm outline-none transition-all"
            style={{
              background: "var(--background)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              color: "var(--foreground)",
            }}
          />
          <button
            onClick={() => processarCodigo(barcode)}
            className="px-4 py-2.5 text-sm font-semibold transition-all"
            style={{
              background: "var(--primary)",
              color: "var(--primary-foreground)",
              border: "none",
              borderRadius: "var(--radius)",
              cursor: "pointer",
            }}
          >
            Registrar
          </button>
        </div>

        {/* Status */}
        <div
          className="flex w-full max-w-md items-center gap-3 rounded-md p-3.5 transition-all duration-300"
          style={{ background: statusBg[status.tipo], color: statusCor[status.tipo] }}
        >
          {status.tipo === "sucesso" && <CheckCircle2 className="h-5 w-5 shrink-0" />}
          {status.tipo === "erro" && <AlertCircle className="h-5 w-5 shrink-0" />}
          {status.tipo === "aguardando" && <ScanBarcode className="h-5 w-5 shrink-0" />}
          <div className="flex-1">
            <p className="text-sm font-semibold">{status.mensagem}</p>
            {status.submensagem && <p className="text-xs opacity-80">{status.submensagem}</p>}
          </div>
        </div>
      </div>

      {/* Tabela de presenças */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Clock className="h-4 w-4 text-primary" />
            Presenças Registradas Hoje ({presencas.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {presencas.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Nenhuma presença registrada hoje.</p>
          ) : (
            <div className="overflow-x-auto overflow-y-auto max-h-[60vh]">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10" style={{ background: "var(--card)" }}>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Nome</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Tipo</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Horário</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden md:table-cell">Código</th>
                  </tr>
                </thead>
                <tbody>
                  {presencas.map((p) => (
                    <tr key={p.id} className="border-b border-border last:border-0"
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--secondary)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <td className="px-4 py-3 font-medium">{p.pessoaNome}</td>
                      <td className="px-4 py-3">
                        <Badge variant={TIPO_COR[p.tipo] as "default" | "secondary" | "outline"}>
                          {TIPO_LABEL[p.tipo === 'Assistidos' ? 'T.A Silvana Maria' : p.tipo && (p.tipo === 'Trabalhador' ? 'Voluntário' : p.tipo)] ?? p.tipo}
                        </Badge>
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

      {/* Popup de múltiplos vínculos */}
      {popupVinculos && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0"
            style={{ background: "color-mix(in srgb, var(--sidebar-bg) 75%, transparent)" }}
            onClick={() => { setPopupVinculos(null); inputRef.current?.focus() }}
          />
          <div
            className="relative z-10 w-full max-w-sm"
            style={{
              background: "color-mix(in srgb, var(--card) 92%, transparent)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid var(--border)",
              borderRadius: "calc(var(--radius) * 2)",
              boxShadow: "0 24px 48px rgba(0,0,0,0.35), 0 1px 0 rgba(255,255,255,0.06) inset",
            }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold" style={{ color: "var(--primary)" }}>
                  Múltiplos Vínculos
                </h2>
                <button
                  onClick={() => { setPopupVinculos(null); inputRef.current?.focus() }}
                  className="flex h-7 w-7 items-center justify-center rounded-md"
                  style={{ background: "var(--muted)", border: "none", cursor: "pointer", color: "var(--muted-foreground)" }}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground mb-5">
                Esta pessoa possui múltiplos vínculos. Selecione qual presença registrar:
              </p>

              <div className="flex flex-col gap-2">
                {popupVinculos.vinculos.map((v) => (
                  <button
                    key={v.tipo}
                    onClick={() => registrarPresenca(v.codigoBarras, v.tipo)}
                    className="flex items-center justify-between w-full px-4 py-3.5 text-sm font-medium text-left transition-all rounded-md"
                    style={{
                      background: "var(--background)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius)",
                      cursor: "pointer",
                      color: "var(--foreground)",
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.background = "var(--primary)"
                      ;(e.currentTarget as HTMLButtonElement).style.color = "var(--primary-foreground)"
                      ;(e.currentTarget as HTMLButtonElement).style.borderColor = "var(--primary)"
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.background = "var(--background)"
                      ;(e.currentTarget as HTMLButtonElement).style.color = "var(--foreground)"
                      ;(e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)"
                    }}
                  >
                    <span>{v.nome}</span>
                    <span className="text-xs opacity-60 ml-2">{TIPO_LABEL[v.tipo] ?? v.tipo}</span>
                  </button>
                ))}
              </div>

              <div className="mt-4" style={{ borderTop: "1px solid var(--border)" }} />
              <button
                onClick={() => { setPopupVinculos(null); inputRef.current?.focus() }}
                className="mt-4 w-full py-2.5 text-sm font-semibold transition-all"
                style={{
                  background: "var(--muted)",
                  color: "var(--muted-foreground)",
                  border: "none",
                  borderRadius: "var(--radius)",
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}