# Implementação de Dados Reais do Usuário na Sidebar

## Objetivo
Substituir os valores mockados do nome do usuário na sidebar por dados reais obtidos do usuário autenticado.

## Análise da Situação Atual

### Frontend
- A sidebar (`components/layout/sidebar.tsx`) utiliza valores hardcoded para o nome do usuário:
  - Aluno: "João Silva"
  - Professor: "Prof. Maria Santos"
  - Coordenador: "Coord. Ana Costa"
  - Administrador: "Admin Sistema"

### Backend
- O endpoint `/auth/me` atualmente retorna apenas `id`, `email` e `roles` (via JWT Strategy)
- O backend possui `UsersService.findOne()` que retorna o usuário completo com `name`
- A função `me()` já existe no frontend (`src/services/auth.ts`) mas retorna apenas dados do JWT

## Tarefas

- [x] Modificar o backend `/auth/me` para retornar dados completos do usuário (incluindo `name`)
- [x] Atualizar o tipo `AuthUser` no frontend se necessário (já estava correto)
- [x] Modificar a sidebar para buscar e exibir os dados reais do usuário
- [x] Implementar estados de carregamento e tratamento de erros

## Implementação

### Passo 1: Modificar Backend `/auth/me` ✅
- ✅ Modificado `auth.controller.ts` para injetar `UsersService`
- ✅ Modificado método `me()` para buscar dados completos do usuário usando `usersService.findOne()`
- ✅ Retorna `id`, `name`, `email` e `roles`
- ✅ Atualizada documentação da API para incluir `name` no exemplo de resposta

### Passo 2: Modificar Frontend Sidebar ✅
- ✅ Adicionado import da função `me()` de `@/src/services/auth`
- ✅ Adicionado estado `userData` para armazenar nome e ID do usuário
- ✅ Adicionado estado `isLoadingUser` para controle de carregamento
- ✅ Criado `useEffect` para buscar dados do usuário ao montar o componente
- ✅ Substituídos valores mockados por dados reais do `userData`
- ✅ Implementado tratamento de estados de carregamento (mostra "Carregando..." enquanto busca)
- ✅ Implementado fallback para valores padrão em caso de erro ou carregamento

## Arquivos Modificados

1. **Backend:**
   - `ava-backend/src/auth/auth.controller.ts`

2. **Frontend:**
   - `AVA-UNIFAN/components/layout/sidebar.tsx`

## Notas Importantes

- O backend já possuía `UsersModule` exportando `UsersService`, então não foi necessário modificar módulos
- O tipo `AuthUser` no frontend já incluía o campo `name`, então não foi necessário modificá-lo
- A implementação trata erros de forma silenciosa, mantendo valores padrão se houver falha na busca

