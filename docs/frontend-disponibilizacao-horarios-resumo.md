# Resumo da Funcionalidade Frontend - Disponibilização de Horários

## Visão Geral
Tela onde o professor informa sua disponibilidade de horários para lecionar em um semestre específico.

## Endpoint Utilizado
`POST /teacher-semester-availabilities`

## Payload Enviado pelo Frontend

```typescript
{
  teacherId: string,              // UUID do professor (obrigatório)
  academicPeriodId: string,       // UUID do período acadêmico/semestre (obrigatório)
  morning: boolean,               // Disponibilidade no turno da manhã
  afternoon: boolean,             // Disponibilidade no turno da tarde
  evening: boolean,               // Disponibilidade no turno da noite
  observations?: string,          // Observações opcionais
  disciplineIds?: string[],       // IDs das disciplinas de interesse (opcional)
  weekdays?: string[]             // Dias da semana disponíveis (opcional)
}
```

### Campos Detalhados

#### teacherId
- **Tipo**: string (UUID)
- **Obrigatório**: Sim
- **Fonte**: Obtido via `getCurrentUser()` após login
- **Validação**: Deve ser um UUID válido

#### academicPeriodId
- **Tipo**: string (UUID)
- **Obrigatório**: Sim
- **Fonte**: Selecionado pelo professor no dropdown de semestres
- **Endpoint de busca**: `GET /teacher-semester-availabilities/teacher/:teacherId/available-semesters`
- **Validação**: Deve ser um UUID válido

#### morning, afternoon, evening
- **Tipo**: boolean
- **Obrigatório**: Pelo menos um deve ser `true`
- **Validação Frontend**: Verifica se pelo menos um turno está selecionado antes de enviar

#### observations
- **Tipo**: string | undefined
- **Obrigatório**: Não
- **Limite**: Campo de texto livre

#### disciplineIds
- **Tipo**: string[] | undefined
- **Obrigatório**: Não
- **Fonte**: Disciplinas dos cursos vinculados ao professor
- **Validação**: Apenas disciplinas dos cursos do professor podem ser selecionadas
- **Endpoints relacionados**:
  - `GET /teacher-courses/teacher/:teacherId` - Lista cursos do professor
  - `GET /courses/:courseId` - Lista disciplinas de um curso

#### weekdays
- **Tipo**: string[] | undefined
- **Obrigatório**: Não
- **Valores possíveis**: 
  - `'segunda-feira'`
  - `'terca-feira'`
  - `'quarta-feira'`
  - `'quinta-feira'`
  - `'sexta-feira'`
  - `'sabado'`
- **Validação**: Apenas dias úteis (Segunda a Sábado)

## Fluxo de Dados

### 1. Carregamento Inicial
1. Busca usuário atual (`getCurrentUser()`)
2. Busca semestres disponíveis (`GET /teacher-semester-availabilities/teacher/:teacherId/available-semesters`)
3. Busca cursos do professor (`GET /teacher-courses/teacher/:teacherId`)
4. Para cada curso, busca disciplinas (`GET /courses/:courseId`)
5. Se houver disponibilização existente para o semestre selecionado, carrega dados:
   - `GET /teacher-semester-availabilities/teacher/:teacherId/semester/:semesterId`

### 2. Seleção de Dados pelo Professor
- **Semestre**: Dropdown com semestres futuros
- **Turnos**: Switches para Manhã, Tarde, Noite
- **Dias da Semana**: Cards clicáveis (Segunda a Sábado)
- **Disciplinas**: Checkboxes agrupados por curso
- **Observações**: Campo de texto livre

### 3. Salvamento
- **Botão "Salvar Rascunho"**: Cria/atualiza com `status: 'draft'`
- **Botão "Enviar para Coordenação"**: 
  1. Cria/atualiza como draft
  2. Chama `PATCH /teacher-semester-availabilities/:id/submit` para mudar status para 'submitted'

## Validações Frontend

1. **Pelo menos um turno selecionado**: `morning || afternoon || evening === true`
2. **Semestre selecionado**: `academicPeriodId` não pode ser vazio
3. **teacherId presente**: Obtido do usuário logado
4. **Disciplinas válidas**: Apenas disciplinas dos cursos vinculados ao professor
5. **Status bloqueado**: Se status for 'submitted' ou 'approved', não permite edição

## Resposta Esperada do Backend

```typescript
{
  id: string,
  teacherId: string,
  semesterId: string,              // ID do semestre (retornado pelo backend)
  status: 'draft' | 'submitted' | 'approved',
  morning: boolean,
  afternoon: boolean,
  evening: boolean,
  observations?: string | null,
  disciplines?: Array<{
    id: string,
    name: string,
    code: string
  }>,
  weekdays?: string[],             // Dias da semana (retornado pelo backend)
  createdAt: string,
  submittedAt?: string | null,
  approvedAt?: string | null,
  approvedBy?: string | null
}
```

## Endpoints Relacionados

### Buscar Semestres Disponíveis
- `GET /teacher-semester-availabilities/teacher/:teacherId/available-semesters`
- **Resposta**: `Array<{ id: string, nome: string, ativo: boolean }>`

### Buscar Disponibilidade por Semestre
- `GET /teacher-semester-availabilities/teacher/:teacherId/semester/:semesterId`
- **Resposta**: `DisponibilizacaoHorarios | null` (404 se não existir)

### Buscar Todas as Disponibilizações do Professor
- `GET /teacher-semester-availabilities/teacher/:teacherId`
- **Resposta**: `DisponibilizacaoHorarios[]`

### Submeter Disponibilidade
- `PATCH /teacher-semester-availabilities/:id/submit`
- **Resposta**: `DisponibilizacaoHorarios` (com status atualizado para 'submitted')

## Observações Importantes

1. **semesterId vs academicPeriodId**: 
   - No **payload de envio** usamos `academicPeriodId`
   - Na **resposta do backend** recebemos `semesterId`
   - O frontend mapeia `semesterId` da resposta para exibição

2. **Dias da Semana**: 
   - Enviamos como array de strings no formato: `'segunda-feira'`, `'terca-feira'`, etc.
   - Esperamos receber no mesmo formato na resposta

3. **Disciplinas**: 
   - Enviamos apenas os IDs das disciplinas selecionadas
   - Recebemos objetos completos com `id`, `name`, `code` na resposta

4. **Validação de UUID**: 
   - O frontend não valida formato UUID, confia que o backend valida
   - Se o backend retornar erro de UUID inválido, o frontend exibe a mensagem de erro

## Possíveis Problemas

1. **Erro: "property semesterId should not exist"**
   - **Causa**: Frontend ainda enviando `semesterId` no payload
   - **Solução**: Garantir que o payload use `academicPeriodId` e `teacherId`

2. **Erro: "teacherId é obrigatório"**
   - **Causa**: `teacherId` não está sendo enviado ou está vazio
   - **Solução**: Verificar se `getCurrentUser()` retorna o ID corretamente

3. **Erro: "academicPeriodId é obrigatório"**
   - **Causa**: Semestre não selecionado ou ID inválido
   - **Solução**: Verificar se o dropdown de semestres está populado corretamente

4. **Erro: "teacherId deve ser um UUID válido"**
   - **Causa**: Formato do ID do professor não é UUID
   - **Solução**: Verificar formato do ID retornado por `getCurrentUser()`

5. **Erro: "academicPeriodId deve ser um UUID válido"**
   - **Causa**: Formato do ID do semestre não é UUID
   - **Solução**: Verificar formato dos IDs retornados por `available-semesters`



