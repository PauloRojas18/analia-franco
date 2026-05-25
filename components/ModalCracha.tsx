// components/ModalCracha.tsx
"use client"

import { useEffect, useState } from "react"
import { X, Printer } from "lucide-react"

interface Props {
  nome: string
  tipo: string
  codigoBarras: string
  subtitulo?: string
  oficina?: string
  onFechar: () => void
}

const TIPO_COR: Record<string, { bg: string; accent: string; label: string }> = {
  paciente:    { bg: "#1e6b94", accent: "#1a9e7a", label: "Paciente"   },
  aluno:       { bg: "#6d28d9", accent: "#a78bfa", label: "Aluno"      },
  alunoCurso:  { bg: "#0f4c81", accent: "#14b8a6", label: "Aluno"      },
  instrutor:   { bg: "#b45309", accent: "#fbbf24", label: "Instrutor"  },
  trabalhador: { bg: "#ea580c", accent: "#fdba74", label: "Voluntário" },
}

// Extrai a sigla de nomes de campanha (ex: "CFAS — Campanha de Auta de Souza" → "CFAS")
function extrairSigla(oficina: string): string {
  const match = oficina.match(/^([A-Z]{2,6})/)
  return match ? match[1] : oficina
}

function temSigla(oficina: string): boolean {
  return /^[A-Z]{2,6}\s*[—-]/.test(oficina)
}

export default function ModalCracha({ nome, tipo, codigoBarras, subtitulo, oficina, onFechar }: Props) {
  const isAssistido = subtitulo === "Assistidos"
  const cor =
  tipo === "aluno" && !isAssistido
    ? TIPO_COR.alunoCurso
    : TIPO_COR[tipo] ?? { bg: "#333", accent: "#666", label: tipo }
  const iniciais = nome.split(" ").filter(Boolean).slice(0, 2).map(n => n[0]).join("").toUpperCase()
  const [barcodeSVG, setBarcodeSVG] = useState<string>("")

  const oficinaNome = oficina ?? ""
  const exibirSigla = temSigla(oficinaNome)
  const oficinaBadge = exibirSigla ? extrairSigla(oficinaNome) : oficinaNome

  useEffect(() => {
    import("jsbarcode").then(({ default: JsBarcode }) => {
      try {
        const svgNode = document.createElementNS("http://www.w3.org/2000/svg", "svg")
        JsBarcode(svgNode, codigoBarras, {
          format: "CODE128",
          width: 2,
          height: 48,
          displayValue: false,
          margin: 0,
        })
        setBarcodeSVG(svgNode.outerHTML)
      } catch (e) {
        console.error("Erro ao gerar barcode", e)
      }
    })
  }, [codigoBarras])

  function imprimir() {
    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Crachá — ${nome}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f0f2f5; display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 24px; }
    .cracha { width: 260px; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.15); background: #fff; }
    .cracha-header {
      position: relative;
      padding: 20px 16px 20px;
      text-align: center;
      background: linear-gradient(135deg, ${cor.bg} 0%, ${cor.accent} 100%);
    }
    .org-nome { font-size: 9px; font-weight: 700; color: rgba(255,255,255,0.85); letter-spacing: 1px; text-transform: uppercase; margin-bottom: 12px; }
    .avatar { width: 60px; height: 60px; border-radius: 50%; background: rgba(255,255,255,0.25); border: 2px solid rgba(255,255,255,0.5); color: #fff; font-size: 22px; font-weight: 700; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px; }
    .header-badges { display: flex; align-items: center; justify-content: center; gap: 6px; flex-wrap: wrap; margin-top: 4px; }
    .header-badge { font-size: 9px; font-weight: 800; letter-spacing: 1.2px; color: rgba(255,255,255,0.95); background: rgba(255,255,255,0.18); border: 1px solid rgba(255,255,255,0.38); padding: 2px 8px; border-radius: 20px; white-space: nowrap; }
    .sep { font-size: 9px; color: rgba(255,255,255,0.55); }
    .cracha-body { padding: 14px 16px; text-align: center; }
    .nome { font-size: 14px; font-weight: 700; color: #1a1a2e; line-height: 1.3; margin-bottom: 4px; }
    .sub-label { font-size: 11px; font-weight: 600; color: #555; margin-bottom: 10px; }
    .tipo-badge { display: inline-block; font-size: 9px; font-weight: 700; padding: 3px 10px; border-radius: 20px; letter-spacing: 1.5px; background: ${cor.bg}18; border: 1px solid ${cor.bg}40; color: ${cor.bg}; margin-bottom: 10px; }
    .divider { height: 1px; background: #eee; margin: 0 0 12px; }
    .barras { display: flex; justify-content: center; margin-bottom: 6px; opacity: 0.85; }
    .barras svg { max-width: 100%; height: 36px; }
    .codigo { font-family: 'Courier New', monospace; font-size: 10px; color: #888; letter-spacing: 1px; }
    .cracha-footer { padding: 8px 12px; text-align: center; background: ${cor.bg}18; border-top: 2px solid ${cor.bg}25; }
    .footer-text { font-size: 8px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; color: ${cor.bg}; opacity: 0.8; }
    @media print { * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } body { background: white; } .cracha { box-shadow: 0 0 0 1px #ddd; } }
  </style>
</head>
<body>
  <div class="cracha">
    <div class="cracha-header">
      <div class="org-nome">${isAssistido ? "Trabalho Assistencial Silvana Maria" : (subtitulo ?? "Obras Sociais Anália Franco")}</div>
      <div class="avatar">${iniciais}</div>
      <p style="font-size:9px;font-weight:700;color:rgba(255,255,255,0.75);letter-spacing:1.5px;text-transform:uppercase;margin:6px 0 ${isAssistido && oficinaNome ? "8px" : "0"};">${isAssistido ? "Oficina" : "Aluno"}</p>
      ${isAssistido && oficinaNome
        ? `<div class="header-badges">
            <span class="header-badge">EEA</span>
            <span class="sep">—</span>
            <span class="header-badge">${oficinaBadge}</span>
           </div>`
        : ""
      }
    </div>
    <div class="cracha-body">
      <div class="nome">${nome}</div>
      <div class="divider"></div>
      <div class="barras">${barcodeSVG}</div>
      <div class="codigo">${codigoBarras}</div>
    </div>
    <div class="cracha-footer">
      <div class="footer-text">Centro Espírita Fraternidade Anália Franco</div>
    </div>
  </div>
  <script>window.onload = () => setTimeout(() => window.print(), 300)</script>
</body>
</html>`
    const w = window.open("", "_blank")
    w?.document.write(html)
    w?.document.close()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: "color-mix(in srgb, var(--sidebar-bg) 75%, transparent)" }}
        onClick={onFechar}
      />

      {/* Card do crachá */}
      <div
        className="relative z-10 w-full max-w-xs"
        style={{
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

        {/* ── Header colorido ─────────────────────────────────────────── */}
        <div style={{
          background: `linear-gradient(135deg, ${cor.bg} 0%, ${cor.accent} 100%)`,
          padding: "24px 20px 18px",
          textAlign: "center",
        }}>
          {/* Título da organização */}
          <p style={{
            fontSize: 9, fontWeight: 700,
            color: "rgba(255,255,255,0.85)",
            letterSpacing: 1, textTransform: "uppercase",
            marginBottom: 12,
          }}>
            {isAssistido
              ? "Trabalho Assistencial Silvana Maria"
              : (subtitulo ?? "Obras Sociais Anália Franco")}
          </p>

          {/* Avatar */}
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "rgba(255,255,255,0.25)",
            border: "2px solid rgba(255,255,255,0.5)",
            color: "#fff", fontSize: 22, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 12px",
          }}>
            {iniciais}
          </div>

          {/* Label abaixo do avatar: "Oficina" ou "Aluno" */}
          <p style={{
            fontSize: 9, fontWeight: 700, color: "#fff", width: "fit-content", margin: "0 auto",
            alignItems: "center", justifyContent: "center", display: "flex",
            padding: "3px 12px", borderRadius: 20, letterSpacing: 1.5,
            background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.4)",
            marginBottom: isAssistido && oficinaNome ? 8 : 0,
          }}>
            {isAssistido ? "Oficina" : cor.label.toUpperCase()}
          </p>

          {/* Badges EEA + oficina — apenas para Assistidos */}
          {isAssistido && oficinaNome && (
            <div style={{
              display: "flex", alignItems: "center",
              justifyContent: "center", gap: 6,
              flexWrap: "wrap",
            }}>
              <span style={{
                fontSize: 9, fontWeight: 800, letterSpacing: 1.2,
                color: "rgba(255,255,255,0.95)",
                background: "rgba(255,255,255,0.18)",
                border: "1px solid rgba(255,255,255,0.38)",
                padding: "2px 8px", borderRadius: 20,
                whiteSpace: "nowrap",
              }}>
                EEA
              </span>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.55)" }}>—</span>
              <span style={{
                fontSize: 9, fontWeight: 800, letterSpacing: 1.2,
                color: "rgba(255,255,255,0.95)",
                background: "rgba(255,255,255,0.18)",
                border: "1px solid rgba(255,255,255,0.38)",
                padding: "2px 8px", borderRadius: 20,
                whiteSpace: "nowrap",
              }}>
                {oficinaBadge}
              </span>
            </div>
          )}
        </div>

        {/* ── Body ──────────────────────────────────────────────────────── */}
        <div style={{ padding: "18px 20px", textAlign: "center" }}>
          {/* Nome */}
          <p style={{
            fontSize: 15, fontWeight: 700,
            color: "var(--foreground)",
            lineHeight: 1.3,
            marginBottom: 12,
          }}>
            {nome}
          </p>

          {isAssistido && (
            <p style={{
              fontSize: 14, fontWeight: 700,
              color: "var(--foreground)",
              marginBottom: 10,
            }}>
              Aluno
            </p>
          )}

          {/* Divisor */}
          <div style={{ height: 1, background: "var(--border)", marginBottom: 14 }} />

          {/* Código de barras */}
          <div
            style={{
              display: "flex", justifyContent: "center",
              marginBottom: 8, opacity: 0.85, minHeight: 48,
            }}
            dangerouslySetInnerHTML={{ __html: barcodeSVG || "" }}
          />
          <p style={{
            fontFamily: "monospace", fontSize: 10,
            color: "var(--muted-foreground)", letterSpacing: 1,
          }}>
            {codigoBarras}
          </p>
        </div>

        {/* ── Footer ────────────────────────────────────────────────────── */}
        <div style={{
          padding: "8px 16px", textAlign: "center",
          background: `${cor.bg}12`,
          borderTop: `2px solid ${cor.bg}20`,
        }}>
          <p style={{
            fontSize: 8, fontWeight: 600, letterSpacing: 0.5,
            textTransform: "uppercase",
            color: cor.bg, opacity: 0.75,
          }}>
            Centro Espírita Fraternidade Anália Franco
          </p>
        </div>

        {/* ── Botão imprimir ─────────────────────────────────────────────── */}
        <div style={{ padding: "14px 20px" }}>
          <button
            onClick={imprimir}
            style={{
              width: "100%", padding: "11px",
              background: cor.bg, color: "#fff",
              border: "none", borderRadius: "var(--radius)",
              cursor: "pointer", fontSize: 14, fontWeight: 600,
              display: "flex", alignItems: "center",
              justifyContent: "center", gap: 8,
            }}
          >
            <Printer size={16} />
            Imprimir Crachá
          </button>
        </div>
      </div>
    </div>
  )
}