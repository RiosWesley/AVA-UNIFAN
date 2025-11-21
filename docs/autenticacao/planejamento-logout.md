# Planejamento: Botão de Sair na Sidebar

**Objetivo**: Implementar um botão de "Sair" na sidebar que permite ao usuário autenticado fazer logout do sistema, limpando os dados de autenticação armazenados e redirecionando para a página de login.

## Tarefas

- [x] Criar função `logout()` no serviço de autenticação (`src/services/auth.ts`) para limpar dados do localStorage
- [x] Adicionar botão "Sair" na sidebar com ícone LogOut, tooltip e redirecionamento
- [x] Criar documentação em `docs/autenticacao/planejamento-logout.md` seguindo padrão do projeto

## Detalhes de Implementação

### Função de Logout

A função `logout()` foi implementada no arquivo `src/services/auth.ts` e realiza as seguintes ações:

- Remove o token de autenticação (`ava:token`) do localStorage
- Remove o ID do usuário (`ava:userId`) do localStorage
- Remove o papel do usuário (`ava:userRole`) do localStorage
- É uma função síncrona que não requer chamada à API (backend não mantém sessão)

```typescript
export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('ava:token');
    localStorage.removeItem('ava:userId');
    localStorage.removeItem('ava:userRole');
  }
}
```

### Botão na Sidebar

O botão "Sair" foi adicionado na seção inferior da sidebar (`components/layout/sidebar.tsx`), após o card de informações do usuário. Características:

- **Posicionamento**: Na seção inferior da sidebar, após o card de informações do usuário
- **Comportamento responsivo**: Adapta-se ao estado colapsado/expandido da sidebar
- **Ícone**: `LogOut` do lucide-react
- **Estilo**: Consistente com os outros botões da sidebar, com destaque visual em vermelho ao hover (`hover:bg-red-500/10 hover:text-red-600`)
- **Tooltip**: Exibido quando a sidebar está colapsada, mostrando "Sair"
- **Ação**: Ao clicar, executa `logout()` e redireciona para `/` usando `router.push("/")`

### Arquivos Modificados

1. **`AVA-UNIFAN/src/services/auth.ts`**
   - Adicionada função `logout()` para limpar dados de autenticação

2. **`AVA-UNIFAN/components/layout/sidebar.tsx`**
   - Adicionado import de `useRouter` do `next/navigation`
   - Adicionado import de `LogOut` do `lucide-react`
   - Adicionado import de `logout` do serviço de autenticação
   - Implementado botão "Sair" com suporte a modo colapsado e expandido
   - Adicionado tooltip para o botão quando a sidebar está colapsada

## Critérios de Aceite

- [x] **Visibilidade**: O botão "Sair" aparece na sidebar de todos os tipos de usuário (aluno, professor, coordenador, administrador)
- [x] **Funcionalidade**: Ao clicar, limpa os dados de autenticação e redireciona para a página de login
- [x] **Responsividade**: Funciona corretamente tanto no modo colapsado quanto expandido
- [x] **Acessibilidade**: Tooltip exibido quando a sidebar está colapsada
- [x] **Consistência visual**: Estilos alinhados ao design atual da sidebar

## Observações Técnicas

- A função de logout é síncrona e não requer chamada à API, pois o backend não mantém sessão ativa
- O redirecionamento é feito usando `router.push("/")` do Next.js
- O botão utiliza as mesmas classes de estilo e padrões visuais dos outros botões da sidebar
- A implementação suporta todos os tipos de usuário (aluno, professor, coordenador, administrador)

