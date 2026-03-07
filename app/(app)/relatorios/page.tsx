"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Download, Printer, FileText, Users, GraduationCap, Calendar } from "lucide-react"

type TabType = 'todos' | 'pacientes' | 'instrutores'

const presencas = [
  { id: 1, pessoaNome: "Maria Silva", tipo: "paciente", data: "06/03/2026", horario: "14:32", codigoBarras: "PAC001234567" },
  { id: 2, pessoaNome: "Joao Santos", tipo: "paciente", data: "06/03/2026", horario: "14:28", codigoBarras: "PAC001234568" },
  { id: 3, pessoaNome: "Dr. Pedro Alves", tipo: "instrutor", data: "06/03/2026", horario: "14:15", codigoBarras: "INS001234567" },
  { id: 4, pessoaNome: "Ana Oliveira", tipo: "paciente", data: "06/03/2026", horario: "13:58", codigoBarras: "PAC001234569" },
  { id: 5, pessoaNome: "Carlos Pereira", tipo: "paciente", data: "06/03/2026", horario: "13:45", codigoBarras: "PAC001234570" },
  { id: 6, pessoaNome: "Dra. Lucia Ferreira", tipo: "instrutor", data: "06/03/2026", horario: "13:30", codigoBarras: "INS001234568" },
  { id: 7, pessoaNome: "Roberto Lima", tipo: "paciente", data: "06/03/2026", horario: "13:15", codigoBarras: "PAC001234571" },
  { id: 8, pessoaNome: "Fernanda Costa", tipo: "paciente", data: "06/03/2026", horario: "13:00", codigoBarras: "PAC001234572" },
  { id: 9, pessoaNome: "Prof. Ricardo Gomes", tipo: "instrutor", data: "06/03/2026", horario: "12:45", codigoBarras: "INS001234569" },
  { id: 10, pessoaNome: "Paula Costa", tipo: "paciente", data: "06/03/2026", horario: "12:30", codigoBarras: "PAC001234573" },
  { id: 11, pessoaNome: "Maria Silva", tipo: "paciente", data: "05/03/2026", horario: "14:20", codigoBarras: "PAC001234567" },
  { id: 12, pessoaNome: "Dr. Pedro Alves", tipo: "instrutor", data: "05/03/2026", horario: "14:00", codigoBarras: "INS001234567" },
]

export default function RelatoriosPage() {
  const [selectedDate, setSelectedDate] = useState("2026-03-06")
  const [activeTab, setActiveTab] = useState<TabType>('todos')

  const pacPresencas = presencas.filter(p => p.tipo === 'paciente')
  const instPresencas = presencas.filter(p => p.tipo === 'instrutor')

  const filteredPresencas = activeTab === 'todos' 
    ? presencas 
    : activeTab === 'pacientes' 
      ? pacPresencas 
      : instPresencas

  const tabs: { key: TabType; label: string; count: number; icon: React.ElementType }[] = [
    { key: 'todos', label: 'Todos', count: presencas.length, icon: FileText },
    { key: 'pacientes', label: 'Pacientes', count: pacPresencas.length, icon: Users },
    { key: 'instrutores', label: 'Instrutores', count: instPresencas.length, icon: GraduationCap }
  ]

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Relatorios</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Consulte historico de presencas e gere crachas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Crachas
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="relDate" className="flex items-center gap-2 text-sm font-medium">
            <Calendar className="h-4 w-4" />
            Data do Relatorio
          </label>
          <Input
            id="relDate"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-[200px]"
          />
        </div>
        <p className="self-end pb-1 text-sm text-muted-foreground">
          {presencas.length} presenca(s) encontrada(s)
        </p>
      </div>

      <div className="flex gap-1 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      <Card className="shadow-sm">
        <CardContent className="pt-5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Nome</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Tipo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Data</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Horario</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden md:table-cell">Codigo</th>
                </tr>
              </thead>
              <tbody>
                {filteredPresencas.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-secondary/50">
                    <td className="px-4 py-3 font-medium">{p.pessoaNome}</td>
                    <td className="px-4 py-3">
                      <Badge variant={p.tipo === 'paciente' ? 'default' : 'secondary'}>
                        {p.tipo === 'paciente' ? 'Paciente' : 'Instrutor'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">{p.data}</td>
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
