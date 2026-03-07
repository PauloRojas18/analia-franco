import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, GraduationCap, CalendarCheck, UserCheck, Clock } from "lucide-react"

const stats = [
  {
    label: "Total de Pacientes e Alunos",
    value: 45,
    description: "22 Alunos, 16 Pacientes, 38 Ativos",
    icon: Users,
    color: "var(--primary)"
  },
  {
    label: "Total de Instrutores e Trabalhadores",
    value: 12,
    description: "4 Intrutores, 6 Trabalhadores, 10 Ativos",
    icon: GraduationCap,
    color: "var(--accent)"
  },
  {
    label: "Presencas Hoje",
    value: 23,
    description: "18 pacientes, 5 instrutores",
    icon: CalendarCheck,
    color: "var(--success)"
  },
  {
    label: "Pacientes Hoje",
    value: 18,
    description: "Registrados hoje",
    icon: UserCheck,
    color: "#5a7a90"
  }
]

const recentPresencas = [
  { id: 1, pessoaNome: "Maria Silva", tipo: "paciente", horario: "14:32", codigoBarras: "PAC001234567" },
  { id: 2, pessoaNome: "Joao Santos", tipo: "paciente", horario: "14:28", codigoBarras: "PAC001234568" },
  { id: 3, pessoaNome: "Dr. Pedro Alves", tipo: "instrutor", horario: "14:15", codigoBarras: "INS001234567" },
  { id: 4, pessoaNome: "Ana Oliveira", tipo: "paciente", horario: "13:58", codigoBarras: "PAC001234569" },
  { id: 5, pessoaNome: "Carlos Pereira", tipo: "paciente", horario: "13:45", codigoBarras: "PAC001234570" },
  { id: 6, pessoaNome: "Dra. Lucia Ferreira", tipo: "instrutor", horario: "13:30", codigoBarras: "INS001234568" },
  { id: 7, pessoaNome: "Roberto Lima", tipo: "paciente", horario: "13:15", codigoBarras: "PAC001234571" },
  { id: 8, pessoaNome: "Fernanda Costa", tipo: "paciente", horario: "13:00", codigoBarras: "PAC001234572" },
]

export default function DashboardPage() {
  const currentDate = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Painel de Controle</h1>
        <p className="mt-1 text-sm capitalize text-muted-foreground">{currentDate}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
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
            Ultimas Presencas de Hoje
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Nome</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Tipo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Horario</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden md:table-cell">Codigo</th>
                </tr>
              </thead>
              <tbody>
                {recentPresencas.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-secondary/50">
                    <td className="px-4 py-3 font-medium">{p.pessoaNome}</td>
                    <td className="px-4 py-3">
                      <Badge variant={p.tipo === 'paciente' ? 'default' : 'secondary'}>
                        {p.tipo === 'paciente' ? 'Paciente' : 'Instrutor'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm">{p.horario}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground hidden md:table-cell">{p.codigoBarras}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
