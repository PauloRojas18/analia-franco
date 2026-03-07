"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

const BACKGROUND_IMAGES = [
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80",
  "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1920&q=80",
  "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=1920&q=80",
]

// ⏱️ Tempo em ms entre cada troca de imagem (5000 = 5 segundos)
const SLIDE_INTERVAL_MS = 5000

export default function LoginPage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  // ⚙️ Timer do slideshow — troca a imagem automaticamente
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % BACKGROUND_IMAGES.length)
    }, SLIDE_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [])

  // 🔐 Submit do login — substitua pela sua lógica real de autenticação
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await new Promise((r) => setTimeout(r, 1500)) // ← troque por sua chamada de API
      console.log("Login com:", { email, password })
    } finally {
      setLoading(false)
    }
  }

  return (
    // 🏗️ Container principal — ocupa a tela toda, âncora o fundo absoluto
    <div className="relative h-screen w-screen overflow-hidden flex items-center justify-center">

      {/* =====================================================
          🖼️ SLIDESHOW: uma div por imagem, só a ativa fica
          visível via opacity. A transição faz o fade suave.
          ===================================================== */}
      {BACKGROUND_IMAGES.map((img, index) => (
        <div
          key={index}
          style={{ backgroundImage: `url(${img})` }}
          className={`
            absolute inset-0 bg-cover bg-center
            transition-opacity duration-1000 ease-in-out
            ${index === currentSlide ? "opacity-100" : "opacity-0"}
          `}
        />
      ))}

      {/* =====================================================
          🌑 OVERLAY
          Escurece as imagens para garantir contraste.
          Usa a cor --sidebar-bg do seu tema (azul escuro)
          com ~75% de opacidade — combina com o sistema.
          ===================================================== */}
      <div
        className="absolute inset-0"
        style={{ background: "color-mix(in srgb, var(--sidebar-bg) 75%, transparent)" }}
      />

      {/* =====================================================
          📍 INDICADORES DO SLIDESHOW
          Bolinhas clicáveis — ativa fica com a cor --primary
          do seu design system (#1e6b94, azul).
          ===================================================== */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {BACKGROUND_IMAGES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className="rounded-full transition-all duration-300 cursor-pointer"
            style={{
              width: index === currentSlide ? "24px" : "8px",
              height: "8px",
              background: index === currentSlide
                ? "var(--primary)"           // azul ativo  → #1e6b94
                : "rgba(255,255,255,0.35)",  // cinza inativo
            }}
          />
        ))}
      </div>

      {/* =====================================================
          📋 CARD DO FORMULÁRIO
          Usa as variáveis --card, --border, --radius do CSS.
          O backdrop-blur mantém o efeito glassmorphism, mas
          agora com a paleta correta do seu design system.
          ===================================================== */}
      <div
        className="relative z-10 w-full mx-5"
        style={{
          maxWidth: "400px",
          background: "color-mix(in srgb, var(--card) 92%, transparent)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid var(--border)",
          borderRadius: "calc(var(--radius) * 2)",
          boxShadow: "0 24px 48px rgba(0,0,0,0.35), 0 1px 0 rgba(255,255,255,0.06) inset",
        }}
      >
        <div className="p-10">

          {/* ── Cabeçalho ────────────────────────────────────── */}
          <div className="mb-8 text-center">
            {/* Ícone de usuário com cor --primary */}
            <div className="relative h-[130px] w-[100px] flex items-center justify-center mx-auto mb-5 rounded-2xl">
              <Image
                src="/images/analia.png"
                alt="Logo Analia Franco"
                fill
                className="object-cover"
                priority
              />
            </div>
                      <h1
              className="text-xl font-bold"
              style={{ color: "var(--primary)", letterSpacing: "-0.3px" , fontSize:"25px"}}
            >
              Bem-vindo
            </h1>
          </div>

          {/* ── Formulário ───────────────────────────────────── */}
          <form onSubmit={handleLogin} className="flex flex-col gap-4">

            {/* Campo: E-mail */}
            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: "var(--muted-foreground)" }}
              >
                E-mail
              </label>
              <div className="relative">
                <svg
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  width="15" height="15" viewBox="0 0 24 24" fill="none"
                  stroke="var(--muted-foreground)" strokeWidth="2"
                >
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 text-sm transition-all outline-none"
                  style={{
                    background: "var(--background)",   // fundo claro do sistema
                    border: "1px solid var(--border)",  // borda --border
                    color: "var(--foreground)",          // texto escuro do sistema
                    borderRadius: "var(--radius)",       // --radius = 0.625rem
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "var(--ring)"  // destaque azul no foco
                    e.target.style.boxShadow = "0 0 0 3px color-mix(in srgb, var(--ring) 20%, transparent)"
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "var(--border)"
                    e.target.style.boxShadow = "none"
                  }}
                />
              </div>
            </div>

            {/* Campo: Senha */}
            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: "var(--muted-foreground)" }}
              >
                Senha
              </label>
              <div className="relative">
                <svg
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  width="15" height="15" viewBox="0 0 24 24" fill="none"
                  stroke="var(--muted-foreground)" strokeWidth="2"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-11 py-3 text-sm transition-all outline-none"
                  style={{
                    background: "var(--background)",
                    border: "1px solid var(--border)",
                    color: "var(--foreground)",
                    borderRadius: "var(--radius)",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "var(--ring)"
                    e.target.style.boxShadow = "0 0 0 3px color-mix(in srgb, var(--ring) 20%, transparent)"
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "var(--border)"
                    e.target.style.boxShadow = "none"
                  }}
                />
                {/* Botão olho: mostra/oculta senha — type="button" evita submit */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)" }}
                >
                  {showPassword ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Link: Esqueci a senha — cor --primary do sistema */}
            <div className="flex justify-end -mt-1">
            </div>

            {/* ── Botão submit ─────────────────────────────────
                --primary como fundo, --primary-foreground como texto.
                No loading usa --muted para indicar estado desabilitado.
                ─────────────────────────────────────────────── */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-sm font-semibold transition-all mt-1
                flex items-center justify-center gap-2"
              style={{
                background: loading ? "var(--muted)" : "var(--primary)",
                color: loading ? "var(--muted-foreground)" : "var(--primary-foreground)",
                border: "none",
                borderRadius: "var(--radius)",
                cursor: loading ? "not-allowed" : "pointer",
              }}
              onMouseOver={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.filter = "brightness(1.12)" }}
              onMouseOut={(e) => { (e.currentTarget as HTMLButtonElement).style.filter = "none" }}
            >
              {/* Spinner animado — visível só durante loading */}
              {loading && (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5"
                  style={{ animation: "spin 0.8s linear infinite" }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
              )}
              {loading ? "Entrando..." : "Entrar"}
            </button>

          </form>

          {/* ── Divisor + cadastro ────────────────────────────── */}
          <div className="mt-6 pt-6 text-center" style={{ borderTop: "1px solid var(--border)" }}>
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              Obras Sociais Anália Franco{" "}
            </p>
          </div>

        </div>
      </div>

      {/* Keyframes do spinner + cor dos placeholders */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        input::placeholder { color: var(--muted-foreground); opacity: 0.6; }
      `}</style>

    </div>
  )
}