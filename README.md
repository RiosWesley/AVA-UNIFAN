# AVA-UNIFAN - Ambiente Virtual de Aprendizagem

Sistema completo de gestão acadêmica desenvolvido para a UNIFAN, oferecendo uma plataforma moderna e intuitiva para gerenciamento de atividades educacionais, comunicação entre alunos, professores, coordenadores e administradores.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/rioswesleys-projects/v0-ava-virtual-learning-environment)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React Query](https://img.shields.io/badge/React%20Query-5.56-FF4154?style=for-the-badge&logo=react-query)](https://tanstack.com/query)

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Tecnologias](#tecnologias)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Funcionalidades](#funcionalidades)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Arquitetura](#arquitetura)
- [Componentes Principais](#componentes-principais)
- [Serviços e APIs](#serviços-e-apis)
- [Temas e Estilização](#temas-e-estilização)
- [Desenvolvimento](#desenvolvimento)
- [Deploy](#deploy)
- [Contribuição](#contribuição)

## 🎯 Visão Geral

O AVA-UNIFAN é uma plataforma web moderna desenvolvida com Next.js 14, oferecendo uma experiência completa de gestão acadêmica. O sistema suporta quatro perfis de usuário distintos (Aluno, Professor, Coordenador e Administrador), cada um com funcionalidades específicas e interfaces personalizadas.

### Características Principais

- **Interface Moderna**: Design líquido (liquid-glass) com suporte a temas claro, escuro e glassmorphism
- **Responsivo**: Totalmente adaptável a diferentes tamanhos de tela
- **Performance**: Otimizado com React Query para cache e sincronização de dados
- **Type-Safe**: Desenvolvido completamente em TypeScript para máxima segurança de tipos
- **Acessível**: Componentes seguindo padrões WCAG 2.0
- **Modular**: Arquitetura baseada em componentes reutilizáveis

## 🛠 Tecnologias

### Core
- **Next.js 14.2.33**: Framework React com App Router
- **React 18**: Biblioteca de interface de usuário
- **TypeScript 5**: Tipagem estática
- **Tailwind CSS 4.1.9**: Framework de estilização utilitária

### Gerenciamento de Estado e Dados
- **TanStack React Query 5.56.2**: Gerenciamento de estado do servidor, cache e sincronização
- **Axios 1.13.2**: Cliente HTTP para requisições à API

### UI Components
- **Radix UI**: Componentes acessíveis e sem estilo
  - Dialog, Dropdown, Select, Tabs, Toast, Tooltip, e mais
- **Lucide React**: Biblioteca de ícones
- **Sonner**: Sistema de notificações toast

### Formulários e Validação
- **React Hook Form 7.60.0**: Gerenciamento de formulários
- **Zod 3.25.67**: Validação de esquemas TypeScript-first
- **@hookform/resolvers**: Integração React Hook Form + Zod

### Utilitários
- **date-fns 4.1.0**: Manipulação de datas
- **clsx & tailwind-merge**: Utilitários para classes CSS condicionais
- **class-variance-authority**: Gerenciamento de variantes de componentes
- **next-themes**: Gerenciamento de temas (claro/escuro)

### Outros
- **file-saver**: Download de arquivos
- **xlsx**: Manipulação de planilhas Excel
- **recharts**: Gráficos e visualizações
- **@vercel/analytics**: Analytics do Vercel

## 📁 Estrutura do Projeto

```
AVA-UNIFAN/
├── app/                          # Next.js App Router
│   ├── administrador/           # Rotas do administrador
│   │   ├── comunicacao/
│   │   ├── configuracoes/
│   │   ├── cursos/
│   │   ├── financeiro/
│   │   ├── gestao/
│   │   ├── perfil/
│   │   ├── relatorios/
│   │   ├── usuarios/
│   │   ├── video-aulas/
│   │   ├── loading.tsx
│   │   └── page.tsx
│   ├── aluno/                   # Rotas do aluno
│   │   ├── agenda/
│   │   ├── atividades/
│   │   ├── boletim/
│   │   ├── comunicacao/
│   │   ├── configuracoes/
│   │   ├── desempenho/
│   │   ├── disciplinas/
│   │   ├── financeiro/
│   │   ├── frequencia/
│   │   ├── grade-curricular/
│   │   ├── perfil/
│   │   ├── relatorios/
│   │   ├── requerimentos/
│   │   ├── loading.tsx
│   │   └── page.tsx
│   ├── coordenador/             # Rotas do coordenador
│   │   ├── comunicacao/
│   │   ├── configuracoes/
│   │   ├── cursos/
│   │   ├── gestao/
│   │   ├── grade/
│   │   ├── perfil/
│   │   ├── professores/
│   │   ├── relatorios/
│   │   ├── video-aulas/
│   │   ├── loading.tsx
│   │   └── page.tsx
│   ├── professor/               # Rotas do professor
│   │   ├── agenda/
│   │   ├── comunicacao/
│   │   ├── configuracoes/
│   │   ├── disponibilizacao-horarios/
│   │   ├── perfil/
│   │   ├── turmas/
│   │   ├── loading.tsx
│   │   └── page.tsx
│   ├── login/                   # Página de login
│   ├── layout.tsx               # Layout raiz
│   ├── page.tsx                 # Página inicial (login)
│   └── globals.css              # Estilos globais
├── components/                  # Componentes React
│   ├── layout/                  # Componentes de layout
│   │   ├── initial-page-loader.tsx
│   │   ├── loading-overlay.tsx
│   │   ├── page-loading.tsx
│   │   └── sidebar.tsx
│   ├── liquid-glass/            # Componentes com efeito glassmorphism
│   │   ├── config.ts
│   │   ├── index.ts
│   │   ├── liquid-glass-button.tsx
│   │   ├── liquid-glass-card.tsx
│   │   ├── liquid-glass-inner-card.tsx
│   │   ├── liquid-glass-sidebar.tsx
│   │   └── liquid-glass-utils.tsx
│   ├── modals/                  # Modais do sistema
│   │   ├── frequency-modal.tsx
│   │   ├── modal-atividade.tsx
│   │   ├── modal-aviso.tsx
│   │   ├── modal-confirmacao.tsx
│   │   ├── modal-deletar-atividade.tsx
│   │   ├── modal-detalhes-aluno.tsx
│   │   ├── modal-detalhes-usuario.tsx
│   │   ├── modal-discussao-forum.tsx
│   │   ├── modal-editar-usuario.tsx
│   │   ├── modal-entregas-atividade.tsx
│   │   ├── modal-enviar-atividade.tsx
│   │   ├── modal-forum.tsx
│   │   ├── modal-grade-semestre.tsx
│   │   ├── modal-material.tsx
│   │   ├── modal-nova-mensagem.tsx
│   │   ├── modal-video-aula.tsx
│   │   ├── modal-video-chamada.tsx
│   │   └── index.ts
│   ├── providers/               # Providers React
│   │   └── query-provider.tsx
│   ├── theme-provider.tsx       # Provider de temas
│   ├── theme-toggle.tsx         # Componente de alternância de tema
│   └── ui/                      # Componentes UI base (shadcn/ui)
│       ├── avatar.tsx
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── carousel.tsx
│       ├── combobox.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── page-spinner.tsx
│       ├── progress.tsx
│       ├── scroll-area.tsx
│       ├── select.tsx
│       ├── switch.tsx
│       ├── tabs.tsx
│       ├── textarea.tsx
│       ├── toast.tsx
│       └── toaster.tsx
├── hooks/                       # Custom hooks
│   ├── use-comunicacao.ts
│   ├── use-dashboard.ts
│   └── use-toast.ts
├── lib/                         # Utilitários e configurações
│   ├── api-client.ts            # Cliente API com tipos
│   ├── query-client.ts          # Configuração React Query
│   └── utils.ts                 # Funções utilitárias
├── src/                         # Código fonte principal
│   ├── services/                # Serviços de API
│   │   ├── api.ts               # Cliente Axios configurado
│   │   ├── auth.ts              # Autenticação
│   │   ├── atividadeService.ts
│   │   ├── BoletimService.ts
│   │   ├── ClassesService.ts
│   │   ├── coursesService.ts
│   │   ├── departmentsService.ts
│   │   ├── desempenhoService.ts
│   │   ├── FrequenciaService.ts
│   │   ├── professor-dashboard.ts
│   │   ├── ProfessorFrequenciaService.ts
│   │   ├── ProfessorTurmasService.ts
│   │   └── usuariosService.ts
│   └── types/                   # Definições de tipos TypeScript
│       ├── Boletim.ts
│       ├── Classe.ts
│       ├── Desempenho.ts
│       └── Frequencia.ts
├── docs/                        # Documentação do projeto
├── public/                      # Arquivos estáticos
├── styles/                      # Estilos adicionais
├── components.json              # Configuração shadcn/ui
├── next.config.mjs              # Configuração Next.js
├── postcss.config.mjs           # Configuração PostCSS
├── tsconfig.json                # Configuração TypeScript
└── package.json                 # Dependências do projeto
```

## 🎨 Funcionalidades

### 👨‍🎓 Perfil: Aluno

#### Dashboard
- Visão geral com métricas principais (frequência, média geral, atividades pendentes)
- Próximas aulas agendadas
- Últimas notas recebidas
- Comunicados e avisos importantes
- Carrossel de avisos institucionais

#### Central do Aluno
- **Disciplinas**: Visualização de todas as disciplinas matriculadas
  - Detalhes de cada disciplina
  - Materiais didáticos
  - Atividades por disciplina
  - Fóruns de discussão
  - Vídeo-aulas
  - Quadro de avisos
- **Atividades**: Gerenciamento de atividades acadêmicas
  - Lista de atividades pendentes e concluídas
  - Upload de arquivos para entrega
  - Visualização de notas e feedback
  - Status de submissão
- **Boletim**: Histórico completo de notas
  - Notas por disciplina
  - Médias calculadas
  - Conceitos e avaliações
- **Desempenho**: Análise de desempenho acadêmico
  - Gráficos e estatísticas
  - Evolução ao longo do tempo
  - Comparação com turma
- **Frequência**: Controle de presença
  - Registro de frequência por disciplina
  - Percentual de presença
  - Histórico de faltas

#### Outras Funcionalidades
- **Grade Curricular**: Visualização da grade completa do curso
- **Relatórios**: Geração de relatórios acadêmicos
- **Requerimentos**: Solicitação de documentos e serviços
- **Comunicação**: Sistema de mensagens e chat com professores
- **Financeiro**: Consulta de boletos e situação financeira
- **Agenda**: Calendário de eventos e atividades
- **Configurações**: Personalização de perfil e preferências

### 👨‍🏫 Perfil: Professor

#### Dashboard
- Estatísticas de turmas (total de turmas, alunos, aulas hoje)
- Atividades pendentes de correção
- Próximas aulas agendadas
- Agenda semanal
- Comunicados institucionais

#### Turmas
- Lista de todas as turmas sob responsabilidade
- Detalhes de cada turma:
  - Lista de alunos
  - Atividades criadas
  - Frequência dos alunos
  - Notas e avaliações
  - Materiais didáticos
  - Fóruns de discussão
  - Vídeo-aulas
  - Quadro de avisos

#### Funcionalidades Específicas
- **Criação de Atividades**: Criar e gerenciar atividades avaliativas
- **Lançamento de Notas**: Avaliar e lançar notas dos alunos
- **Registro de Frequência**: Lançar e retificar frequência
- **Gestão de Materiais**: Upload e organização de materiais didáticos
- **Fóruns**: Criar e moderar discussões
- **Vídeo-aulas**: Publicar e gerenciar vídeo-aulas
- **Comunicação**: Chat direto com alunos
- **Agenda**: Gerenciamento de horários e disponibilidade
- **Disponibilização de Horários**: Definir horários de atendimento

### 👨‍💼 Perfil: Coordenador

#### Dashboard
- Visão geral dos cursos sob coordenação
- Estatísticas de professores e alunos
- Indicadores acadêmicos

#### Funcionalidades
- **Cursos**: Gerenciamento de cursos
- **Professores**: Gestão de professores e atribuições
- **Grade Horária**: Organização de horários e disciplinas
- **Relatórios**: Geração de relatórios acadêmicos
- **Comunicação**: Comunicação com professores e alunos
- **Vídeo-aulas**: Aprovação e gestão de vídeo-aulas
- **Configurações**: Configurações do curso

### 👨‍💻 Perfil: Administrador

#### Dashboard
- Visão geral do sistema
- Estatísticas gerais
- Indicadores de uso

#### Funcionalidades
- **Usuários**: Gerenciamento completo de usuários
  - Criação, edição e exclusão
  - Atribuição de perfis e permissões
  - Controle de acesso
- **Cursos**: Gestão de cursos e departamentos
- **Financeiro**: Gestão financeira completa
- **Relatórios**: Relatórios administrativos
- **Comunicação**: Comunicação institucional
- **Vídeo-aulas**: Gestão global de vídeo-aulas
- **Configurações**: Configurações do sistema

## 🚀 Instalação

### Pré-requisitos

- Node.js 18+ ou Bun
- npm, yarn, pnpm ou bun (gerenciador de pacotes)
- Git

### Passos

1. **Clone o repositório**
```bash
git clone <repository-url>
cd AVA-UNIFAN
```

2. **Instale as dependências**
```bash
# Com npm
npm install

# Com yarn
yarn install

# Com pnpm
pnpm install

# Com bun
bun install
```

3. **Configure as variáveis de ambiente**
```bash
# Crie um arquivo .env.local na raiz do projeto
cp .env.example .env.local
```

Edite o arquivo `.env.local`:
```env
NEXT_PUBLIC_API_URL=https://sua-api.com
```

4. **Execute o servidor de desenvolvimento**
```bash
# Com npm
npm run dev

# Com yarn
yarn dev

# Com pnpm
pnpm dev

# Com bun
bun dev
```

5. **Acesse a aplicação**
Abra [http://localhost:3000](http://localhost:3000) no navegador.

## ⚙️ Configuração

### Variáveis de Ambiente

| Variável | Descrição | Obrigatório | Padrão |
|----------|-----------|-------------|--------|
| `NEXT_PUBLIC_API_URL` | URL base da API backend | Sim | `http://localhost:3001` |

### Configuração do TypeScript

O projeto utiliza TypeScript com configuração estrita. O arquivo `tsconfig.json` define:
- Target: ES6
- Module: ESNext
- Strict mode habilitado
- Path aliases configurados (`@/*`)

### Configuração do Next.js

O arquivo `next.config.mjs` contém:
- ESLint e TypeScript errors ignorados durante build (para desenvolvimento)
- Imagens não otimizadas (configurável)

## 🏗 Arquitetura

### Padrão de Arquitetura

O projeto segue uma arquitetura baseada em:
- **App Router do Next.js 14**: Roteamento baseado em arquivos
- **Component-Based Architecture**: Componentes React reutilizáveis
- **Service Layer**: Camada de serviços para comunicação com API
- **Custom Hooks**: Lógica reutilizável encapsulada em hooks
- **Type-Safe API Client**: Cliente API totalmente tipado

### Fluxo de Dados

```
UI Components
    ↓
Custom Hooks (React Query)
    ↓
API Client / Services
    ↓
Backend API
```

### Gerenciamento de Estado

- **React Query**: Estado do servidor, cache e sincronização
- **Local State**: useState para estado local de componentes
- **LocalStorage**: Persistência de preferências do usuário (tema, sidebar, etc.)

### Autenticação

- Autenticação baseada em JWT (JSON Web Tokens)
- Token armazenado no localStorage
- Interceptor Axios para adicionar token automaticamente
- Redirecionamento automático para login quando não autenticado

## 🧩 Componentes Principais

### Layout Components

#### Sidebar
Componente de navegação lateral com:
- Menu dinâmico baseado no perfil do usuário
- Suporte a grupos expansíveis
- Estado colapsável persistido
- Tooltips quando colapsado
- Integração com tema liquid-glass

#### InitialPageLoader
Loader inicial da aplicação com animação personalizada.

#### LoadingOverlay
Overlay de carregamento global.

### UI Components (shadcn/ui)

Componentes base construídos sobre Radix UI:
- **Button**: Botões com variantes e tamanhos
- **Card**: Cards para conteúdo
- **Dialog**: Modais e diálogos
- **Input**: Campos de entrada
- **Select**: Seletores dropdown
- **Tabs**: Sistema de abas
- **Toast**: Notificações toast
- **Tooltip**: Dicas de ferramenta
- E mais...

### Liquid Glass Components

Componentes com efeito glassmorphism:
- **LiquidGlassCard**: Cards com efeito de vidro
- **LiquidGlassButton**: Botões com efeito de vidro
- **LiquidGlassSidebar**: Sidebar com efeito de vidro

### Modals

Sistema completo de modais para:
- Atividades
- Frequência
- Fóruns
- Vídeo-aulas
- Usuários
- Confirmações
- E mais...

## 🔌 Serviços e APIs

### API Client

O cliente API (`lib/api-client.ts`) fornece métodos tipados para:
- Dados do estudante
- Horários e agendamentos
- Notas e avaliações
- Frequência
- Atividades
- Matrículas
- Avisos e comunicados
- Materiais didáticos
- Fóruns
- Vídeo-aulas
- Chats

### Services

Serviços especializados em `src/services/`:
- **auth.ts**: Autenticação e autorização
- **atividadeService.ts**: Gerenciamento de atividades
- **BoletimService.ts**: Boletim e notas
- **ClassesService.ts**: Turmas e classes
- **FrequenciaService.ts**: Frequência de alunos
- **professor-dashboard.ts**: Dados do dashboard do professor
- **usuariosService.ts**: Gerenciamento de usuários
- E mais...

### React Query Hooks

Hooks customizados em `hooks/use-dashboard.ts`:
- `useCurrentStudent()`: Dados do estudante atual
- `useStudentSchedules()`: Horários do estudante
- `useStudentGrades()`: Notas do estudante
- `useStudentAttendance()`: Frequência do estudante
- `useStudentActivities()`: Atividades do estudante
- `useNews()`: Notícias e avisos
- `useDashboardData()`: Dados agregados do dashboard

## 🎨 Temas e Estilização

### Sistema de Temas

O sistema suporta três temas:
1. **Light**: Tema claro padrão
2. **Dark**: Tema escuro
3. **Liquid Glass**: Tema com efeito glassmorphism

### Implementação

- **next-themes**: Gerenciamento de temas
- Persistência no localStorage
- Aplicação sem flash (script inline no layout)
- Suporte a background personalizado no modo liquid-glass

### Tailwind CSS

- Tailwind CSS 4.1.9
- Configuração via PostCSS
- Classes utilitárias customizadas
- Variantes de tema via classes CSS

### Cores Principais

- **Primary**: Verde (#22c55e / green-600)
- **Secondary**: Variações de verde e cinza
- **Accent**: Cores específicas por contexto

## 💻 Desenvolvimento

### Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento

# Build
npm run build        # Cria build de produção

# Produção
npm start            # Inicia servidor de produção

# Linting
npm run lint         # Executa ESLint
```

### Convenções de Código

- **TypeScript**: Tipagem estrita, evitar `any`
- **Named Exports**: Preferir exports nomeados
- **Early Returns**: Preferir retornos antecipados
- **Descriptive Names**: Nomes descritivos e claros
- **No Magic Strings**: Usar enums ou constantes
- **React Query**: Usar para todas as requisições de dados
- **Suspense**: Preferir Suspense sobre isLoading

### Estrutura de Componentes

```typescript
// Exemplo de componente
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export function MyComponent() {
  const [state, setState] = useState()
  
  return (
    <div>
      <Button>Click me</Button>
    </div>
  )
}
```

### Padrões de API

```typescript
// Exemplo de serviço
import api from "@/src/services/api"

export async function getData(id: string) {
  const { data } = await api.get<DataType>(`/endpoint/${id}`)
  return data
}
```

### Padrões de Hooks

```typescript
// Exemplo de hook React Query
import { useQuery } from "@tanstack/react-query"

export function useData(id: string) {
  return useQuery({
    queryKey: ["data", id],
    queryFn: () => getData(id),
    enabled: !!id,
  })
}
```

## 🚢 Deploy

### Vercel (Recomendado)

1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Build Manual

```bash
npm run build
npm start
```

### Variáveis de Ambiente no Deploy

Certifique-se de configurar:
- `NEXT_PUBLIC_API_URL`: URL da API em produção

## 📝 Contribuição

### Processo de Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Padrões de Commit

Seguir convenções de commits:
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação
- `refactor`: Refatoração
- `test`: Testes
- `chore`: Tarefas de manutenção

### Code Review

- Todas as mudanças devem passar por code review
- Manter testes atualizados
- Documentar mudanças significativas

## 📄 Licença

Este projeto é privado e propriedade da UNIFAN.

## 👥 Autores

- **Equipe de Desenvolvimento AVA-UNIFAN**

## 🙏 Agradecimentos

- Next.js Team
- Radix UI
- TanStack (React Query)
- Comunidade open-source

---

**Desenvolvido com ❤️ para a UNIFAN**
