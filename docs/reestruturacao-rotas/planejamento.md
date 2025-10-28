## Planejamento - Reestruturação de Rotas

Objetivo: Remover a rota `/dashboard` da estrutura de rotas do Next.js, trazendo as rotas por role (administrador, aluno, coordenador, professor) para o nível anterior, conforme solicitado pelo usuário.

### Escopo
- **Estrutura anterior**: `/dashboard/administrador`, `/dashboard/aluno`, `/dashboard/coordenador`, `/dashboard/professor`
- **Estrutura nova**: `/administrador`, `/aluno`, `/coordenador`, `/professor`
- **Arquivos afetados**: Componentes de navegação, páginas principais, documentação

### Tarefas Realizadas (Checklist)
- [x] Analisar estrutura atual das rotas no diretório app/dashboard
- [x] Mover diretório administrador de app/dashboard/administrador para app/administrador
- [x] Mover diretório aluno de app/dashboard/aluno para app/aluno
- [x] Mover diretório coordenador de app/dashboard/coordenador para app/coordenador
- [x] Mover diretório professor de app/dashboard/professor para app/professor
- [x] Remover diretório app/dashboard após mover todos os subdiretórios
- [x] Buscar e atualizar referências a '/dashboard' nos códigos dos componentes
- [x] Verificar se há links de navegação que precisam ser atualizados
- [x] Testar se as rotas funcionam corretamente após as mudanças

### Arquivos Modificados
1. **components/layout/sidebar.tsx** - Atualização dos menuItems para remover '/dashboard' de todos os hrefs
2. **app/page.tsx** - Atualização dos links de acesso rápido e função handleLogin
3. **app/professor/turmas/[id]/page.tsx** - Atualização do link "Voltar" para '/professor/turmas'
4. **app/professor/turmas/page.tsx** - Atualização do link para detalhes da turma
5. **app/aluno/disciplinas/page.tsx** - Atualização do link para acessar disciplina específica
6. **app/aluno/disciplinas/[id]/page.tsx** - Atualização do link "Voltar" para '/aluno/disciplinas'
7. **docs/administrador/usuarios/planejamento.md** - Atualização das referências de caminho nos documentos

### Resultado
- ✅ Todas as rotas agora funcionam diretamente no nível raiz: `/aluno`, `/professor`, `/coordenador`, `/administrador`
- ✅ Nenhum erro de linting detectado
- ✅ Estrutura de navegação mantida intacta
- ✅ Documentação atualizada com os novos caminhos

### Notas Técnicas
- A mudança foi feita mantendo toda a funcionalidade existente
- Os componentes Sidebar continuam funcionando corretamente com os novos caminhos
- Todas as rotas dinâmicas (como `/aluno/disciplinas/[id]`) foram preservadas
- A navegação interna entre páginas do mesmo role continua funcionando

### Verificação Final
- Estrutura de diretórios: ✅ Correta
- Referências de código: ✅ Atualizadas
- Navegação: ✅ Funcional
- Documentação: ✅ Atualizada
