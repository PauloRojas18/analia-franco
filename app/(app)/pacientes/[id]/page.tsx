"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft, Phone, MapPin, IdCard, Save, Loader2,
  ClipboardList, CalendarDays, ChevronLeft, ChevronRight, Plus,
} from "lucide-react"
import ModalCracha from "@/components/ModalCracha"

/* ─── Types ─────────────────────────────────────────────────────────── */

interface Paciente {
  id: number
  nome: string
  telefone: string
  endereco: string
  ativo: boolean
  codigoBarras: string
  totalConsultas: number
  dataPrimeiraConsulta: string | null
  dataUltimaConsulta: string | null
}

interface Observacao {
  id: number
  numero: number
  descricao: string
  data: string
}

/* ─── Constants ──────────────────────────────────────────────────────── */

const MESES_PT = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
]
const SEMANA_ABREV = ["D", "S", "T", "Q", "Q", "S", "S"]

const PALETA: string[][] = [
  ["#1e6b94", "#2d7d46", "#7c3aed", "#b45309"],
  ["#c2410c", "#0e7490", "#4d7c0f", "#be185d"],
  ["#1d4ed8", "#065f46", "#9333ea", "#a16207"],
]

function gerarVisitas(total: number) {
  return Array.from({ length: total }, (_, i) => ({
    numero: i + 1,
    label: `${i + 1}ª Vez`,
    cor: (PALETA[Math.floor(i / 4)] ?? PALETA[0])[i % 4],
    ciclo: Math.floor(i / 4) + 1,
  }))
}

/* ─── MiniCalendario ─────────────────────────────────────────────────── */

function MiniCalendario({
  dataPrimeira,
  dataUltima,
  salvando,
  onMarcar,
}: {
  dataPrimeira: Date | null
  dataUltima: Date | null
  salvando: boolean
  onMarcar: (tipo: "primeira" | "ultima", data: Date) => void
}) {
  const hoje = new Date()
  const [ref, setRef] = useState(() => new Date(hoje.getFullYear(), hoje.getMonth(), 1))
  const [modo, setModo] = useState<"primeira" | "ultima" | null>(null)

  const ano = ref.getFullYear()
  const mes = ref.getMonth()
  const diasNoMes = new Date(ano, mes + 1, 0).getDate()
  const offset = new Date(ano, mes, 1).getDay()

  function navMes(delta: number) {
    setRef(new Date(ano, mes + delta, 1))
  }

  function isMesmoDia(d: Date | null, dia: number) {
    return d != null && d.getFullYear() === ano && d.getMonth() === mes && d.getDate() === dia
  }

  function handleDia(dia: number) {
    if (!modo) return
    onMarcar(modo, new Date(ano, mes, dia))
    setModo(null)
  }

  function fmtData(d: Date) {
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`
  }

  const marcadores = [
    { tipo: "primeira" as const, label: "1ª Consulta", cor: "#1e6b94", data: dataPrimeira },
    { tipo: "ultima" as const, label: "Última Consulta", cor: "#7c3aed", data: dataUltima },
  ]

  return (
    <Card className="shadow-sm">
      <CardHeader className="pt-4 pb-2 px-4">
        <CardTitle className="text-sm flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          Calendário de Consultas
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 flex flex-col gap-3">

        {/* Navegação de mês */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navMes(-1)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)", padding: 2, display: "flex" }}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs font-semibold text-foreground">
            {MESES_PT[mes]} {ano}
          </span>
          <button
            onClick={() => navMes(1)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)", padding: 2, display: "flex" }}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Grid de dias */}
        <div className="grid grid-cols-7" style={{ gap: "2px 0" }}>
          {SEMANA_ABREV.map((d, i) => (
            <div
              key={i}
              style={{
                textAlign: "center", fontSize: 10, fontWeight: 600,
                color: "var(--muted-foreground)", paddingBottom: 4,
              }}
            >
              {d}
            </div>
          ))}

          {Array.from({ length: offset }).map((_, i) => <div key={`g${i}`} />)}

          {Array.from({ length: diasNoMes }).map((_, i) => {
            const dia = i + 1
            const isPrimeira = isMesmoDia(dataPrimeira, dia)
            const isUltima = isMesmoDia(dataUltima, dia)
            const isHoje = isMesmoDia(hoje, dia)
            const marcado = isPrimeira || isUltima

            return (
              <div key={dia} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <button
                  onClick={() => handleDia(dia)}
                  title={isPrimeira ? "1ª Consulta" : isUltima ? "Última Consulta" : ""}
                  style={{
                    height: 28, width: 28, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: marcado ? 700 : 400,
                    background: isPrimeira ? "#1e6b94" : isUltima ? "#7c3aed" : isHoje ? "var(--muted)" : "transparent",
                    color: marcado ? "#fff" : "var(--foreground)",
                    border: isHoje && !marcado ? "1.5px solid var(--border)" : "none",
                    cursor: modo ? "pointer" : "default",
                    transition: "background 0.15s",
                    position: "relative",
                  }}
                >
                  {dia}
                  {modo && !marcado && (
                    <span style={{
                      position: "absolute", bottom: 2, left: "50%", transform: "translateX(-50%)",
                      height: 3, width: 3, borderRadius: "50%",
                      background: modo === "primeira" ? "#1e6b9460" : "#7c3aed60",
                    }} />
                  )}
                </button>
              </div>
            )
          })}
        </div>

        {/* Legenda + botões marcar */}
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
          {marcadores.map(({ tipo, label, cor, data }) => (
            <div key={tipo} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, overflow: "hidden", flex: 1 }}>
                <div style={{ height: 9, width: 9, borderRadius: "50%", background: cor, flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: "var(--muted-foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {label}{data ? `: ${fmtData(data)}` : ""}
                </span>
              </div>
              <button
                onClick={() => setModo(modo === tipo ? null : tipo)}
                style={{
                  fontSize: 11, padding: "2px 8px", borderRadius: 4, flexShrink: 0,
                  fontWeight: 500, cursor: "pointer", transition: "all 0.15s",
                  background: modo === tipo ? `${cor}18` : "var(--muted)",
                  color: modo === tipo ? cor : "var(--muted-foreground)",
                  border: modo === tipo ? `1px solid ${cor}50` : "1px solid transparent",
                }}
              >
                {modo === tipo ? "✕ Cancelar" : "Marcar"}
              </button>
            </div>
          ))}
        </div>

        {modo && (
          <p style={{ fontSize: 11, textAlign: "center", color: "var(--muted-foreground)", fontStyle: "italic" }}>
            Clique em um dia para marcar
          </p>
        )}

        {salvando && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
            <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Salvando data...</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/* ─── Page ───────────────────────────────────────────────────────────── */

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

  const [totalConsultas, setTotalConsultas] = useState(4)
  const [dataPrimeira, setDataPrimeira] = useState<Date | null>(null)
  const [dataUltima, setDataUltima] = useState<Date | null>(null)
  const [salvandoDatas, setSalvandoDatas] = useState(false)
  const [ampliando, setAmpliando] = useState(false)

  const VISITAS = gerarVisitas(totalConsultas)

  /* fetch inicial */
  const buscar = useCallback(async () => {
    setLoading(true)
    try {
      const [resPac, resObs] = await Promise.all([
        fetch(`/api/pacientes/${id}`),
        fetch(`/api/pacientes/${id}/observacoes`),
      ])
      const pac: Paciente = await resPac.json()
      const obsRaw = await resObs.json()
      const obs: Observacao[] = Array.isArray(obsRaw) ? obsRaw : []

      setPaciente(pac)
      setTotalConsultas(pac.totalConsultas ?? 4)
      if (pac.dataPrimeiraConsulta) setDataPrimeira(new Date(pac.dataPrimeiraConsulta))
      if (pac.dataUltimaConsulta) setDataUltima(new Date(pac.dataUltimaConsulta))

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

  /* salvar observação */
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

  /* salvar datas do calendário */
  async function salvarDatas(tipo: "primeira" | "ultima", data: Date) {
    if (tipo === "primeira") setDataPrimeira(data)
    else setDataUltima(data)

    setSalvandoDatas(true)
    try {
      await fetch(`/api/pacientes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          tipo === "primeira"
            ? { dataPrimeiraConsulta: data.toISOString() }
            : { dataUltimaConsulta: data.toISOString() }
        ),
      })
    } catch (err) {
      console.error(err)
    } finally {
      setSalvandoDatas(false)
    }
  }

  /* ampliar tratamento (+4 consultas) */
  async function ampliarTratamento() {
    if (ampliando) return
    setAmpliando(true)
    const novoTotal = totalConsultas + 4
    try {
      await fetch(`/api/pacientes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ totalConsultas: novoTotal }),
      })
      setTotalConsultas(novoTotal)
      setAbaAtiva(totalConsultas + 1)
    } catch (err) {
      console.error(err)
    } finally {
      setAmpliando(false)
    }
  }

  function formatarData(iso: string) {
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    })
  }

  /* loading / not found */
  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )

  if (!paciente) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <p className="text-muted-foreground">Paciente não encontrado.</p>
      <button
        onClick={() => router.back()}
        style={{
          display: "flex", alignItems: "center", gap: 8, padding: "8px 16px",
          borderRadius: "var(--radius)", background: "var(--muted)",
          color: "var(--muted-foreground)", border: "none", cursor: "pointer", fontSize: 14,
        }}
      >
        <ArrowLeft className="h-4 w-4" /> Voltar
      </button>
    </div>
  )

  const visita = VISITAS.find(v => v.numero === abaAtiva) ?? VISITAS[0]
  const obsAtiva = observacoes[abaAtiva]
  const totalPreenchidas = Object.keys(observacoes).length
  const todasPreenchidas = totalPreenchidas >= totalConsultas
  const porcentagemProgresso = Math.min(100, Math.round((totalPreenchidas / totalConsultas) * 100))

  // agrupar visitas por ciclo para as abas
  const ciclos = VISITAS.reduce<Record<number, typeof VISITAS>>((acc, v) => {
    ;(acc[v.ciclo] ??= []).push(v)
    return acc
  }, {})
  const temMultiplosCiclos = Object.keys(ciclos).length > 1

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            height: 36, width: 36, borderRadius: 8,
            background: "var(--muted)", border: "none", cursor: "pointer",
            color: "var(--muted-foreground)",
          }}
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Prontuário</h1>
          <p className="text-sm text-muted-foreground">Histórico de atendimentos</p>
        </div>
      </div>

      {/* ── Card do paciente ── */}
      <Card className="shadow-sm overflow-hidden">
        <div className="h-2" style={{ background: "linear-gradient(90deg, #1e6b94, #1a9e7a)" }} />
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className="flex items-center justify-center h-16 w-16 rounded-full text-white text-xl font-bold shrink-0"
                style={{ background: "linear-gradient(135deg, #1e6b94, #1a9e7a)" }}
              >
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
                <span>{totalPreenchidas} de {totalConsultas} atendimentos registrados</span>
              </div>
              {/* barra de progresso por consulta */}
              <div className="flex gap-1 flex-wrap">
                {VISITAS.map(v => (
                  <div
                    key={v.numero}
                    title={`${v.label}${observacoes[v.numero] ? " — preenchida" : ""}`}
                    style={{
                      height: 6, width: 24, borderRadius: 9999,
                      background: observacoes[v.numero] ? v.cor : "var(--border)",
                      transition: "background 0.3s",
                    }}
                  />
                ))}
              </div>
              <button
                onClick={() => setCrachaAberto(true)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "4px 12px", borderRadius: "var(--radius)",
                  background: "var(--muted)", border: "1px solid var(--border)",
                  color: "var(--muted-foreground)", cursor: "pointer", fontSize: 13, fontWeight: 500,
                }}
              >
                <IdCard className="h-3.5 w-3.5" /> Ver Crachá
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Layout principal ── */}
      {/* CORRIGIDO: Usando flex-col em mobile, grid em lg, e removendo scroll das abas */}
      <div className="flex flex-col lg:grid lg:grid-cols-[1fr_264px] gap-6">

        {/* ── Seção de abas + conteúdo (cresce responsivamente) ── */}
        <div className="flex flex-col gap-0 min-h-0">

          {Object.entries(ciclos).map(([cicloStr, visitas]) => {
            const cicloNum = Number(cicloStr)
            return (
              <div key={cicloNum}>
                {temMultiplosCiclos && (
                  <div style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
                    color: "var(--muted-foreground)", textTransform: "uppercase",
                    padding: "4px 2px", marginTop: cicloNum === 1 ? 0 : 12,
                  }}>
                    Ciclo {cicloNum}
                  </div>
                )}
                {/* CORRIGIDO: flex-wrap em vez de overflowX: auto */}
                <div style={{
                  display: "flex", 
                  flexWrap: "wrap",
                  gap: "0", 
                  borderBottom: "1px solid var(--border)",
                }}>
                  {visitas.map(v => {
                    const preenchida = !!observacoes[v.numero]
                    const ativa = abaAtiva === v.numero
                    return (
                      <button
                        key={v.numero}
                        onClick={() => setAbaAtiva(v.numero)}
                        style={{
                          display: "flex", alignItems: "center", gap: 8,
                          padding: "10px 18px", fontSize: 13, fontWeight: 500,
                          flexShrink: 0, background: "none", border: "none",
                          borderBottom: ativa ? `2px solid ${v.cor}` : "2px solid transparent",
                          color: ativa ? v.cor : "var(--muted-foreground)",
                          cursor: "pointer", transition: "color 0.15s",
                          marginBottom: -1,
                        }}
                      >
                        <span style={{
                          height: 8, width: 8, borderRadius: "50%", flexShrink: 0,
                          background: preenchida ? v.cor : "var(--border)",
                        }} />
                        {v.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {/* ── Card de observação (CORRIGIDO: responsivo e sem scroll) ── */}
          <Card className="shadow-sm flex-1 flex flex-col" style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
            <CardHeader className="pb-3 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base" style={{ color: visita.cor }}>
                    {visita.label}
                    {temMultiplosCiclos && (
                      <span style={{ fontSize: 12, fontWeight: 400, color: "var(--muted-foreground)", marginLeft: 8 }}>
                        — Ciclo {visita.ciclo}
                      </span>
                    )}
                  </CardTitle>
                  {obsAtiva && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Última atualização: {formatarData(obsAtiva.data)}
                    </p>
                  )}
                </div>
                {savedMsg === abaAtiva && (
                  <span
                    className="text-xs font-semibold px-2 py-1 rounded-md flex-shrink-0"
                    style={{ background: `${visita.cor}18`, color: visita.cor }}
                  >
                    ✓ Salvo
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 flex-1 overflow-y-auto">
              <textarea
                placeholder={`Observações do ${visita.label.toLowerCase()} atendimento...`}
                value={rascunhos[abaAtiva] ?? ""}
                onChange={e => setRascunhos(prev => ({ ...prev, [abaAtiva]: e.target.value }))}
                rows={8}
                className="w-full resize-none text-sm outline-none p-4 leading-relaxed flex-1"
                style={{
                  background: "var(--background)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  color: "var(--foreground)",
                  fontFamily: "inherit",
                }}
              />
              <div className="flex items-center justify-between flex-shrink-0">
                <p className="text-xs text-muted-foreground">
                  {(rascunhos[abaAtiva] ?? "").length} caracteres
                </p>
                <button
                  onClick={() => salvarObservacao(abaAtiva)}
                  disabled={salvando === abaAtiva || !(rascunhos[abaAtiva] ?? "").trim()}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "8px 16px", fontSize: 13, fontWeight: 600,
                    borderRadius: "var(--radius)", border: "none",
                    background: (salvando === abaAtiva || !(rascunhos[abaAtiva] ?? "").trim())
                      ? "var(--muted)" : visita.cor,
                    color: (salvando === abaAtiva || !(rascunhos[abaAtiva] ?? "").trim())
                      ? "var(--muted-foreground)" : "#fff",
                    cursor: (salvando === abaAtiva || !(rascunhos[abaAtiva] ?? "").trim())
                      ? "not-allowed" : "pointer",
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

        {/* ── Sidebar: calendário + ampliar (sticky em lg) ── */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-6 lg:h-fit">

          <MiniCalendario
            dataPrimeira={dataPrimeira}
            dataUltima={dataUltima}
            salvando={salvandoDatas}
            onMarcar={salvarDatas}
          />

          {/* Card: Ampliar Tratamento */}
          <Card className="shadow-sm overflow-hidden">
            <div
              className="h-1"
              style={{
                background: todasPreenchidas
                  ? "linear-gradient(90deg, #2d7d46, #16a34a)"
                  : "var(--border)",
                transition: "background 0.4s",
              }}
            />
            <CardContent className="pt-4 pb-4 px-4 flex flex-col gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Ampliar Tratamento</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {todasPreenchidas
                    ? `Todas as ${totalConsultas} consultas preenchidas. Adicione mais 4 para continuar.`
                    : `Preencha todas as ${totalConsultas} consultas para poder ampliar.`
                  }
                </p>
              </div>

              {/* barra de progresso */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  height: 6, flex: 1, borderRadius: 9999,
                  background: "var(--muted)", overflow: "hidden",
                }}>
                  <div style={{
                    height: "100%",
                    width: `${porcentagemProgresso}%`,
                    background: "#2d7d46",
                    borderRadius: 9999,
                    transition: "width 0.4s ease",
                  }} />
                </div>
                <span style={{ fontSize: 11, color: "var(--muted-foreground)", flexShrink: 0 }}>
                  {totalPreenchidas}/{totalConsultas}
                </span>
              </div>

              <button
                onClick={ampliarTratamento}
                disabled={!todasPreenchidas || ampliando}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  gap: 8, width: "100%", padding: "10px 0", fontSize: 13,
                  fontWeight: 600, borderRadius: "var(--radius)", border: "none",
                  background: todasPreenchidas && !ampliando ? "#2d7d46" : "var(--muted)",
                  color: todasPreenchidas && !ampliando ? "#fff" : "var(--muted-foreground)",
                  cursor: todasPreenchidas && !ampliando ? "pointer" : "not-allowed",
                  transition: "background 0.2s",
                }}
              >
                {ampliando
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Ampliando...</>
                  : <><Plus className="h-4 w-4" /> +4 Consultas</>
                }
              </button>

              {totalConsultas > 4 && (
                <p style={{ fontSize: 11, textAlign: "center", color: "var(--muted-foreground)" }}>
                  {Math.ceil(totalConsultas / 4)}º ciclo · {totalConsultas} consultas no total
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Resumo do histórico ── */}
      {totalPreenchidas > 0 && (
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Resumo do Histórico
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {VISITAS.filter(v => observacoes[v.numero]).map((v, idx, arr) => (
              <div key={v.numero} className="flex gap-4">
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <div
                    className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: v.cor }}
                  >
                    {v.numero}
                  </div>
                  {idx < arr.length - 1 && (
                    <div className="w-0.5 flex-1" style={{ background: "var(--border)", minHeight: 16 }} />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm font-semibold" style={{ color: v.cor }}>
                      {v.label}
                    </span>
                    {temMultiplosCiclos && (
                      <span style={{
                        fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 9999,
                        background: `${v.cor}18`, color: v.cor,
                      }}>
                        Ciclo {v.ciclo}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatarData(observacoes[v.numero].data)}
                    </span>
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