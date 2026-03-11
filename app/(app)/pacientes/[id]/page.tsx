// app/(app)/pacientes/[id]/page.tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, User, Phone, MapPin, IdCard, Save, Loader2, ClipboardList } from "lucide-react"
import ModalCracha from "@/components/ModalCracha"

interface Paciente {
  id: number
  nome: string
  telefone: string
  endereco: string
  ativo: boolean
  codigoBarras: string
}

interface Observacao {
  id: number
  numero: number
  descricao: string
  data: string
}

const VISITAS = [
  { numero: 1, label: "1ª Vez", cor: "#1e6b94", descricao: "Primeira visita / consulta inicial" },
  { numero: 2, label: "2ª Vez", cor: "#2d7d46", descricao: "Segundo atendimento" },
  { numero: 3, label: "3ª Vez", cor: "#7c3aed", descricao: "Terceiro atendimento" },
  { numero: 4, label: "4ª Vez", cor: "#b45309", descricao: "Quarto atendimento" },
]

export default function ProntuarioPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [observacoes, setObservacoes] = useState<Record<number, Observacao>>({})
  const [rascunhos, setRascunhos] = useState<Record<number, string>>({})
  const [salvando, setSalvando] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [abaAtiva, setAbaAtiva] = useState(1)
  const [crachaAberto, setCrachaAberto] = useState(false)
  const [savedMsg, setSavedMsg] = useState<number | null>(null)

  const buscar = useCallback(async () => {
    setLoading(true)
    try {
      const [resPac, resObs] = await Promise.all([
        fetch(`/api/pacientes/${id}`),
        fetch(`/api/pacientes/${id}/observacoes`),
      ])
      const pac = await resPac.json()
      const obsRaw = await resObs.json()
      const obs: Observacao[] = Array.isArray(obsRaw) ? obsRaw : []

      setPaciente(pac)

      const mapa: Record<number, Observacao> = {}
      const rascs: Record<number, string> = {}
      obs.forEach(o => {
        mapa[o.numero] = o
        rascs[o.numero] = o.descricao
      })
      setObservacoes(mapa)
      setRascunhos(rascs)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { buscar() }, [buscar])

  async function salvarObservacao(numero: number) {
    const descricao = rascunhos[numero] ?? ""
    if (!descricao.trim()) return
    setSalvando(numero)
    try {
      const res = await fetch(`/api/pacientes/${id}/observacoes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numero, descricao }),
      })
      const obs = await res.json()
      setObservacoes(prev => ({ ...prev, [numero]: obs }))
      setSavedMsg(numero)
      setTimeout(() => setSavedMsg(null), 2000)
    } catch (err) {
      console.error(err)
    } finally {
      setSalvando(null)
    }
  }

  function formatarData(iso: string) {
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    })
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )

  if (!paciente) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <p className="text-muted-foreground">Paciente não encontrado.</p>
      <Button variant="outline" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
      </Button>
    </div>
  )

  const visita = VISITAS.find(v => v.numero === abaAtiva)!
  const obsAtiva = observacoes[abaAtiva]
  const totalPreenchidas = Object.keys(observacoes).length

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center h-9 w-9 rounded-lg transition-colors"
          style={{ background: "var(--muted)", border: "none", cursor: "pointer", color: "var(--muted-foreground)" }}
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Prontuário</h1>
          <p className="text-sm text-muted-foreground">Histórico de atendimentos</p>
        </div>
      </div>

      {/* Card do paciente */}
      <Card className="shadow-sm overflow-hidden">
        <div className="h-2" style={{ background: `linear-gradient(90deg, #1e6b94, #1a9e7a)` }} />
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="flex items-center justify-center h-16 w-16 rounded-full text-white text-xl font-bold shrink-0"
                style={{ background: "linear-gradient(135deg, #1e6b94, #1a9e7a)" }}>
                {paciente.nome.trim().split(/\s+/).slice(0, 2).map(n => n[0].toUpperCase()).join("")}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold text-foreground">{paciente.nome}</h2>
                  <Badge variant={paciente.ativo ? "default" : "outline"}>
                    {paciente.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                <div className="mt-1.5 flex flex-col gap-1">
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" /> {paciente.telefone}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> {paciente.endereco}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono mt-0.5">
                    <IdCard className="h-3.5 w-3.5" /> {paciente.codigoBarras}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-start sm:items-end gap-2">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <ClipboardList className="h-4 w-4" />
                <span>{totalPreenchidas} de 4 atendimentos registrados</span>
              </div>
              {/* Progresso */}
              <div className="flex gap-1.5">
                {VISITAS.map(v => (
                  <div key={v.numero} className="h-2 w-8 rounded-full transition-all"
                    style={{ background: observacoes[v.numero] ? v.cor : "var(--border)" }} />
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={() => setCrachaAberto(true)}>
                <IdCard className="mr-1.5 h-3.5 w-3.5" /> Ver Crachá
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Abas de visitas */}
      <div>
        <div className="flex gap-1 border-b border-border overflow-x-auto">
          {VISITAS.map(v => {
            const preenchida = !!observacoes[v.numero]
            const ativa = abaAtiva === v.numero
            return (
              <button
                key={v.numero}
                onClick={() => setAbaAtiva(v.numero)}
                className="flex shrink-0 items-center gap-2 px-5 py-3 text-sm font-medium transition-colors border-b-2"
                style={{
                  borderBottomColor: ativa ? v.cor : "transparent",
                  color: ativa ? v.cor : "var(--muted-foreground)",
                  background: "none", border: "none",
                  borderBottom: ativa ? `2px solid ${v.cor}` : "2px solid transparent",
                  cursor: "pointer",
                }}
              >
                <span className="h-2 w-2 rounded-full shrink-0" style={{ background: preenchida ? v.cor : "var(--border)" }} />
                {v.label}
              </button>
            )
          })}
        </div>

        {/* Conteúdo da aba */}
        <Card className="shadow-sm mt-0 rounded-tl-none" style={{ borderTopLeftRadius: 0 }}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base" style={{ color: visita.cor }}>
                  {visita.label} — {visita.descricao}
                </CardTitle>
                {obsAtiva && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Última atualização: {formatarData(obsAtiva.data)}
                  </p>
                )}
              </div>
              {savedMsg === abaAtiva && (
                <span className="text-xs font-semibold px-2 py-1 rounded-md"
                  style={{ background: `${visita.cor}18`, color: visita.cor }}>
                  ✓ Salvo
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <textarea
              placeholder={`Observações do ${visita.label.toLowerCase()} atendimento...`}
              value={rascunhos[abaAtiva] ?? ""}
              onChange={e => setRascunhos(prev => ({ ...prev, [abaAtiva]: e.target.value }))}
              rows={8}
              className="w-full resize-y text-sm outline-none p-4 leading-relaxed"
              style={{
                background: "var(--background)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                color: "var(--foreground)",
                fontFamily: "inherit",
              }}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {(rascunhos[abaAtiva] ?? "").length} caracteres
              </p>
              <button
                onClick={() => salvarObservacao(abaAtiva)}
                disabled={salvando === abaAtiva || !(rascunhos[abaAtiva] ?? "").trim()}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-md transition-all"
                style={{
                  background: (salvando === abaAtiva || !(rascunhos[abaAtiva] ?? "").trim())
                    ? "var(--muted)" : visita.cor,
                  color: (salvando === abaAtiva || !(rascunhos[abaAtiva] ?? "").trim())
                    ? "var(--muted-foreground)" : "#fff",
                  border: "none",
                  cursor: (salvando === abaAtiva || !(rascunhos[abaAtiva] ?? "").trim()) ? "not-allowed" : "pointer",
                }}
              >
                {salvando === abaAtiva
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Salvando...</>
                  : <><Save className="h-4 w-4" /> Salvar observação</>
                }
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo de todas as visitas */}
      {totalPreenchidas > 0 && (
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Resumo do Histórico
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {VISITAS.filter(v => observacoes[v.numero]).map(v => (
              <div key={v.numero} className="flex gap-4">
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <div className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: v.cor }}>
                    {v.numero}
                  </div>
                  {v.numero < 4 && observacoes[v.numero + 1] && (
                    <div className="w-0.5 flex-1" style={{ background: "var(--border)", minHeight: 16 }} />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold" style={{ color: v.cor }}>{v.label}</span>
                    <span className="text-xs text-muted-foreground">{formatarData(observacoes[v.numero].data)}</span>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {observacoes[v.numero].descricao}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {crachaAberto && (
        <ModalCracha
          nome={paciente.nome}
          tipo="paciente"
          codigoBarras={paciente.codigoBarras}
          onFechar={() => setCrachaAberto(false)}
        />
      )}
    </div>
  )
}