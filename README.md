# 🏥 Associação Analía Franco — Sistema de Gestão

Sistema web interno desenvolvido para a **Associação Analía Franco**, uma instituição social que atende pacientes, alunos, instrutores e trabalhadores voluntários. A aplicação centraliza o controle de presença por leitura de código de barras, gestão de pessoas e geração de relatórios.

---

## ✨ Funcionalidades

- **Presença por leitor de código de barras** — registro automático ao passar o crachá, com feedback visual em tempo real (sucesso/erro/aguardando)
- **Gestão de pessoas** — cadastro e gerenciamento de pacientes, alunos, instrutores e trabalhadores voluntários
- **Dashboard** — visão geral das atividades do dia
- **Relatórios** — exportação e visualização de dados de frequência
- **Perfil de usuário** — configurações individuais por colaborador

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16 + React 19 |
| Linguagem | TypeScript |
| Banco de dados | Neon (PostgreSQL serverless) |
| ORM | Prisma |
| UI Components | shadcn/ui + Radix UI |
| Estilização | Tailwind CSS v4 |
| Formulários | React Hook Form + Zod |
| Gráficos | Recharts |
| Hospedagem | Vercel |

---

## 📁 Estrutura do Projeto

```
app/
├── (app)/
│   ├── presenca/        # Registro de presença por código de barras
│   ├── pacientes/       # Gestão de pacientes
│   ├── alunos/          # Gestão de alunos
│   ├── instrutores/     # Gestão de instrutores
│   ├── trabalhadores/   # Gestão de voluntários
│   ├── relatorios/      # Relatórios de frequência
│   └── dashboard/       # Visão geral
└── api/                 # Rotas de API (Next.js Route Handlers)
```

---

## 📚 Aprendizados

- Integrar leitura de código de barras via input capturado no navegador, sem nenhuma biblioteca externa — o leitor físico simula digitação, então bastou manter o foco num input oculto e processar o evento
- Trabalhar com **Prisma + Neon** (PostgreSQL serverless), entendendo como configurar o adapter para ambientes edge
- Construir feedback visual em tempo real (sucesso/erro/aguardando) sem estado global, apenas com `useState` e lógica assíncrona no próprio componente
- Gerenciar vínculos entre diferentes tipos de pessoa (paciente, aluno, instrutor, voluntário) num mesmo fluxo de presença, tratando casos de código pertencente a múltiplos perfis

---

## 👤 Autor

**Paulo Otávio Câmara Rojas**  
[GitHub](https://github.com/PauloRojas18) • [LinkedIn](https://linkedin.com/in/paulo-rojas-b7b77a3a1/) • paulootaviogalala@gmail.com
