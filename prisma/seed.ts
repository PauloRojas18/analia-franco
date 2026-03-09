import 'dotenv/config'
import { PrismaNeon } from "@prisma/adapter-neon"
import { PrismaClient, TipoPessoa } from "@prisma/client"

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error("DATABASE_URL não definida")

const adapter = new PrismaNeon({ connectionString })
const prisma = new PrismaClient({ adapter })

function hojeAs(hora: number, minuto: number) {
  const d = new Date()
  d.setHours(hora, minuto, 0, 0)
  return d
}

async function main() {
  console.log("🌱 Iniciando seed...")

  // Pacientes — prefixo CEFASP
  const pacientes = await Promise.all([
    prisma.paciente.upsert({ where: { codigoBarras: "CEFASP000001" }, update: {}, create: { nome: "Maria Silva",      especialidade: "Fisioterapia",   telefone: "11 91234-5678", endereco: "Rua das Flores, 10",  codigoBarras: "CEFASP000001" } }),
    prisma.paciente.upsert({ where: { codigoBarras: "CEFASP000002" }, update: {}, create: { nome: "João Santos",      especialidade: "Psicologia",     telefone: "11 92345-6789", endereco: "Av. Brasil, 200",      codigoBarras: "CEFASP000002" } }),
    prisma.paciente.upsert({ where: { codigoBarras: "CEFASP000003" }, update: {}, create: { nome: "Ana Oliveira",     especialidade: "Nutrição",       telefone: "11 93456-7890", endereco: "Rua Ipê, 55",          codigoBarras: "CEFASP000003" } }),
    prisma.paciente.upsert({ where: { codigoBarras: "CEFASP000004" }, update: {}, create: { nome: "Carlos Pereira",   especialidade: "Fisioterapia",   telefone: "11 94567-8901", endereco: "Rua Cedro, 88",        codigoBarras: "CEFASP000004" } }),
    prisma.paciente.upsert({ where: { codigoBarras: "CEFASP000005" }, update: {}, create: { nome: "Fernanda Costa",   especialidade: "Fonoaudiologia", telefone: "11 95678-9012", endereco: "Rua Pinheiro, 33",     codigoBarras: "CEFASP000005" } }),
    prisma.paciente.upsert({ where: { codigoBarras: "CEFASP000006" }, update: {}, create: { nome: "Roberto Lima",     especialidade: "Psicologia",     telefone: "11 96789-0123", endereco: "Av. Paulista, 1000",   codigoBarras: "CEFASP000006" } }),
    prisma.paciente.upsert({ where: { codigoBarras: "CEFASP000007" }, update: {}, create: { nome: "Beatriz Souza",    especialidade: "Nutrição",       telefone: "11 97890-1234", endereco: "Rua das Acácias, 77",  codigoBarras: "CEFASP000007", ativo: false } }),
    prisma.paciente.upsert({ where: { codigoBarras: "CEFASP000008" }, update: {}, create: { nome: "Marcos Almeida",   especialidade: "Fisioterapia",   telefone: "11 98901-2345", endereco: "Rua Jacarandá, 15",    codigoBarras: "CEFASP000008" } }),
  ])

  // Alunos — prefixo CEFASA
  const alunos = await Promise.all([
    prisma.aluno.upsert({ where: { codigoBarras: "CEFASA000001" }, update: {}, create: { nome: "Lucas Ferreira",   telefone: "11 91111-2222", endereco: "Rua Violeta, 5",       codigoBarras: "CEFASA000001" } }),
    prisma.aluno.upsert({ where: { codigoBarras: "CEFASA000002" }, update: {}, create: { nome: "Juliana Ramos",    telefone: "11 92222-3333", endereco: "Rua Rosa, 12",          codigoBarras: "CEFASA000002" } }),
    prisma.aluno.upsert({ where: { codigoBarras: "CEFASA000003" }, update: {}, create: { nome: "Pedro Mendes",     telefone: "11 93333-4444", endereco: "Av. Independência, 50", codigoBarras: "CEFASA000003" } }),
    prisma.aluno.upsert({ where: { codigoBarras: "CEFASA000004" }, update: {}, create: { nome: "Camila Rocha",     telefone: "11 94444-5555", endereco: "Rua Margarida, 8",      codigoBarras: "CEFASA000004", ativo: false } }),
    prisma.aluno.upsert({ where: { codigoBarras: "CEFASA000005" }, update: {}, create: { nome: "Diego Nascimento", telefone: "11 95555-6666", endereco: "Rua Girassol, 99",      codigoBarras: "CEFASA000005" } }),
  ])

  // Instrutores — prefixo CEFASI
  const instrutores = await Promise.all([
    prisma.instrutor.upsert({ where: { email: "pedro.alves@analiafranco.org"    }, update: {}, create: { nome: "Dr. Pedro Alves",     telefone: "11 91234-0001", email: "pedro.alves@analiafranco.org",    codigoBarras: "CEFASI000001" } }),
    prisma.instrutor.upsert({ where: { email: "lucia.ferreira@analiafranco.org" }, update: {}, create: { nome: "Dra. Lucia Ferreira", telefone: "11 91234-0002", email: "lucia.ferreira@analiafranco.org", codigoBarras: "CEFASI000002" } }),
    prisma.instrutor.upsert({ where: { email: "marcos.silva@analiafranco.org"   }, update: {}, create: { nome: "Dr. Marcos Silva",    telefone: "11 91234-0003", email: "marcos.silva@analiafranco.org",   codigoBarras: "CEFASI000003", ativo: false } }),
  ])

  // Trabalhadores — prefixo CEFAST
  const trabalhadores = await Promise.all([
    prisma.trabalhador.upsert({ where: { email: "ana.santos@analiafranco.org"   }, update: {}, create: { nome: "Ana Santos",   telefone: "11 91234-0010", email: "ana.santos@analiafranco.org",   codigoBarras: "CEFAST000001" } }),
    prisma.trabalhador.upsert({ where: { email: "jose.lima@analiafranco.org"    }, update: {}, create: { nome: "José Lima",    telefone: "11 91234-0011", email: "jose.lima@analiafranco.org",    codigoBarras: "CEFAST000002" } }),
    prisma.trabalhador.upsert({ where: { email: "claudia.reis@analiafranco.org" }, update: {}, create: { nome: "Cláudia Reis", telefone: "11 91234-0012", email: "claudia.reis@analiafranco.org", codigoBarras: "CEFAST000003" } }),
  ])

  // Presenças de hoje
  const presencasHoje = [
    { tipo: TipoPessoa.paciente,    codigoBarras: pacientes[0].codigoBarras,     pacienteId: pacientes[0].id,          horario: hojeAs(8, 10)  },
    { tipo: TipoPessoa.paciente,    codigoBarras: pacientes[1].codigoBarras,     pacienteId: pacientes[1].id,          horario: hojeAs(8, 25)  },
    { tipo: TipoPessoa.instrutor,   codigoBarras: instrutores[0].codigoBarras,   instrutorId: instrutores[0].id,       horario: hojeAs(8, 30)  },
    { tipo: TipoPessoa.aluno,       codigoBarras: alunos[0].codigoBarras,        alunoId: alunos[0].id,                horario: hojeAs(9, 0)   },
    { tipo: TipoPessoa.paciente,    codigoBarras: pacientes[2].codigoBarras,     pacienteId: pacientes[2].id,          horario: hojeAs(9, 15)  },
    { tipo: TipoPessoa.trabalhador, codigoBarras: trabalhadores[0].codigoBarras, trabalhadorId: trabalhadores[0].id,   horario: hojeAs(9, 20)  },
    { tipo: TipoPessoa.paciente,    codigoBarras: pacientes[3].codigoBarras,     pacienteId: pacientes[3].id,          horario: hojeAs(10, 5)  },
    { tipo: TipoPessoa.aluno,       codigoBarras: alunos[1].codigoBarras,        alunoId: alunos[1].id,                horario: hojeAs(10, 30) },
    { tipo: TipoPessoa.instrutor,   codigoBarras: instrutores[1].codigoBarras,   instrutorId: instrutores[1].id,       horario: hojeAs(11, 0)  },
    { tipo: TipoPessoa.paciente,    codigoBarras: pacientes[4].codigoBarras,     pacienteId: pacientes[4].id,          horario: hojeAs(11, 45) },
  ]

  for (const p of presencasHoje) {
    await prisma.presenca.create({ data: p })
  }

  console.log("✅ Seed concluído!")
  console.log(`   🏥 Pacientes:     ${pacientes.length}  (prefixo CEFASP)`)
  console.log(`   🎓 Alunos:        ${alunos.length}  (prefixo CEFASA)`)
  console.log(`   👨‍⚕️ Instrutores:   ${instrutores.length}  (prefixo CEFASI)`)
  console.log(`   👷 Trabalhadores: ${trabalhadores.length}  (prefixo CEFAST)`)
  console.log(`   📋 Presenças:     ${presencasHoje.length}`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())