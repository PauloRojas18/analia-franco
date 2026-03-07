"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScanBarcode, Clock } from "lucide-react"

const presencasHoje = [
  { id: 1, pessoaNome: "Maria Silva", tipo: "paciente", horario: "14:32", codigoBarras: "PAC001234567" },
  { id: 2, pessoaNome: "Joao Santos", tipo: "paciente", horario: "14:28", codigoBarras: "PAC001234568" },
  { id: 3, pessoaNome: "Dr. Pedro Alves", tipo: "instrutor", horario: "14:15", codigoBarras: "INS001234567" },
  { id: 4, pessoaNome: "Ana Oliveira", tipo: "paciente", horario: "13:58", codigoBarras: "PAC001234569" },
  { id: 5, pessoaNome: "Carlos Pereira", tipo: "paciente", horario: "13:45", codigoBarras: "PAC001234570" },
  { id: 6, pessoaNome: "Dra. Lucia Ferreira", tipo: "instrutor", horario: "13:30", codigoBarras: "INS001234568" },
  { id: 7, pessoaNome: "Roberto Lima", tipo: "paciente", horario: "13:15", codigoBarras: "PAC001234571" },
  { id: 8, pessoaNome: "Fernanda Costa", tipo: "paciente", horario: "13:00", codigoBarras: "PAC001234572" },
  { id: 9, pessoaNome: "Prof. Ricardo Gomes", tipo: "instrutor", horario: "12:45", codigoBarras: "INS001234569" },
  { id: 10, pessoaNome: "Paula Costa", tipo: "paciente", horario: "12:30", codigoBarras: "PAC001234573" },
]

export default function PresencaPage() {
  const [barcode, setBarcode] = useState("")

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Registrar Presenca</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Passe o cracha no leitor de codigo de barras ou digite o codigo manualmente
        </p>
      </div>

      <div className="flex flex-col items-center gap-6 rounded-lg border-2 border-dashed border-border bg-card p-12">
        <div 
          className="flex h-20 w-20 items-center justify-center rounded-2xl"
          style={{ background: 'rgba(30, 107, 148, 0.08)' }}
        >
          <ScanBarcode className="h-10 w-10 text-primary" />
        </div>
        
        <div className="text-center">
          <h2 className="text-lg font-semibold">Area de Leitura</h2>
          <p className="text-sm text-muted-foreground">
            Posicione o cracha no leitor ou digite o codigo abaixo
          </p>
        </div>

        <div className="flex w-full max-w-md gap-3">
          <Input
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            placeholder="Codigo de barras..."
            className="flex-1 text-center font-mono"
          />
          <Button>
            Registrar
          </Button>
        </div>

        <div 
          className="flex w-full max-w-md items-center gap-3 rounded-md p-3.5"
          style={{ 
            background: 'rgba(42, 157, 90, 0.1)',
            color: 'var(--success)'
          }}
        >
          <div className="flex-1">
            <p className="text-sm font-semibold">Aguardando leitura...</p>
            <p className="text-xs">Passe o cracha no leitor para registrar a presenca</p>
          </div>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Clock className="h-4 w-4 text-primary" />
            Presencas Registradas Hoje ({presencasHoje.length})
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
                {presencasHoje.map((p) => (
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
