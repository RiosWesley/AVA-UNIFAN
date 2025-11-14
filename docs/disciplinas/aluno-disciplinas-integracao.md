## Integração da página Disciplina (Aluno) por turma (`classId`)

### Objetivo
Conectar as abas da página `app/aluno/disciplinas/[id]/page.tsx` ao backend `ava-backend`, usando `[id] = classId`, substituindo mocks por dados reais e criando endpoints faltantes para uma integração coesa.

### Escopo por aba
- Avisos
  - Backend: expor `GET /notice-board/class/:classId` (apenas avisos da turma).
  - Frontend: consumir o endpoint e listar avisos por turma.
- Materiais
  - Backend: já disponível `GET /materials/class/:classId`.
  - Frontend: listar materiais e usar `fileUrl[]` (array) no(s) botão(ões) de download.
- Atividades
  - Backend: `GET /activities/class/:classId`; upload de submissão do aluno via `POST /activities/students/:studentId/activities/:activityId/submissions/upload`; status do aluno via `GET /activities/:activityId/submissions/students/:studentId`.
  - Frontend: listar, enviar e exibir status por atividade.
  - Opcional: comentário da submissão (backend aceitar campo `comment`).
- Fórum
  - Backend: `GET /forums/class/:classId`; posts: `GET /forum-posts/forum/:forumId`; responder: `POST /forum-posts` com `parentPostId` opcional.
  - Frontend: carregar discussão ao abrir e permitir respostas em thread.
- Vídeo-aulas
  - Backend: `GET /video-lessons/class/:classId`; marcar visto: `PATCH /video-lessons/:id/watched?studentId=...`.
  - Frontend: marcar visto ao abrir/selecionar.
- Vídeo-chamadas
  - Backend atual: gateway WebSocket `live-class` (sinalização).
  - Backend necessário: CRUD de sessões (Live Sessions) e listagem por turma.
  - Frontend: listar sessões e conectar socket no “Entrar”.

### Critérios de aceite
- Abas sem mocks; dados reais via API.
- Avisos mostrados por turma (classId).
- Materiais, Atividades, Fórum e Vídeo-aulas integrados conforme endpoints.
- Vídeo-chamadas com listagem REST e conexão socket ao entrar.

### Checklist de tarefas
- [x] Criar documento de planejamento em `docs/disciplinas/aluno-disciplinas-integracao.md`
- [x] Backend: adicionar `GET /notice-board/class/:classId` (avisos por turma)
- Especificação: ver `docs/backend/notice-board.md`
- [x] Frontend: conectar aba Avisos ao endpoint por turma
- [x] Frontend: conectar aba Materiais (`GET /materials/class/:classId`) e download
- [x] Frontend: conectar aba Atividades (listar por turma, upload submissão)
- [x] Frontend: exibir status de submissão do aluno por atividade
- [x] (Opcional) Backend: suportar comentário na submissão de atividade
- Especificação: ver `docs/backend/activities-submissions.md`
- [x] Frontend: conectar Fórum (listar fóruns da turma, posts e responder)
- [x] Frontend: conectar Vídeo-aulas (listar e marcar assistido)
- [x] Backend: criar módulo Live Sessions (CRUD + listagem por turma)
- [ ] Frontend: conectar Vídeo-chamadas usando Live Sessions e WebSocket `join-room`
  - Estado: não implementado neste escopo de frontend; backend já possui CRUD e listagem.
- [x] Atualizar `lib/api-client` com métodos reais e tipagens
- [x] Garantir uso de `NEXT_PUBLIC_API_URL` e ids UUID no frontend


