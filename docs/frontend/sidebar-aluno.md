## Planejamento: Sidebar do Aluno – Botão "Central do Aluno"

**Objetivo**: Implementar na sidebar do aluno um botão retrátil e expansivo chamado "Central do Aluno" que, ao ser clicado, mostra as opções:
- Disciplinas
- Atividades
- Boletim
- Desempenho
- Frequência

### Tarefas
- [x] Criar documento de planejamento em docs/frontend/
- [x] Localizar componente da sidebar do aluno no frontend
- [x] Implementar botão "Central do Aluno" com submenu retrátil
- [x] Conectar itens do submenu às rotas existentes
- [x] Ajustar estilos/ícones para estados expandido e recolhido
- [x] Persistir estado de expansão/retração entre rotas
- [x] Atualizar documentação marcando tarefas concluídas

### Critérios de Aceite
- **Visibilidade**: O item "Central do Aluno" aparece na sidebar do aluno.
- **Interação**: Ao clicar, expande/recolhe mostrando/ocultando as opções.
- **Navegação**: Cada opção direciona para sua rota correspondente.
- **Acessibilidade**: Elementos com `aria-expanded` e foco via teclado.
- **Consistência visual**: Estilos alinhados ao design atual.

### Observações Técnicas
- Reutilizar componentes de menu existentes (se houver) para o submenu.
- Manter estado local ou centralizado conforme padrão do projeto para sidebars.
- Não executar `npm run dev` nem `npm run build` conforme regras do usuário.


