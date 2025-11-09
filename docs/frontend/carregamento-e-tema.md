# Plano: Carregamento inicial, flash de tema e sequência de loadings

## Objetivos
- Garantir que o tema salvo (dark/liquid-glass) seja aplicado antes da hidratação, sem flash.
- Exibir um loading imediatamente após o primeiro byte de HTML, reduzindo a percepção de “página em branco”.
- Sincronizar a remoção do loading inicial com a disponibilidade real do conteúdo (ou do loading com sidebar).

## Diagnóstico
**Por que aparece uma página em branco antes do loading principal?**
1. O navegador só pode renderizar após receber os primeiros bytes de HTML (TTFB). Antes disso, a tela fica branca por natureza do carregamento.
2. `globals.css` (link externo gerado pelo Next) é render-blocking: o browser tende a segurar a primeira pintura até concluir o CSS crítico. Isso pode atrasar a exibição do `#initial-loading` mesmo com estilos inline.
3. O `loading.tsx` de cada rota (que mostra “loading com sidebar”) usa componentes client; ele só aparece após o JS do cliente hidratar, então vem depois do loading inicial.

## Decisões e Ajustes
- [x] Aplicar classe de tema no `<html>` via script inline no `<head>` antes da hidratação (evita flash light->dark).
- [x] Estilizar o fundo do `html/body` no `<head>` conforme o tema para reduzir percepção de “branco” antes do loader.
- [x] Manter `#initial-loading` até detectar que a estrutura da página (sidebar ou conteúdo real) está visível, removendo com fade-out.
- [x] Remover scripts redundantes que removiam o loading cedo demais.

## Próximos Passos (opcionais)
- [ ] Medir TTFB e otimizar (cache, evitar cold start, otimizar queries/SSR).
- [ ] Reduzir o peso de `globals.css` e avaliar split/critical CSS.
- [ ] Auditar importações de fontes (já em `display: swap`) e imagens críticas.

## Testes de Aceite
- [x] Recarregar (F5) em rota interna: tema correto desde o primeiro render, sem flash.
- [x] Ver sequência: (1) fundo já na cor do tema, (2) loading inicial, (3) loading com sidebar (quando aplicável), (4) conteúdo.
- [x] Remoção do loading inicial com transição suave apenas quando há estrutura visível.

## Observações
- A “página em branco” antes de qualquer coisa é principalmente TTFB + render-blocking CSS. Não dá para “renderizar” sem HTML; mitigamos com cor de fundo do tema e um loader que aparece assim que o body é parseado.


