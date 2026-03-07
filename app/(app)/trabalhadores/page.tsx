"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Pencil, UserX, UserCheck, Trash2 } from "lucide-react"

const Trabalhadores = [
  { id: "1", nome: "Dr. Pedro Alves", especialidade: "Passe Espiritual", telefone: "(11) 99111-1111", email: "pedro@casa.org", ativo: true, codigoBarras: "INS001234567" },
  { id: "2", nome: "Dra. Lucia Ferreira", especialidade: "Estudo do Evangelho", telefone: "(11) 99222-2222", email: "lucia@casa.org", ativo: true, codigoBarras: "INS001234568" },
  { id: "3", nome: "Prof. Ricardo Gomes", especialidade: "Doutrina Espirita", telefone: "(11) 99333-3333", email: "ricardo@casa.org", ativo: true, codigoBarras: "INS001234569" },
  { id: "4", nome: "Dra. Mariana Castro", especialidade: "Atendimento Fraterno", telefone: "(11) 99444-4444", email: "mariana@casa.org", ativo: false, codigoBarras: "INS001234570" },
  { id: "5", nome: "Dr. Fernando Reis", especialidade: "Passe Espiritual", telefone: "(11) 99555-5555", email: "fernando@casa.org", ativo: true, codigoBarras: "INS001234571" },
  { id: "6", nome: "Profa. Carla Nunes", especialidade: "Evangelizacao Infantil", telefone: "(11) 99666-6666", email: "carla@casa.org", ativo: true, codigoBarras: "INS001234572" },
  { id: "7", nome: "Dr. Antonio Silva", especialidade: "Desobsessao", telefone: "(11) 99777-7777", email: "antonio@casa.org", ativo: true, codigoBarras: "INS001234573" },
  { id: "8", nome: "Dra. Beatriz Lima", especialidade: "Estudo do Evangelho", telefone: "(11) 99888-8888", email: "beatriz@casa.org", ativo: true, codigoBarras: "INS001234574" },
]

export default function TrabalhadoresPage() {
  const [search, setSearch] = useState("")

  const filtered = Trabalhadores.filter(i =>
    i.nome.toLowerCase().includes(search.toLowerCase()) ||
    i.especialidade.toLowerCase().includes(search.toLowerCase()) ||
    i.codigoBarras.includes(search)
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Trabalhadores</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie o cadastro de Trabalhadores e voluntarios
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Trabalhador
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, especialidade ou codigo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">
            {filtered.length} trabalhadores(es) encontrado(s)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Nome</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Especialidade</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden md:table-cell">Telefone</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden lg:table-cell">E-mail</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Cracha</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((i) => (
                  <tr key={i.id} className="border-b border-border last:border-0 hover:bg-secondary/50">
                    <td className="px-4 py-3 font-medium">{i.nome}</td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary">{i.especialidade}</Badge>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">{i.telefone}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">{i.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant={i.ativo ? "default" : "outline"}>
                        {i.ativo ? "Ativo" : "Inativo"}
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
                          aria-label="Editar Trabalhador"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          aria-label={i.ativo ? "Desativar Trabalhador" : "Ativar Trabalhador"}
                        >
                          {i.ativo ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          aria-label="Remover Trabalhador"
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
