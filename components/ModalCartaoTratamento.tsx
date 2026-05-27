"use client"

import { useState, useEffect } from "react"
import { X, Printer, Loader2, ChevronLeft, ChevronRight } from "lucide-react"

interface ModalCartaoTratamentoProps {
  pacienteId: number
  nome: string
  codigoBarras: string
  onFechar: () => void
}

interface Paciente {
  id: number
  nome: string
  codigoBarras: string
  dataPrimeiraConsulta: string | null
  dataUltimaConsulta: string | null
  totalConsultas: number
}

interface Presenca {
  codigoBarras: string
  tipo: string
  horarioISO: string
}

const ETAPAS = ["1ª Semana", "2ª Semana", "3ª Semana", "Retorno", "Triagem"]
const IDX_RETORNO = 3

const ORIENTACOES = [
  "Cultivar a atitude mental digna desde de cedo.",
  "Evitar deliberadamente brigas e discussões, sustentando paciência e serenidade, acima de quaisquer transtornos que sobrevenham durante o dia.",
  "Evitar alimentação excessiva, o uso da carne, do café e dos temperos excitantes.",
  "Horas antes do início do tratamento, dedique-se ao serviço da prece e da meditação em seu próprio lar.",
  "Buscar superar todos os impedimentos naturais como chuvas, visitas inesperadas, doenças familiares, etc, a fim de não interromper o tratamento.",
  "Desenvolver o culto do evangelho no lar. (informe-se na recepção)",
  "Ler o evangelho todos os dias para si e para as crianças, bem como fazer o uso da oração.",
  "Nas reuniões públicas você poderá trazer um vidro de água para fluidificar. Identifique o vasilhame.",
  "Na terça-feira e na quarta-feira a porta será fechada às 19:30h.",
  "Comparecer ao retorno nos dias determinados.",
]

const LEMBRETES = [
  "Chegar no horário marcado.",
  "Não faltar ao tratamento.",
  "Não trazer crianças à noite.",
  "No retorno traga o seu cartão de frequência.",
]

function fmtData(iso: string | null | undefined) {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("pt-BR")
}

function diaSemana(iso: string) {
  return new Date(iso).getDay()
}

const AZUL = "#1a4a6e"
const AZUL_LIGHT = "#2a6fa8"
const AZUL_BG = "#e8f2fb"

function gerarHtmlImpressao(
  nome: string,
  codigoBarras: string,
  inicioBR: string,
  tercas: Presenca[],
  quartas: Presenca[],
  dataRetornoBR: string,
  veioTerca: boolean,
  veioQuarta: boolean,
) {
  function celulaData(val: string) {
    return `<td style="padding:5px 6px;text-align:center;font-size:9px;color:${val === "—" ? "#9ca3af" : "#1f2937"};border:1px solid #dde4f0;background:#fff;font-weight:${val === "—" ? 400 : 600};">${val}</td>`
  }
  function celulaCheck(marcada: boolean) {
    return `<td style="padding:5px 6px;text-align:center;border:1px solid #dde4f0;background:#fff;">
      ${marcada
        ? `<span style="display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:50%;background:${AZUL_BG};color:${AZUL};font-size:12px;font-weight:700;">✓</span>`
        : `<span style="display:inline-block;width:18px;height:18px;border-radius:50%;border:1.5px solid #d1d9e6;"></span>`
      }
    </td>`
  }

  const linhas = ETAPAS.map((etapa, i) => {
    const isRetorno = i === IDX_RETORNO
    const t = isRetorno ? null : (tercas[i] ?? null)
    const q = isRetorno ? null : (quartas[i] ?? null)
    const tdBR = isRetorno ? dataRetornoBR : (t ? fmtData(t.horarioISO) : "—")
    const qdBR = isRetorno ? dataRetornoBR : (q ? fmtData(q.horarioISO) : "—")
    const tMarcada = isRetorno ? veioTerca : !!t
    const qMarcada = isRetorno ? veioQuarta : !!q
    const bg = i % 2 === 0 ? "#fff" : "#f5f8fc"
    return `<tr style="background:${bg};">
      <td style="padding:6px 10px;font-size:9.5px;font-weight:600;color:#1f2937;border:1px solid #dde4f0;background:${i % 2 === 0 ? "#f0f6fb" : "#e8f2f8"};">${etapa}</td>
      ${celulaData(tdBR)}${celulaCheck(tMarcada)}${celulaData(qdBR)}${celulaCheck(qMarcada)}
    </tr>`
  }).join("")

  const orientacoesHTML = ORIENTACOES.map((o, i) =>
    `<div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:${i < ORIENTACOES.length - 1 ? "7px" : "0"};padding-bottom:${i < ORIENTACOES.length - 1 ? "7px" : "0"};border-bottom:${i < ORIENTACOES.length - 1 ? "1px solid #eef2f7" : "none"};">
      <span style="min-width:18px;height:18px;border-radius:50%;background:${AZUL};color:#fff;font-size:8px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;">${i + 1}</span>
      <span style="font-size:9px;color:#374151;line-height:1.55;">${o}</span>
    </div>`
  ).join("")

  const lembretesHTML = LEMBRETES.map((l, i) =>
    `<div style="display:flex;gap:7px;align-items:flex-start;margin-bottom:5px;">
      <span style="min-width:15px;height:15px;border-radius:50%;background:${AZUL_BG};color:${AZUL};font-size:7.5px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;">${i + 1}</span>
      <span style="font-size:8.5px;color:#4b5563;line-height:1.5;">${l}</span>
    </div>`
  ).join("")

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Cartão — ${nome}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}
  body{font-family:Arial,Helvetica,sans-serif;background:#fff;display:flex;justify-content:center;align-items:flex-start;gap:16px;padding:24px;min-height:100vh;}
  @media print{body{padding:8px;gap:12px;} @page{size:A5 landscape;margin:6mm;}}
  .card{border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.12);background:#fff;flex-shrink:0;}
</style>
</head>
<body>

<!-- FRENTE -->
<div class="card" style="width:390px;">
  <div style="background:#fff;padding:12px 16px;border-bottom:2px solid ${AZUL};display:flex;align-items:center;justify-content:space-between;gap:12px;">
    <div style="flex:1;min-width:0;">
      <p style="font-size:7px;font-weight:700;color:${AZUL};letter-spacing:0.5px;text-transform:uppercase;margin:0 0 3px;opacity:0.8;">Centro Espírita Fraternidade Anália Franco</p>
      <p style="font-size:12px;font-weight:700;color:#1f2937;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${nome}</p>
      <p style="font-size:7.5px;color:#6b7280;margin:2px 0 0;font-weight:500;">Cód: ${codigoBarras} • Início: ${inicioBR}</p>
    </div>
  </div>

  <div style="padding:12px 14px 0;">
    <table style="width:100%;border-collapse:collapse;">
      <thead>
        <tr>
          <th style="padding:5px 8px;font-size:8px;font-weight:700;color:#fff;background:${AZUL};border:1px solid #163d5a;text-align:left;" rowspan="2">Etapa</th>
          <th style="padding:5px 8px;font-size:8px;font-weight:700;color:#fff;background:${AZUL};border:1px solid #163d5a;text-align:center;" colspan="2">Terça-Feira · 19h45</th>
          <th style="padding:5px 8px;font-size:8px;font-weight:700;color:#fff;background:${AZUL};border:1px solid #163d5a;text-align:center;" colspan="2">Quarta-Feira · 19h45</th>
        </tr>
        <tr>
          <th style="padding:4px 6px;font-size:7.5px;font-weight:600;color:#fff;background:#1e5580;border:1px solid #163d5a;text-align:center;">Data</th>
          <th style="padding:4px 6px;font-size:7.5px;font-weight:600;color:#fff;background:#1e5580;border:1px solid #163d5a;text-align:center;">Presença</th>
          <th style="padding:4px 6px;font-size:7.5px;font-weight:600;color:#fff;background:#1e5580;border:1px solid #163d5a;text-align:center;">Data</th>
          <th style="padding:4px 6px;font-size:7.5px;font-weight:600;color:#fff;background:#1e5580;border:1px solid #163d5a;text-align:center;">Presença</th>
        </tr>
      </thead>
      <tbody>${linhas}</tbody>
    </table>
  </div>
  <div style="padding:10px 14px 14px;">
    <p style="font-size:7.5px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:${AZUL};margin-bottom:7px;">Lembretes</p>
    ${lembretesHTML}
  </div>
  <div style="background:${AZUL}12;border-top:2px solid ${AZUL}22;padding:6px 14px;text-align:center;">
    <p style="font-size:7px;font-weight:600;color:${AZUL};opacity:0.7;letter-spacing:0.5px;text-transform:uppercase;">Centro Espírita Fraternidade Anália Franco</p>
  </div>
</div>

<!-- VERSO -->
<div class="card" style="width:320px;">
  <div style="background:linear-gradient(135deg,${AZUL} 0%,${AZUL_LIGHT} 100%);padding:16px 18px;text-align:center;">
    <p style="font-size:7.5px;font-weight:700;color:rgba(255,255,255,0.75);letter-spacing:1.2px;text-transform:uppercase;margin-bottom:6px;">Centro Espírita Fraternidade Anália Franco</p>
    <p style="font-size:12px;font-weight:700;color:#fff;letter-spacing:0.3px;text-transform:uppercase;">Orientações para o Tratamento</p>
  </div>
  <div style="padding:14px 16px 16px;">${orientacoesHTML}</div>
  <div style="background:${AZUL}12;border-top:2px solid ${AZUL}22;padding:6px 14px;text-align:center;">
    <p style="font-size:7px;font-weight:600;color:${AZUL};opacity:0.7;letter-spacing:0.5px;text-transform:uppercase;">Tratamento Espiritual</p>
  </div>
</div>

<script>window.onload = () => setTimeout(() => { window.print(); }, 400);</script>
</body>
</html>`
}

export default function ModalCartaoTratamento({ pacienteId, nome, codigoBarras, onFechar }: ModalCartaoTratamentoProps) {
  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [presencas, setPresencas] = useState<Presenca[]>([])
  const [loading, setLoading] = useState(true)
  const [imprimindo, setImprimindo] = useState(false)
  const [lado, setLado] = useState<"frente" | "verso">("frente")

  useEffect(() => {
    async function carregar() {
      try {
        const [resPac, resRel] = await Promise.all([
          fetch(`/api/pacientes/${pacienteId}`),
          fetch(`/api/relatorios`),
        ])
        const pac: Paciente = await resPac.json()
        const todos: Presenca[] = await resRel.json()
        const minhas = todos
          .filter(r => r.codigoBarras === pac.codigoBarras && r.tipo === "paciente")
          .sort((a, b) => new Date(a.horarioISO).getTime() - new Date(b.horarioISO).getTime())
        setPaciente(pac)
        setPresencas(minhas)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    carregar()
  }, [pacienteId])

  const tercas = presencas.filter(p => diaSemana(p.horarioISO) === 2)
  const quartas = presencas.filter(p => diaSemana(p.horarioISO) === 3)
  const dataRetornoISO = paciente?.dataUltimaConsulta ?? null
  const dataRetornoBR = fmtData(dataRetornoISO)
  const inicioBR = fmtData(paciente?.dataPrimeiraConsulta)

  function veioNoRetorno(dia: 2 | 3) {
    if (!dataRetornoISO) return false
    const retornoStr = new Date(dataRetornoISO).toDateString()
    return presencas.some(p => diaSemana(p.horarioISO) === dia && new Date(p.horarioISO).toDateString() === retornoStr)
  }

  function imprimir() {
    if (!paciente) return
    setImprimindo(true)
    const html = gerarHtmlImpressao(
      nome, codigoBarras, inicioBR,
      tercas, quartas, dataRetornoBR,
      veioNoRetorno(2), veioNoRetorno(3),
    )
    const w = window.open("", "_blank")
    if (w) {
      w.document.write(html)
      w.document.close()
    }
    setTimeout(() => setImprimindo(false), 800)
  }

  if (loading) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      >
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!paciente) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      >
        <div style={{ background: "var(--card)", padding: "20px", borderRadius: "8px", textAlign: "center" }}>
          <p style={{ color: "var(--muted-foreground)" }}>Erro ao carregar paciente</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: "color-mix(in srgb, var(--sidebar-bg) 75%, transparent)" }}
        onClick={onFechar}
      />

      {/* Card do cartão */}
      <div
        className="relative z-10 w-full"
        style={{
          maxWidth: 800,
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          background: "color-mix(in srgb, var(--card) 96%, transparent)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid var(--border)",
          borderRadius: "calc(var(--radius) * 2)",
          boxShadow: "0 24px 48px rgba(0,0,0,0.35)",
          overflow: "hidden",
        }}
      >
        {/* Botão fechar */}
        <button
          onClick={onFechar}
          style={{
            position: "absolute", top: 10, right: 10, zIndex: 10,
            width: 28, height: 28, borderRadius: "50%",
            background: "rgba(0,0,0,0.25)", border: "none",
            cursor: "pointer", color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <X size={14} />
        </button>

        {/* Área scrollável do cartão */}
        <div style={{ flex: 1 }}>
          {lado === "frente" ? (
            <CartaoFrente
              paciente={paciente}
              tercas={tercas}
              quartas={quartas}
              dataRetornoBR={dataRetornoBR}
              inicioBR={inicioBR}
              veioTerca={veioNoRetorno(2)}
              veioQuarta={veioNoRetorno(3)}
            />
          ) : (
            <CartaoVerso />
          )}
        </div>

        {/* ── Barra inferior: navegação + imprimir ── */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 20px",
          borderTop: `2px solid ${AZUL}20`,
          background: `${AZUL}08`,
          flexShrink: 0,
          gap: 8,
        }}>
          {/* Botões Frente / Verso */}
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <button
              onClick={() => setLado("frente")}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "7px 14px", borderRadius: "var(--radius)",
                border: lado === "frente" ? `2px solid ${AZUL}` : "2px solid var(--border)",
                background: lado === "frente" ? AZUL_BG : "transparent",
                color: lado === "frente" ? AZUL : "var(--muted-foreground)",
                fontSize: 12, fontWeight: 700, cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <ChevronLeft size={13} /> Frente
            </button>
            <button
              onClick={() => setLado("verso")}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "7px 14px", borderRadius: "var(--radius)",
                border: lado === "verso" ? `2px solid ${AZUL}` : "2px solid var(--border)",
                background: lado === "verso" ? AZUL_BG : "transparent",
                color: lado === "verso" ? AZUL : "var(--muted-foreground)",
                fontSize: 12, fontWeight: 700, cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              Verso <ChevronRight size={13} />
            </button>
          </div>

          {/* Botão Imprimir */}
          <button
            onClick={imprimir}
            disabled={imprimindo}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "9px 20px",
              background: imprimindo ? "var(--muted)" : AZUL,
              color: "#fff",
              border: "none", borderRadius: "var(--radius)",
              cursor: imprimindo ? "not-allowed" : "pointer",
              fontSize: 13, fontWeight: 600,
              opacity: imprimindo ? 0.6 : 1,
              transition: "opacity 0.15s",
            }}
          >
            {imprimindo
              ? <Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} />
              : <Printer size={14} />}
            {imprimindo ? "Preparando..." : "Imprimir Cartão"}
          </button>
        </div>
      </div>

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

/* ── Cartão Frente ── */
function CartaoFrente({
  paciente,
  tercas,
  quartas,
  dataRetornoBR,
  inicioBR,
  veioTerca,
  veioQuarta,
}: {
  paciente: Paciente
  tercas: Presenca[]
  quartas: Presenca[]
  dataRetornoBR: string
  inicioBR: string
  veioTerca: boolean
  veioQuarta: boolean
}) {
  return (
    <div>
      {/* Tabela */}
      <div style={{ flex: 1}}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            tableLayout: "fixed",
            fontSize: 13,
          }}
        >
          <thead>
            <tr style={{ background: AZUL }}>
              <th
                rowSpan={2}
                style={{
                  padding: "10px 8px",
                  textAlign: "left",
                  color: "rgba(255,255,255,0.9)",
                  fontWeight: 700,
                  fontSize: 12,
                  width: "28%",
                }}
              >
                Etapa
              </th>

              <th
                colSpan={2}
                style={{
                  padding: "10px 6px",
                  textAlign: "center",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 11,
                  borderLeft: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                Terça · 19h45
              </th>

              <th
                colSpan={2}
                style={{
                  padding: "10px 6px",
                  textAlign: "center",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 11,
                  borderLeft: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                Quarta · 19h45
              </th>
            </tr>

            <tr style={{ background: "#1e5580" }}>
              {["Data", "✓", "Data", "✓"].map((txt, i) => (
                <th
                  key={i}
                  style={{
                    padding: "8px 4px",
                    color: "rgba(255,255,255,0.9)",
                    fontWeight: 600,
                    fontSize: 10,
                    borderLeft: "1px solid rgba(255,255,255,0.2)",
                    textAlign: "center",
                  }}
                >
                  {txt}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {ETAPAS.map((etapa, i) => {
              const isRetorno = i === IDX_RETORNO
              const t = isRetorno ? null : (tercas[i] ?? null)
              const q = isRetorno ? null : (quartas[i] ?? null)

              const tdBR = isRetorno
                ? dataRetornoBR
                : t
                ? fmtData(t.horarioISO)
                : "—"

              const qdBR = isRetorno
                ? dataRetornoBR
                : q
                ? fmtData(q.horarioISO)
                : "—"

              const tMarcada = isRetorno ? veioTerca : !!t
              const qMarcada = isRetorno ? veioQuarta : !!q

              return (
                <tr
                  key={etapa}
                  style={{
                    background: i % 2 === 0 ? "#fff" : "#f9fafb",
                  }}
                >
                  <td
                    style={{
                      padding: "10px 8px",
                      fontWeight: 600,
                      fontSize: 12,
                      color: "#1f2937",
                      borderBottom: i < ETAPAS.length - 1 ? "1px solid #e5e7eb" : "none",
                    }}
                  >
                    {etapa}
                  </td>

                  <td
                    style={{
                      padding: "10px 6px",
                      textAlign: "center",
                      fontSize: 11,
                      color: tdBR === "—" ? "#9ca3af" : "#1f2937",
                      borderLeft: "1px solid #e5e7eb",
                      borderBottom: i < ETAPAS.length - 1 ? "1px solid #e5e7eb" : "none",
                      fontWeight: tdBR === "—" ? 400 : 600,
                    }}
                  >
                    {tdBR}
                  </td>

                  <td
                    style={{
                      padding: "10px 6px",
                      textAlign: "center",
                      borderLeft: "1px solid #e5e7eb",
                      borderBottom: i < ETAPAS.length - 1 ? "1px solid #e5e7eb" : "none",
                    }}
                  >
                    {tMarcada ? (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          background: AZUL_BG,
                          color: AZUL,
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        ✓
                      </span>
                    ) : (
                      <span
                        style={{
                          display: "inline-block",
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          border: "1.5px solid #e5e7eb",
                        }}
                      />
                    )}
                  </td>

                  <td
                    style={{
                      padding: "10px 6px",
                      textAlign: "center",
                      fontSize: 11,
                      color: qdBR === "—" ? "#9ca3af" : "#1f2937",
                      borderLeft: "1px solid #e5e7eb",
                      borderBottom: i < ETAPAS.length - 1 ? "1px solid #e5e7eb" : "none",
                      fontWeight: qdBR === "—" ? 400 : 600,
                    }}
                  >
                    {qdBR}
                  </td>

                  <td
                    style={{
                      padding: "10px 6px",
                      textAlign: "center",
                      borderLeft: "1px solid #e5e7eb",
                      borderBottom: i < ETAPAS.length - 1 ? "1px solid #e5e7eb" : "none",
                    }}
                  >
                    {qMarcada ? (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          background: AZUL_BG,
                          color: AZUL,
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        ✓
                      </span>
                    ) : (
                      <span
                        style={{
                          display: "inline-block",
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          border: "1.5px solid #e5e7eb",
                        }}
                      />
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ── Cartão Verso ── */
function CartaoVerso() {
  return (
    <div style={{
      background: "#fff",
      display: "flex",
      flexDirection: "column",
      overflowY: "auto",
    }}>

      {/* Orientações */}
      <div style={{ padding: "16px 20px" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {ORIENTACOES.map((o, i) => (
            <div key={i} style={{
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
              padding: "10px 0",
              borderBottom: i < ORIENTACOES.length - 1 ? "1px solid #f0f1f3" : "none",
            }}>
              <span style={{
                minWidth: 22, height: 22, borderRadius: "50%",
                background: AZUL, color: "#fff",
                fontSize: 10, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>{i + 1}</span>
              <span style={{ fontSize: 12, color: "#374151", lineHeight: 1.55 }}>{o}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}