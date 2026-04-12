// components/ModalCracha.tsx
"use client"

import { useEffect, useRef, useState } from "react"
import { X, Printer } from "lucide-react"

interface Props {
  nome: string
  tipo: string
  codigoBarras: string
  subtitulo?: string   // ← campo extra: ex. bloco de estudo ou "Tratamento Espiritual"
  onFechar: () => void
}

const TIPO_COR: Record<string, { bg: string; accent: string; label: string }> = {
  paciente:    { bg: "#1e6b94", accent: "#1a9e7a", label: "Paciente"     },
  aluno:       { bg: "#6d28d9", accent: "#a78bfa", label: "Aluno"        },
  instrutor:   { bg: "#b45309", accent: "#fbbf24", label: "Instrutor"    },
  trabalhador: { bg: "#ea580c", accent: "#fdba74", label: "Voluntário" },
}

export default function ModalCracha({ nome, tipo, codigoBarras, subtitulo, onFechar }: Props) {
  const cor = TIPO_COR[tipo] ?? { bg: "#333", accent: "#666", label: tipo }
  const iniciais = nome.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase()
  const [barcodeSVG, setBarcodeSVG] = useState<string>("")

  // Texto exibido no topo do header (dentro do crachá)
  const orgNome = subtitulo ?? "Obras Sociais Anália Franco"

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
    .cracha-header { padding: 20px 16px 16px; text-align: center; background: linear-gradient(135deg, ${cor.bg} 0%, ${cor.accent} 100%); }
    .org-nome { font-size: 9px; font-weight: 700; color: rgba(255,255,255,0.85); letter-spacing: 1px; text-transform: uppercase; margin-bottom: 12px; }
    .avatar { width: 60px; height: 60px; border-radius: 50%; background: rgba(255,255,255,0.25); border: 2px solid rgba(255,255,255,0.5); color: #fff; font-size: 22px; font-weight: 700; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px; }
    .tipo-badge { display: inline-block; font-size: 9px; font-weight: 700; color: #fff; padding: 3px 10px; border-radius: 20px; letter-spacing: 1.5px; background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.4); }
    .cracha-body { padding: 16px; text-align: center; }
    .nome { font-size: 15px; font-weight: 700; color: #1a1a2e; line-height: 1.3; margin-bottom: 12px; }
    .divider { height: 1px; background: #eee; margin: 12px 0; }
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
      <div class="org-nome">${orgNome === "Assistidos" ? "Trabalho Assistencial Silvana Maria" : orgNome}</div>
      <div class="avatar">${iniciais}</div>
      <div class="tipo-badge">${cor.label.toUpperCase()}</div>
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
      <div className="absolute inset-0"
        style={{ background: "color-mix(in srgb, var(--sidebar-bg) 75%, transparent)" }}
        onClick={onFechar} />

      <div className="relative z-10 w-full max-w-xs"
        style={{
          background: "color-mix(in srgb, var(--card) 96%, transparent)",
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          border: "1px solid var(--border)",
          borderRadius: "calc(var(--radius) * 2)",
          boxShadow: "0 24px 48px rgba(0,0,0,0.35)",
          overflow: "hidden",
        }}>

        <button onClick={onFechar} style={{
          position: "absolute", top: 10, right: 10, zIndex: 10,
          width: 28, height: 28, borderRadius: "50%",
          background: "rgba(0,0,0,0.25)", border: "none",
          cursor: "pointer", color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <X size={14} />
        </button>

        {/* Header */}
        <div style={{
          background: `linear-gradient(135deg, ${cor.bg} 0%, ${cor.accent} 100%)`,
          padding: "28px 24px 20px", textAlign: "center",
        }}>
          <p style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.8)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>
            {orgNome === "Assistidos" ? "Trabalho Assistencial Silvana Maria" : orgNome}
          </p>
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "rgba(255,255,255,0.25)", border: "2px solid rgba(255,255,255,0.5)",
            color: "#fff", fontSize: 22, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 10px",
          }}>{iniciais}</div>
          <span style={{
            fontSize: 9, fontWeight: 700, color: "#fff",
            padding: "3px 12px", borderRadius: 20, letterSpacing: 1.5,
            background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.4)",
          }}>{cor.label.toUpperCase()}</span>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 24px", textAlign: "center" }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: "var(--foreground)", lineHeight: 1.3, marginBottom: 16 }}>
            {nome}
          </p>
          <div style={{ height: 1, background: "var(--border)", marginBottom: 16 }} />

          <div
            style={{ display: "flex", justifyContent: "center", marginBottom: 8, opacity: 0.85, minHeight: 48 }}
            dangerouslySetInnerHTML={{ __html: barcodeSVG || "" }}
          />

          <p style={{ fontFamily: "monospace", fontSize: 10, color: "var(--muted-foreground)", letterSpacing: 1 }}>
            {codigoBarras}
          </p>
        </div>

        {/* Footer */}
        <div style={{ padding: "8px 16px", textAlign: "center", background: `${cor.bg}12`, borderTop: `2px solid ${cor.bg}20` }}>
          <p style={{ fontSize: 8, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: cor.bg, opacity: 0.75 }}>
            Centro Espírita Fraternidade Anália Franco
          </p>
        </div>

        {/* Botão imprimir */}
        <div style={{ padding: "16px 24px" }}>
          <button onClick={imprimir} style={{
            width: "100%", padding: "12px",
            background: cor.bg, color: "#fff",
            border: "none", borderRadius: "var(--radius)",
            cursor: "pointer", fontSize: 14, fontWeight: 600,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            <Printer size={16} />
            Imprimir Crachá
          </button>
        </div>
      </div>
    </div>
  )
}
