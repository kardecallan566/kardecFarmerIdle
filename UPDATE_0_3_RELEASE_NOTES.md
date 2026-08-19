# Kardec Farmer Idle — Update 0.3

## Era das Estratégias

O Update 0.3 transforma o jogo em um tower defense agrícola com decisões relevantes durante a run e progressão de longo prazo no Acampamento. A implementação preserva a economia dual, o farol central, os oito quartéis em anel, as lanes invisíveis, o layout vertical e o fluxo Home → Arena → Game Over → Acampamento.

> **Estado da entrega:** implementado, validado e publicado no branch `main`.

## Entregas principais

| Sistema | Implementação entregue | Local principal |
|---|---|---|
| Economia e saves | Custo efetivo centralizado, migração de save v3, `bankGold` separado de `combatCoins` | `lib/game/types.ts`, `lib/game/storage.ts` |
| Habilidades | Framework tipado, cooldowns, ativação móvel e efeitos reais de Provocação, Chuva de Flechas e Muralha | `lib/game/abilities.ts`, `lib/game/abilitySystem.ts`, `lib/game/useGameLoop.ts` |
| Formações | Linha Equilibrada, Muralha da Vila e Fogo Cruzado, com bônus de vizinhança dos quartéis | `lib/game/formations.ts`, `lib/game/guardStats.ts` |
| Relíquias | Raridades, sorteio ponderado e arquétipos Assault, Bastion, Precision e Logistics | `lib/game/relics.ts`, `components/game/WaveRewardsScreen.tsx` |
| Bosses | Três fases por vida, telegráficos visuais, ataques especiais, minions e onda de choque | `lib/game/bossPhases.ts`, `lib/game/useBossWaves.ts` |
| Novos inimigos | Voador, Demolidor, Invocador e Espectro, com traversal e counters específicos | `lib/game/types.ts`, `lib/game/enemyCounters.ts` |
| Arte | Quatro sprites próprios em PNG RGBA, bestiário expandido para nove entradas | `assets/images/enemy-*-terror-transparent.png` |
| Tecnologia | Ramos Doutrina de Combate, Linhas de Suprimento e Guarda da Floresta, cinco níveis cada | `lib/game/technology.ts`, `components/game/ProgressionMenu.tsx` |
| Eventos | Eventos opcionais em marcos selecionados após Bosses, com escolhas de risco/recompensa | `lib/game/runEvents.ts`, `components/game/WaveRewardsScreen.tsx` |
| Ascensão | Essência da Floresta, requisitos de wave, custos crescentes e bônus permanentes | `lib/game/ascension.ts`, `components/game/ProgressionMenu.tsx` |
| Estatísticas | Dano causado/recebido, perdas, escapes, abates por classe, Bosses, habilidades, gastos e decisões | `lib/game/types.ts`, `lib/game/GameContext.tsx` |
| Áudio e haptics | Música ambiente original em loop, feedback contextual para dano, wave, recompensa e Game Over | `assets/audio/forest-defense-loop.wav`, `lib/game/useGameAudio.ts` |
| UI | Home orientada a metas, Acampamento com tecnologia/Ascensão e Game Over detalhado | `HomeScreen.tsx`, `ProgressionMenu.tsx`, `app/(tabs)/index.tsx` |

## Regras de balanceamento preservadas

A moeda persistente continua sendo o **Ouro do Acampamento** e só paga desbloqueios, treinamentos, upgrades do farol, tecnologia e Ascensão. Os **Suprimentos de Combate** continuam temporários e pagam somente tropas durante a defesa. A redução de custo de relíquias, tecnologia de logística, seleção de card e confirmação no quartel passam pelo mesmo helper, evitando divergência entre o valor exibido e o valor cobrado.

As tropas recebem stats por um pipeline centralizado que combina nível permanente, relíquias, quartel, formação, tecnologia e Ascensão. Bosses continuam aparecendo em waves múltiplas de cinco; o Intervalo Tático permanece restrito a essas transições. Eventos aparecem apenas em marcos selecionados após a escolha da relíquia, evitando interromper cada wave.

## Fluxo de jogo atualizado

Durante a arena, o jogador posiciona tropas, alterna formações e ativa habilidades individuais pelo painel horizontal da CardBar. A composição precisa responder aos counters: arqueiros têm vantagem contra Voadores, guerreiros pressionam Demolidores e tanques lidam melhor com Espectros. Invocadores criam servos e exigem prioridade de foco.

Ao derrotar um Boss, o jogador recebe Essência da Floresta, escolhe uma relíquia com raridade e, em marcos específicos, decide um evento de run. Ao perder, o Game Over mostra o desempenho da tentativa. No Acampamento, o Ouro financia tecnologia e Ascensão, enquanto o bestiário registra as classes descobertas.

## Commits publicados

| Commit | Conteúdo |
|---|---|
| `e1a5bc3`–`7f42f26` | Base visual, economia, habilidades, formações, relíquias e Bosses |
| `756e314` | Classes estratégicas de inimigos, counters, traversal, sprites e bestiário |
| `10339c0` | Árvore tecnológica, eventos, Ascensão e save v3 |
| `9403820` | Estatísticas detalhadas e relatório de Game Over |
| `85d1522` | Música ambiente, haptics e polimento audiovisual |

## Validação executada

| Verificação | Resultado |
|---|---|
| `pnpm check` | Passou sem erros TypeScript |
| `pnpm test` | 16 testes passaram; 1 teste de autenticação foi ignorado pelo scaffold |
| `pnpm exec vitest run ...` | Habilidades, Bosses, inimigos, formações, relíquias e progressão meta passaram |
| `pnpm lint` | 0 erros; permanecem 15 avisos em componentes legados `*Enhanced`/`VisualEffects` não usados no fluxo principal |
| `pnpm exec expo export --platform web --clear` | Export web concluído; bundle JS de aproximadamente 2,6 MB |
| `pnpm dlx expo-doctor` | 18/18 verificações passaram |
| Asset de áudio | WAV PCM estéreo, 16-bit, 44.1 kHz, compatível com `expo-audio` |
| Git | Working tree limpo; `main` sincronizado com `origin/main` |

## Avisos conhecidos

Os 15 avisos de lint pertencem a componentes legados que não participam do fluxo principal: `AdvancedParticles`, `CardBarEnhanced`, `GameHUDEnhanced`, `GameMapEnhanced` e `VisualEffects`. Eles não impedem o type-check, os testes, o export web ou o diagnóstico do Expo. A remoção desses avisos pode ser tratada como uma tarefa futura de limpeza, sem alterar os sistemas do Update 0.3.

## Próximos passos recomendados

A próxima etapa recomendada é testar uma run completa em dispositivo Android físico, especialmente a reprodução do áudio, o feedback háptico, a altura do modal de eventos e a leitura dos novos sprites em telas pequenas. Depois, vale executar uma rodada de balanceamento manual entre waves 5, 6, 10 e 11, verificando se a combinação de Ascensão, tecnologia e relíquias não acelera demais a progressão.
