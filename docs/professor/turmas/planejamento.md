# Planejamento Estratégico - Aba Lançar Frequência

## Objetivo Geral
Implementar uma nova funcionalidade na página de turmas do professor que permite lançar e retificar a frequência dos alunos por dia de aula.

## Requisitos Funcionais
- [ ] Sistema de abas na página principal
- [ ] Aba "Lançar Frequência" com lista de aulas por turma
- [ ] Botão "Lançar Frequência" (disponível apenas na data da aula)
- [ ] Botão "Retificar" (sempre disponível)
- [ ] Modal de frequência com switches para cada aluno
- [ ] Modal deve abrir com todos os alunos marcados como falta
- [ ] Modal responsivo cobrindo grande parte da tela

## Estrutura de Dados
### Turmas (atual)
```typescript
interface Turma {
  id: number
  nome: string
  disciplina: string
  alunos: number
  // ... outros campos existentes
  aulas?: Aula[]
}
```

### Aulas (nova)
```typescript
interface Aula {
  id: string
  data: Date
  horario: string
  sala: string
  status: 'agendada' | 'lancada' | 'retificada'
  alunosPresentes?: string[]
  dataLancamento?: Date
}
```

### Alunos (nova)
```typescript
interface Aluno {
  id: string
  nome: string
  matricula: string
  presente: boolean
}
```

## Componentes Necessários
1. **Sistema de Tabs**: Usar componente existente `components/ui/tabs.tsx`
2. **Modal de Frequência**: Criar novo componente `components/ui/dialog.tsx`
3. **Componente Switch**: Usar componente existente `components/ui/switch.tsx`
4. **Lista de Aulas**: Criar componente para exibir aulas da turma
5. **Modal de Lançamento**: Componente para gerenciar presença dos alunos

## Fluxo de Funcionamento
1. **Visualização**: Professor acessa aba "Lançar Frequência"
2. **Seleção**: Escolhe uma turma para ver as aulas
3. **Ações Disponíveis**:
   - Botão "Lançar Frequência": só visível na data da aula
   - Botão "Retificar": sempre visível para aulas já lançadas
4. **Modal**: Abre com todos os alunos marcados como falta
5. **Marcação**: Professor marca presença/falta via switches
6. **Salvar**: Dados são salvos e status da aula é atualizado

## Design e UX
- [x] Modal deve ocupar 90% da largura e altura da tela
- [x] Switches devem ser grandes e acessíveis
- [x] Estados visuais claros para botões (disponível/indisponível)
- [x] Feedback visual para ações realizadas
- [x] Confirmação antes de salvar alterações
- [x] **Modal não fecha ao clicar fora** - previne fechamento acidental
- [x] **Botões dedicados** para cancelar ou salvar - controle total do usuário
- [x] **Prevenção de ESC** - tecla ESC não fecha o modal

### Comportamento do Modal
O modal de frequência foi configurado para **não fechar automaticamente** em situações que poderiam causar perda de dados:
- ✅ **Clique no overlay (fundo escuro)** - **IGNORADO**
- ✅ **Tecla ESC** - **IGNORADA**
- ✅ **Botão Cancelar** - Fecha sem salvar alterações
- ✅ **Botão Lançar/Salvar** - Salva e fecha o modal

## Validações
- [x] Verificar se data da aula é hoje (para botão "Lançar")
- [x] Validar se todos os alunos foram marcados
- [x] Confirmar salvamento de dados
- [x] Verificar permissões do professor
- [x] Prevenir fechamento acidental do modal (clicar fora/ESC)

## Implementação Técnica
1. **Estado Global**: Usar React hooks para gerenciar estado
2. **Persistência**: Simular com localStorage inicialmente
3. **Validação de Data**: Usar date-fns para comparar datas
4. **Responsividade**: Usar classes Tailwind CSS

## Testes
- [x] Funcionalidade de tabs
- [x] Abertura do modal
- [x] Switches funcionando
- [x] Validação de datas
- [x] Responsividade em diferentes telas
- [x] Estados dos botões

## Critérios de Aceitação
- [x] Aba funciona corretamente
- [x] Modal abre com todos alunos como falta
- [x] Botões aparecem conforme regras de data
- [x] Switches alteram estado dos alunos
- [x] Dados são salvos corretamente
- [x] Interface responsiva e acessível

## Implementação Concluída
✅ **Sistema de abas implementado** com "Visão Geral" e "Lançar Frequência"
✅ **Modal de frequência criado** como componente separado em `components/frequency/`
✅ **Lógica de disponibilidade** implementada - botão "Lançar" só aparece na data da aula
✅ **Botão "Retificar"** sempre disponível para aulas já lançadas
✅ **Layout vertical** dos alunos em uma única coluna para melhor visualização
✅ **Switch "Marcar Todos"** no header do modal para marcar todos os alunos de uma vez
✅ **Switches funcionais** para marcar presença/falta de cada aluno individualmente
✅ **Modal responsivo** cobrindo 90% da tela (max-w-4xl max-h-[90vh])
✅ **Estado inicial** do modal com todos os alunos como ausentes
✅ **Componente dialog** criado baseado no Radix UI
✅ **Interface integrada** seguindo o estilo Liquid Glass da aplicação

### Melhorias Adicionais Implementadas
- **Layout vertical único** para melhor legibilidade da lista de alunos
- **Switch "Marcar Todos"** com lógica inteligente no header do modal
- **Badges coloridos** para indicar visualmente se o aluno está presente/ausente
- **Design responsivo** com cards individuais para cada aluno
- **Estados visuais** claros com cores verde/vermelho para presente/ausente
- **Modal não fecha ao clicar fora** - só pode ser fechado pelos botões "Cancelar" ou "Lançar Frequência"
- **Prevenção de fechamento por ESC** - tecla ESC também não fecha o modal
