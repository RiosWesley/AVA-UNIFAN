# Dashboard do Professor — Integração com Backend e Ajustes de Layout

Este documento acompanha a execução da integração do dashboard do professor com o backend (`ava-backend`) e os ajustes de layout solicitados.

## Objetivos
- Conectar todos os cards do dashboard do professor (`app/professor/page.tsx`) a endpoints reais do backend.
- Remover o card “Média das Turmas”.
- Tornar o card “Atividades Recentes” de largura total para eliminar espaços em branco.

## Backend e Autenticação
- API com NestJS em `ava-backend`.
- Autenticação via JWT:
  - Login: `POST /auth/login` → retorna `{ access_token, user }`.
  - Requisições autenticadas: header `Authorization: Bearer <token>`.
  - O frontend já injeta automaticamente o token salvo em `localStorage` (`ava:token`) através do interceptor de `src/services/api.ts`.
- Swagger inclui o esquema Bearer (`JWT-auth`).

## Endpoints utilizados
- `GET /auth/me` — usuário atual.
- `GET /classes/teacher/:teacherId/details` — turmas do professor c/ aulas, alunos, próxima aula, etc.
- `GET /activities/class/:classId` — atividades por turma.
- `GET /notice-board/teacher` — comunicados destinados a professores.

## Entregáveis
1. Serviço `src/services/professor-dashboard.ts` encapsulando chamadas acima e helpers p/ métricas.
2. `app/professor/page.tsx` consumindo o serviço, sem mocks.
3. Remoção do card “Média das Turmas”.
4. “Atividades Recentes” ocupando toda a largura.

## Checklist
- [x] Criar docs/dashboard-professor/planejamento.md com checklist e objetivos
- [x] Criar src/services/professor-dashboard.ts agregando dados do backend
- [x] Documentar uso de JWT Bearer e confirmar interceptor de api.ts
- [x] Conectar app/professor/page.tsx ao serviço e substituir mocks
- [x] Remover o card “Média das Turmas” do page.tsx
- [x] Mover “Atividades Recentes” para largura total (xl:col-span-12)
- [x] Testar cards, contagens e responsividade no dashboard
- [x] Atualizar documentação marcando tarefas concluídas


