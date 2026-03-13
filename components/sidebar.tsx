"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { LayoutGrid, Users, GraduationCap, Briefcase, HeartPulse, ScanBarcode, FileText, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

const navItems = [
  { href: "/dashboard", label: "Painel", icon: LayoutGrid, page: "dashboard" },
  { href: "/pacientes", label: "Pacientes", icon: HeartPulse, page: "pacientes" },
  { href: "/alunos", label: "Alunos", icon: Users, page: "alunos" },
  { href: "/instrutores", label: "Instrutores", icon: GraduationCap, page: "instrutores" },
  { href: "/trabalhadores", label: "Voluntários", icon: Briefcase, page: "trabalhadores" },
  { href: "/presenca", label: "Registrar Presenca", icon: ScanBarcode, page: "presenca" },
  { href: "/relatorios", label: "Relatorios", icon: FileText, page: "relatorios" },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 flex h-10 w-10 items-center justify-center rounded-md lg:hidden"
        style={{ background: "var(--sidebar-bg)", color: "var(--sidebar-foreground)" }}
        aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/35 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 flex h-screen w-[260px] flex-col transition-transform duration-300 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ background: "var(--sidebar-bg)", color: "var(--sidebar-foreground)" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5" style={{ borderBottom: "1px solid var(--sidebar-border)" }}>
          <div className="relative h-[50px] w-[50px] shrink-0 overflow-hidden rounded-md">
            <Image
              src="/images/analia.png"
              alt="Logo Analia Franco"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div>
            <h1 className="text-[15px] font-semibold leading-tight">Anália Franco</h1>
            <p className="text-[11px] opacity-55">Sistema de Presença</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3.5 py-2.5 text-sm font-medium transition-all duration-150",
                    isActive(item.href)
                      ? "opacity-100"
                      : "opacity-70 hover:opacity-100"
                  )}
                  style={{
                    background: isActive(item.href) ? "var(--sidebar-accent)" : "transparent",
                  }}
                >
                  <item.icon className="h-[18px] w-[18px] shrink-0" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div
          className="px-6 py-4 text-xs opacity-45"
          style={{ borderTop: "1px solid var(--sidebar-border)" }}
        >
          Paz e Luz
        </div>
      </aside>
    </>
  )
}
