## Planejamento - Administração > Usuários

Objetivo: Implementar a página de gestão de usuários para o administrador, com funcionalidades de cadastro (mock), listagem, busca e filtro por papel (role), seguindo a estética atual do projeto.

### Escopo
- Página: `app/dashboard/administrador/usuarios/page.tsx`
- UI: componentes existentes (`Card`, `Tabs`, `Input`, `Select`, `Button`, `Badge`, etc.) e `Sidebar`
- Funcionalidades:
  - Listagem de usuários (estado local)
  - Busca por nome/email
  - Filtro por papel (Aluno, Professor, Coordenador, Administrador)
  - Cadastro de novo usuário (mock, adiciona ao estado local)

### Tarefas (Checklist)
- [x] Criar planejamento em `docs/administrador/usuarios/planejamento.md`
- [x] Implementar página `app/dashboard/administrador/usuarios/page.tsx` com layout padrão
- [x] Adicionar listagem de usuários com filtros por role e busca
- [x] Adicionar formulário de cadastro de novo usuário (mock, estado local)
- [x] Atualizar checklist em docs após implementação

### Notas de implementação
- Manter consistência visual com demais páginas do admin (uso do `Sidebar` e cards)
- Utilizar `Tabs` para separar "Lista" e "Cadastro"
- Tipos simples para `Usuario` e `Role`
- Não persistir dados (mock em memória)
- Campos atuais do cadastro: nome, email, usuário (login), telefone, CPF, papel, status, senha e confirmação de senha (validação básica). Validação simples para CPF: 11 dígitos.


