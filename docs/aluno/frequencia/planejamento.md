## Planejamento - Frequência do Aluno

Objetivo: Criar a rota `aluno/frequencia` com tabela de faltas por disciplina, seletor de semestre, coluna de percentual de faltas e modal detalhando faltas por aula.

### Tarefas
- [x] Criar este planejamento
- [ ] Implementar rota `app/aluno/frequencia/page.tsx` com tabela e seletor de semestre
- [ ] Criar modal `components/modals/modal-faltas-aluno.tsx` e exportar em `components/modals/index.ts`
- [ ] Integrar o modal na página `aluno/frequencia` (botão "Ver Faltas")
- [ ] Revisar estilos e responsividade
- [ ] Atualizar documentação com status concluído

### Notas de Design
- Usar `Sidebar` existente e manter estética do tema (Liquid Glass quando ativo).
- Colunas por etapa do semestre (Etapa 1..4) + Percentual de faltas + Ações.
- Seletor de semestre no topo (e.g., 2025.1, 2025.2, 2024.2, 2024.1).


