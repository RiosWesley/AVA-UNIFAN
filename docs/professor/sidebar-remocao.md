# Planejamento Estratégico - Remoção de Botões da Sidebar do Professor

## Objetivo
Remover os botões "Atividades" e "Notas" da sidebar do professor, bem como as rotas correspondentes, conforme solicitado pelo usuário.

## Contexto
O sistema AVA-UNIFAN possui diferentes perfis de usuário (aluno, professor, coordenador, administrador) com sidebars específicas. O professor atualmente possui os seguintes itens na sidebar:
- Início
- Turmas
- **Atividades** (a ser removido)
- **Notas** (a ser removido)
- Agenda
- Comunicação
- Configurações

## Análise Técnica
- Os botões "Atividades" e "Notas" estão definidos no arquivo `components/layout/sidebar.tsx` nas linhas 59-60
- As rotas `/professor/atividades` e `/professor/notas` estão definidas mas não existem páginas correspondentes na estrutura de arquivos
- As funcionalidades de atividades e notas estão integradas nas páginas de turmas individuais (`app/professor/turmas/[id]/page.tsx`)

## Tarefas

- [x] Remover botão "Atividades" da sidebar do professor
- [x] Remover botão "Notas" da sidebar do professor
- [x] Verificar se as rotas /professor/atividades e /professor/notas existem e remover se necessário

## Riscos e Considerações
- As funcionalidades de atividades e notas permanecem disponíveis nas páginas de detalhe das turmas
- Não há impacto em outras funcionalidades do sistema
- A remoção apenas afeta a navegação direta pela sidebar

## Critérios de Aceitação
- Os botões "Atividades" e "Notas" não devem mais aparecer na sidebar do professor
- A navegação pelas outras opções deve continuar funcionando normalmente
- Não deve haver erros de navegação ou links quebrados
