## Planejamento — Comunicação do Aluno (Mensagens e Comunicados)

### Objetivo
- Integrar `app/aluno/comunicacao/page.tsx` ao backend:
  - Mensagens: usar endpoints dedicados de chat (criar/ajustar no backend).
  - Comunicados: exibir avisos agregados de todas as turmas do aluno.

### Escopo
- Backend: novos endpoints REST de chat; endpoint (opcional) agregador de avisos por aluno.
- Frontend: hooks com React Query, cliente API e refatoração do UI para consumir dados reais.

### Backend — Endpoints propostos
1) Chat (dedicado, por turma)
   - GET `/chats/students/:studentId/threads`
     - Resposta: `ChatThread[]`
     - `ChatThread = { id: string; classId: string; professorName: string; discipline: string; lastMessageAt: string; unreadCount?: number }`
   - GET `/chats/students/:studentId/classes/:classId/messages?cursor=<iso>&limit=50`
     - Resposta: `ChatMessage[]` (ordenado por `sentAt ASC`)
     - `ChatMessage = { id: string; author: 'prof'|'aluno'; content: string; sentAt: string }`
   - POST `/chats/students/:studentId/classes/:classId/messages`
     - Body: `{ content: string }`
     - Resposta: `ChatMessage`

2) Comunicados (agregação)
   - Opção A (imediata): front agrega usando `GET /enrollments?studentId=...` e `GET /notice-board/class/:classId`.
   - Opção B (melhoria): GET `/notice-board/student/:studentId` → `Notice[]` (mesmo contrato do `docs/backend/notice-board.md`).

Notas:
- Autenticação: Bearer (interceptor de `src/services/api.ts`).
- Paginação de mensagens via `cursor` ISO opcional.

### Frontend — Alterações
1) Cliente API/Tipos (`lib/api-client.ts`)
   - Tipos: `ChatThread`, `ChatMessage`.
   - Métodos: `getChatThreads`, `getChatMessages`, `sendChatMessage`, `getNoticesForStudent` (agregação).

2) Hooks React Query (`hooks/use-comunicacao.ts`)
   - `useChatThreads(studentId)`
   - `useChatMessages({ studentId, classId })`
   - `useSendChatMessage()`
   - `useStudentNotices(studentId)` (ordenado por `createdAt DESC`)

3) Página (`app/aluno/comunicacao/page.tsx`)
   - Mensagens: threads reais + histórico + envio.
   - Comunicados: agregação de todas as turmas do aluno.

4) Providers
   - Garantir que `QueryProvider` envolve a app.

### Checklist
- [x] Criar docs/comunicacao/planejamento-comunicacao.md com objetivos e checklist
- [x] Implementar endpoints de chat (threads, listar/enviar mensagens) com autenticação
- [x] Implementar GET /notice-board/student/:studentId (agregador) ou decidir manter agregação no front
- [x] Adicionar tipos e métodos de chat em lib/api-client.ts
- [x] Criar hooks React Query (chat e comunicados) em hooks/use-comunicacao.ts
- [x] Refatorar app/aluno/comunicacao/page.tsx para consumir hooks e API reais
- [x] Ajustar UI de Comunicados para o contrato Notice (sem categoria/urgente inicialmente)
- [x] Testar fluxo completo (carregar threads, enviar mensagem, listar comunicados)


