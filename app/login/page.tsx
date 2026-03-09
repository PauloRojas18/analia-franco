"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

const Background_Images = [
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80",
  "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1920&q=80",
  "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=1920&q=80",
]

const SLIDE_INTERVAL_MS = 4000

export default function LoginPage() {
  const router = useRouter()

  const [currentSlide, setCurrentSlide] = useState(0)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  // Slideshow
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % Background_Images.length)
    }, SLIDE_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [])

  // Login handler
 // Função de login
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha: password }),
      })

      const data = await res.json()
      console.log("Login API:", data)

      if (res.ok) {
        console.log("Login OK, redirecionando...")
        router.push("/dashboard")
      } else {
        alert(data.error || "E-mail ou senha incorretos")
      }
    } catch (err) {
      console.error(err)
      alert("Erro ao fazer login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden flex items-center justify-center">

      {/* SLIDES */}
      {Background_Images.map((img, index) => (
        <div
          key={index}
          style={{ backgroundImage: `url(${img})` }}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {/* OVERLAY */}
      <div
        className="absolute inset-0"
        style={{ background: "color-mix(in srgb, var(--sidebar-bg) 75%, transparent)" }}
      />

      {/* INDICADORES */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {Background_Images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className="rounded-full transition-all duration-300 cursor-pointer"
            style={{
              width: index === currentSlide ? "24px" : "8px",
              height: "8px",
              background: index === currentSlide ? "var(--primary)" : "rgba(255,255,255,0.35)",
            }}
          />
        ))}
      </div>

      {/* FORM CARD */}
      <div
        className="relative z-10"
        style={{ transform: "scale(0.8)", transformOrigin: "center center" }}
      >
        <div
          style={{
            width: "400px",
            background: "color-mix(in srgb, var(--card) 92%, transparent)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid var(--border)",
            borderRadius: "calc(var(--radius) * 2)",
            boxShadow: "0 24px 48px rgba(0,0,0,0.35), 0 1px 0 rgba(255,255,255,0.06) inset",
          }}
        >
          <div className="p-10">

            {/* Cabeçalho */}
            <div className="mb-8 text-center">
              <div className="relative h-[130px] w-[100px] flex items-center justify-center mx-auto mb-5 rounded-2xl">
                <Image
                  src="/images/analia.png"
                  alt="Logo Analia Franco"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <h1 className="font-bold" style={{ color: "var(--primary)", letterSpacing: "-0.3px", fontSize: "25px" }}>
                Bem-vindo
              </h1>
            </div>

            {/* FORM */}
            <form onSubmit={handleLogin} className="flex flex-col gap-4">

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
                  E-mail
                </label>
                <div className="relative">
                  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    width="15" height="15" viewBox="0 0 24 24" fill="none"
                    stroke="var(--muted-foreground)" strokeWidth="2">
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
                      background: "var(--background)",
                      border: "1px solid var(--border)",
                      color: "var(--foreground)",
                      borderRadius: "var(--radius)",
                    }}
                  />
                </div>
              </div>

              {/* Senha */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
                  Senha
                </label>
                <div className="relative">
                  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    width="15" height="15" viewBox="0 0 24 24" fill="none"
                    stroke="var(--muted-foreground)" strokeWidth="2">
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
                  />
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

              {/* Botão submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-sm font-semibold transition-all mt-1 flex items-center justify-center gap-2"
                style={{
                  background: loading ? "var(--muted)" : "var(--primary)",
                  color: loading ? "var(--muted-foreground)" : "var(--primary-foreground)",
                  border: "none",
                  borderRadius: "var(--radius)",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
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

            {/* Rodapé */}
            <div className="mt-6 pt-6 text-center" style={{ borderTop: "1px solid var(--border)" }}>
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                Obras Sociais Anália Franco
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Animação spinner */}
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