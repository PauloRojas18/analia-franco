"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Pencil, UserX, UserCheck, Trash2 } from "lucide-react"

const pacientes = [
  { id: "1", nome: "Maria Silva", telefone: "(11) 99999-1234", endereco: "Rua das Flores, 123", ativo: true, codigoBarras: "PAC001234567" },
  { id: "2", nome: "Joao Santos", telefone: "(11) 98888-5678", endereco: "Av. Brasil, 456", ativo: true, codigoBarras: "PAC001234568" },
  { id: "3", nome: "Ana Oliveira", telefone: "(11) 97777-9012", endereco: "Rua do Sol, 789", ativo: true, codigoBarras: "PAC001234569" },
  { id: "4", nome: "Carlos Pereira", telefone: "(11) 96666-3456", endereco: "Av. Paulista, 1000", ativo: false, codigoBarras: "PAC001234570" },
  { id: "5", nome: "Paula Costa", telefone: "(11) 95555-7890", endereco: "Rua Augusta, 234", ativo: true, codigoBarras: "PAC001234571" },
  { id: "6", nome: "Roberto Lima", telefone: "(11) 94444-1234", endereco: "Rua Oscar Freire, 567", ativo: true, codigoBarras: "PAC001234572" },
  { id: "7", nome: "Fernanda Alves", telefone: "(11) 93333-5678", endereco: "Av. Reboucas, 890", ativo: true, codigoBarras: "PAC001234573" },
  { id: "8", nome: "Marcos Souza", telefone: "(11) 92222-9012", endereco: "Rua da Consolacao, 111", ativo: false, codigoBarras: "PAC001234574" },
  { id: "9", nome: "Lucia Ferreira", telefone: "(11) 91111-3456", endereco: "Av. Ipiranga, 222", ativo: true, codigoBarras: "PAC001234575" },
  { id: "10", nome: "Pedro Mendes", telefone: "(11) 90000-7890", endereco: "Rua Pamplona, 333", ativo: true, codigoBarras: "PAC001234576" },
]

export default function PacientesPage() {
  const [search, setSearch] = useState("")

  const filtered = pacientes.filter(p =>
    p.nome.toLowerCase().includes(search.toLowerCase()) ||
    p.telefone.includes(search) ||
    p.codigoBarras.includes(search)
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pacientes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie o cadastro de pacientes da casa espirita
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Paciente
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, telefone ou codigo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">
            {filtered.length} paciente(s) encontrado(s)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Nome</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden md:table-cell">Telefone</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden lg:table-cell">Endereco</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Cracha</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-secondary/50">
                    <td className="px-4 py-3 font-medium">{p.nome}</td>
                    <td className="px-4 py-3 hidden md:table-cell">{p.telefone}</td>
                    <td className="px-4 py-3 hidden lg:table-cell max-w-[200px] truncate">{p.endereco}</td>
                    <td className="px-4 py-3">
                      <Badge variant={p.ativo ? "default" : "outline"}>
                        {p.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="outline" size="sm">
                        Ver Cracha
                      </Button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          aria-label="Editar paciente"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          aria-label={p.ativo ? "Desativar paciente" : "Ativar paciente"}
                        >
                          {p.ativo ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          aria-label="Remover paciente"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
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
