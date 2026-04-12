// app/(app)/dashboard/page.tsx
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, GraduationCap, CalendarCheck, UserCheck, Clock, Loader2 } from "lucide-react"

interface Stats {
  totalPessoasAtendidas: number
  totalPessoasAtendidasDesc: string
  totalEquipe: number
  totalEquipeDesc: string
  totalPresencasHoje: number
  presencasHojeDesc: string
  pacientesHoje: number
}

interface Presenca {
  id: number
  pessoaNome: string
  tipo: string
  horario: string
  codigoBarras: string
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [presencas, setPresencas] = useState<Presenca[]>([])
  const [loading, setLoading] = useState(true)

  const currentDate = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch("/api/dashboard")
        const data = await res.json()
        setStats(data.stats)
        setPresencas(data.ultimasPresencas)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
    // Atualiza a cada 30 segundos
    const interval = setInterval(fetchDashboard, 30000)
    return () => clearInterval(interval)
  }, [])

  const statCards = stats
    ? [
        {
          label: "Total de Pacientes e Alunos",
          value: stats.totalPessoasAtendidas,
          description: stats.totalPessoasAtendidasDesc,
          icon: Users,
          color: "var(--primary)",
        },
        {
          label: "Total de Instrutores e Voluntários",
          value: stats.totalEquipe,
          description: stats.totalEquipeDesc.replace('Trabalhadores', 'Voluntários'),
          icon: GraduationCap,
          color: "var(--accent)",
        },
        {
          label: "Presenças Hoje",
          value: stats.totalPresencasHoje,
          description: stats.presencasHojeDesc.replace('trabalhadors', 'Voluntários') || "Nenhuma presença hoje",
          icon: CalendarCheck,
          color: "var(--success)",
        },
        {
          label: "Pacientes Hoje",
          value: stats.pacientesHoje,
          description: "Registrados hoje",
          icon: UserCheck,
          color: "#5a7a90",
        },
      ]
    : []

  const tipoLabel: Record<string, string> = {
    paciente: "Paciente",
    aluno: "Aluno",
    instrutor: "Instrutor",
    trabalhador: "Voluntário",
  }

  const tipoBadge: Record<string, "default" | "secondary" | "outline"> = {
    paciente: "default",
    aluno: "default",
    instrutor: "secondary",
    trabalhador: "secondary",
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Painel de Controle</h1>
        <p className="mt-1 text-sm capitalize text-muted-foreground">{currentDate}</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((stat) => (
              <Card key={stat.label} className="shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-md"
                      style={{ background: stat.color }}
                    >
                      <stat.icon className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                  <p className="mt-1 text-xs text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Clock className="h-4 w-4 text-primary" />
                Últimas Presenças de Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              {presencas.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhuma presença registrada hoje.
                </p>
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
                        <tr key={p.id} className="border-b border-border last:border-0 hover:bg-secondary/50">
                          <td className="px-4 py-3 font-medium">{p.pessoaNome}</td>
                          <td className="px-4 py-3">
                            <Badge variant={tipoBadge[p.tipo] ?? "outline"}>
                              {tipoLabel[p.tipo === 'Assistidos' ? 'T.A Silvana Maria' : p.tipo] ?? p.tipo}
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
        </>
      )}
    </div>
  )
}