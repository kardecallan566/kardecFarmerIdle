# Kardec Farmer Idle — Plano Mestre do Update 0.3
## Era das Estratégias

**Objetivo:** evoluir o jogo atual de Tower Defense agrícola com Idle e Roguelike para uma experiência estratégica mais profunda, modular e pronta para crescer, preservando o que já funciona e reduzindo riscos de regressão.

**Documento de origem:** `KardecFarmerIdle—EspecificaçãodoUpdate0.3_EradasEstratégias.md`

**Branch de trabalho:** `main`

**Ponto de partida:** commit `187ef9a`, com economia dual, ícones próprios de moeda, oito quartéis circulares, spawn radial externo, skins por era, farol central, progressão persistente e preview Expo Go Android corrigido.

---

## 1. Regras que não podem regredir

| Regra | Contrato que deve ser preservado |
|---|---|
| Economia permanente | `bankGold` é Ouro do Acampamento, persiste e paga somente upgrades, desbloqueios, árvore tecnológica, Ascensão e recompensas permanentes. |
| Economia da run | `combatCoins` é Suprimentos de Combate, nasce na defesa, paga somente tropas da run e nunca é convertido diretamente em `bankGold`. |
| Arena | O farol permanece no centro e os oito quartéis permanecem organizados em anel radial, com layout vertical responsivo. |
| Caminho dos inimigos | As lanes continuam invisíveis visualmente; os monstros nascem fora da tela e convergem para o farol. |
| Estrutura protegida | O farol não causa dano aos monstros. Ele apenas gera tropas, recebe dano e oferece feedback visual. |
| Waves | Waves comuns avançam automaticamente; o Intervalo Tático aparece somente depois de Boss Waves múltiplas de cinco. |
| Bosses | Bosses continuam escalando por wave/era e mantendo skins `wild`, `scarred`, `ancient` e `apocalypse`. |
| Performance | A simulação permanece em passo fixo de aproximadamente 16 ms; `requestAnimationFrame` continua reservado aos efeitos visuais. |
| Mobile | Todos os controles precisam ser confortáveis em tela vertical pequena e continuar funcionando em Android, iOS e web. |
| Visibilidade | Não reintroduzir círculos de alcance, halos de monstros ou indicadores permanentes que poluam a arena. |

---

## 2. Ordem de execução e dependências

A implementação será feita em incrementos pequenos, jogáveis e publicáveis. Nenhuma camada de conteúdo deve ser construída sobre um cálculo de custo, stats ou save ainda instável.

| Fase | Entrega | Depende de | Estado |
|---|---|---|---|
| 0 | Auditoria, baseline e testes de regressão | Estado atual | Concluída |
| 1 | Economia, custos, stats centralizados, migrations e dívida técnica | Fase 0 | Concluída |
| 2 | Framework extensível de habilidades | Fase 1 | Concluída |
| 3 | Provocação, Chuva de Flechas e Muralha | Fase 2 | Concluída |
| 4 | Bônus de quartéis e formações | Fase 1 e 3 | Concluída |
| 5 | Relíquias com raridade e builds | Fase 1, 2 e 4 | Concluída |
| 6 | Bosses com fases e telegráficos | Fase 2, 4 e 5 | Concluída |
| 7 | Voador, Demolidor, Invocador e Espectro | Fase 1, 2 e 6 | Concluída |
| 8 | Árvore tecnológica, eventos, Bestiário expandido e Ascensão | Fase 1, 5, 6 e 7 | Concluída |
| 9 | Estatísticas da run, Game Over e Home orientada a metas | Fase 3–8 | Concluída |
| 10 | Áudio, haptics e polimento audiovisual | Fase 3, 6, 7 e 9 | Concluída |
| 11 | Balanceamento, performance, testes e compatibilidade | Todas as fases | Concluída |
| 12 | Documentação, changelog, commit final e entrega | Fase 11 | Concluída |

Cada fase deve terminar com `pnpm check`, `pnpm lint`, `git diff --check` e uma validação em execução real quando a alteração for visível ou interativa.

> **Status final — agosto de 2026:** as fases de implementação do Update 0.3 foram concluídas no branch `main`. A entrega inclui os sistemas descritos neste plano, foi validada com type-check, testes, lint, export web e `expo-doctor`, e está documentada em `UPDATE_0_3_RELEASE_NOTES.md`. O lint permanece com 15 avisos legados em componentes fora do fluxo principal; não há erros de TypeScript ou bloqueios de export.

---

## 3. Fase 0 — Auditoria e baseline

### Objetivo

Registrar o comportamento atual antes de alterar a base, identificar dívidas técnicas e criar uma rede mínima de testes para que cada novo sistema seja comparado com uma referência conhecida.

### Tarefas

- Confirmar o fluxo Home → Arena → Game Over → Acampamento → nova partida.
- Confirmar a separação de `bankGold` e `combatCoins` em uma run limpa e em um save carregado.
- Confirmar o cálculo atual de `combatCost`, `goldCost`, recompensa, bestiário e idle.
- Mapear todas as alterações de estado necessárias para habilidades, formações, relíquias, Bosses, inimigos, eventos, árvore e estatísticas.
- Documentar quais componentes legados ainda são compilados e geram avisos de lint.
- Criar fixtures determinísticas para Wave 1, Wave 5, Wave 6, uma run com cada classe e uma run com save antigo.
- Adicionar testes de fumaça para reducer, custo, reset de run, persistência e colocação de tropa.

### Critérios de aceite

- Existe uma baseline reprodutível para pelo menos Wave 1, Wave 5 e Game Over.
- Nenhum teste demonstra transferência indevida entre `combatCoins` e `bankGold`.
- O estado inicial, o reset de run e o carregamento de save antigo estão documentados.

---

## 4. Fase 1 — Fundação técnica, custos, stats e persistência

### 4.1 Corrigir o custo real das cartas

Criar uma função única, por exemplo `getEffectiveCombatCost(guardType, runState)`, que componha:

- `GUARD_CONFIGS[guardType].combatCost` como custo base.
- Redução ou aumento proveniente das relíquias da run.
- Eventuais modificadores futuros de formação, evento ou tecnologia temporária.
- Arredondamento inteiro e limite mínimo de zero.

A mesma função deve ser usada na carta, no botão de confirmação, no reducer e em qualquer prévia. O jogador nunca deve ver um valor e pagar outro.

### 4.2 Corrigir nomenclatura residual

- Renomear a chave visual legada `coins` para `combatCoins` em `WaveRewardsScreen`.
- Usar `goldCost` para toda compra persistente.
- Usar `combatCost` para toda compra de tropas na arena.
- Remover referências ambíguas a “gold” no HUD da arena quando o valor for `combatCoins`.

### 4.3 Centralizar o cálculo de stats

Criar um pipeline único, por exemplo `getEffectiveGuardStats`, com ordem explícita:

1. Stats base da classe.
2. Upgrade permanente da classe.
3. Relíquias da run.
4. Bônus do quartel.
5. Bônus de formação.
6. Efeitos temporários de habilidade.
7. Modificadores de evento.

O resultado deve conter origem dos bônus para depuração futura, por exemplo `base`, `persistent`, `relic`, `sector`, `formation`, `ability` e `event`.

### 4.4 Versionar o save

Adicionar `saveVersion` ao perfil persistente e uma cadeia de migrações idempotentes. A migração deve:

- Preservar progresso de jogadores antigos.
- Criar defaults para novos campos.
- Separar qualquer campo antigo de moeda sem transformar suprimentos em ouro.
- Preparar espaço para árvore tecnológica, Essência da Floresta, relíquias persistentes e estatísticas.
- Ser testada com fixtures de saves de versões anteriores.

### 4.5 Arte pendente

Criar um sprite próprio para o Arqueiro Elite. Enquanto a arte não estiver disponível, manter fallback explícito em uma tabela de assets com label de fallback documentado, evitando que a ausência pareça um tier quebrado.

### Critérios de aceite

- Carta e compra usam exatamente o mesmo custo efetivo.
- A relíquia de redução de custo altera o valor cobrado.
- `WaveRewardsScreen` usa a nomenclatura e cor de `combatCoins`.
- Stats das tropas passam por um cálculo centralizado.
- Saves antigos carregam sem perder progresso.
- O Arqueiro Elite possui arte própria ou fallback explícito e testado.

---

## 5. Fase 2 — Framework extensível de habilidades

### Objetivo

Criar uma camada de habilidades orientada a dados, sem espalhar regras específicas diretamente pelo `useGameLoop`.

### Modelo proposto

Criar contratos como:

- `AbilityId`.
- `AbilityDefinition`.
- `AbilityRuntimeState`.
- `AbilityEffect`.
- `AbilityTargetingMode`.
- `AbilityTriggerResult`.

Cada habilidade deve declarar identificador, nome, descrição, cooldown, duração, raio, condição de ativação, efeitos, feedback visual, feedback sonoro e regras de alvo.

### Responsabilidades

- `lib/game/abilities.ts`: catálogo de habilidades e definições.
- `lib/game/abilitySystem.ts`: validação, ativação, cooldown e efeitos.
- `GameContext`: estado mínimo e ações de ativação.
- `useGameLoop`: processamento dos efeitos ativos em cada tick.
- `GameMap`: apresentação visual, telemetria de disponibilidade e feedback.
- `CardBar`: indicador de habilidade pronta, cooldown e controle grande para toque.

### Regras

Uma habilidade não pode ser ativada se a tropa estiver morta, ausente, em cooldown ou sem condição válida. O sistema deve permitir novas tropas e habilidades sem criar uma cadeia de `if` rígidos no loop.

### Critérios de aceite

- Uma habilidade de teste pode ser registrada apenas por configuração.
- Cooldown, duração e efeitos são determinísticos.
- A tropa não pode ativar duas vezes durante o mesmo cooldown.
- O estado visual acompanha o estado lógico.

---

## 6. Fase 3 — Habilidades das tropas

### Guerreiro — Provocação

Implementar ativação manual pela carta, pelo sprite selecionado ou por um controle contextual no mapa. Inimigos dentro do raio passam a priorizar o Guerreiro por alguns segundos. Durante a duração, o Guerreiro recebe redução temporária de dano. Ao terminar, pode executar um golpe de pequena área.

O mapa deve mostrar apenas um feedback contextual curto: brilho, escudo, texto ou pulso sobre a unidade. Não usar círculo permanente de alcance.

### Arqueiro — Chuva de Flechas

Implementar área temporária de impacto manual ou seleção automática do maior agrupamento de inimigos. A habilidade deve produzir múltiplos projéteis ou ataques em sequência, possuir cooldown próprio e ser visualmente diferente do ataque comum.

O Arqueiro continua frágil, e a habilidade deve recompensar posicionamento seguro e escolha de alvo prioritário.

### Tanque — Muralha

Implementar estado defensivo temporário com redução significativa de dano e lentidão ou controle nos inimigos próximos. O estado deve ser consultado pelo cálculo de dano e pelo processamento de inimigos.

A apresentação deve modificar temporariamente o sprite, a borda ou a aura do Tanque, sem desenhar um raio de alcance permanente.

### Critérios de aceite

- As três habilidades possuem cooldown visível e acionável em celular.
- Cada habilidade muda o combate de maneira observável.
- Habilidades não ativam em tropas mortas ou durante cooldown.
- O uso de habilidades entra nas estatísticas da run.
- O loop continua no passo fixo de 16 ms.

---

## 7. Fase 4 — Quartéis, stats posicionais e formações

### 7.1 Bônus dos setores

Associar a cada um dos oito quartéis um bônus pequeno e legível, sem criar um setor obrigatório. Exemplos:

| Tipo de setor | Bônus sugerido |
|---|---|
| Vigia | Alcance |
| Arsenal | Dano |
| Oficina | Velocidade de ataque |
| Muralha | Vida |
| Trilha | Velocidade de movimento |
| Santuário | Recuperação de cooldown |
| Celeiro | Eficiência de suprimentos da tropa |
| Farol auxiliar | Duração de habilidade |

Os nomes e valores devem ser definidos em dados. A informação deve aparecer em tooltip, painel contextual ou detalhe de quartel, sem texto permanente sobre a arena.

### 7.2 Formações

Implementar formações condicionais atualizadas quando uma tropa nasce, morre, muda de quartel ou deixa de cumprir a distância necessária.

Formações iniciais:

- Guerreiro + Arqueiro: bônus de dano do Arqueiro contra inimigos provocados ou marcados pelo Guerreiro.
- Guerreiro + Tanque: redução de dano para ambos.
- Dois ou mais Arqueiros em setores compatíveis: aumento leve de velocidade de ataque.

### Critérios de aceite

- Cada quartel ativo informa seu bônus de maneira acessível.
- O cálculo centralizado mostra o bônus setorial e a formação aplicada.
- Formações não aplicam bônus quando uma das unidades morre ou é removida.
- Nenhum setor é claramente obrigatório em todos os cenários.

---

## 8. Fase 5 — Relíquias, raridades e builds

### Raridades

Adicionar `common`, `uncommon`, `rare`, `epic` e `legendary`, com pesos controlados por contexto e era. A raridade deve influenciar a chance, não garantir vitória.

### Relíquias comportamentais

Além dos bônus atuais, adicionar efeitos como:

- Guerreiro muito mais forte, com pequena redução para Arqueiros.
- Ataque especial a cada determinado número de ataques de Arqueiros.
- Dano em área quando uma tropa morre.
- Efeito de retaliação ou escudo quando o Tanque recebe grande dano.
- Sinergia com habilidades, formações e setores.

### Geração de opções

A seleção de três relíquias deve:

- Evitar três opções da mesma categoria.
- Reduzir duplicatas repetitivas.
- Considerar relíquias já possuídas na run.
- Aplicar pesos por build e classe utilizada.
- Registrar a escolha para estatísticas e Game Over.
- Reiniciar todos os efeitos ao começar nova defesa.

### Critérios de aceite

- Cada carta mostra raridade, categoria, efeito e impacto resumido.
- O jogador recebe três opções realmente diferentes.
- Relíquias comportamentais alteram o combate, não apenas os números.
- Nenhuma relíquia da run sobrevive indevidamente ao reset.

---

## 9. Fase 6 — Bosses com fases e telegráficos

### Máquina de estados

Cada Boss deve ter fase atual, limiares de vida, habilidades disponíveis, cooldowns, estado de telegráfico e histórico de fases já ativadas.

Exemplo de fases:

- Acima de 70%: comportamento base e velocidade moderada.
- Abaixo de 70%: começa a invocar inimigos ou altera a composição das lanes.
- Abaixo de 40%: pode atacar, danificar ou desativar temporariamente um quartel.
- Abaixo de 20%: entra em fúria, aumentando temporariamente velocidade e dano.

A quantidade e os tipos de fases devem variar por era e, futuramente, por identidade do Boss.

### Telegráficos

Antes de cada habilidade, mostrar indicação clara de setor, área, alvo ou contagem regressiva. O telegráfico deve permitir reação real, especialmente para desativação de quartel e ataques em área.

### Critérios de aceite

- Cada transição de fase acontece uma única vez por limiar.
- O Boss preserva velocidade e geração de minions atuais.
- Ataques especiais podem ser evitados ou mitigados com posicionamento/habilidade.
- O setor afetado por ataque ao quartel é visível antes do impacto.
- O Intervalo Tático continua aparecendo somente após a derrota do Boss.

---

## 10. Fase 7 — Novos inimigos e counters

### Voador

Move-se com regras diferentes das lanes terrestres ou ignora parte das barreiras. O Arqueiro deve ser especialmente eficiente contra ele.

### Demolidor

Prioriza quartéis em vez do farol. Deve criar alerta e forçar reação rápida. Pode danificar ou desativar o quartel por duração limitada.

### Invocador

Fica atrás do grupo e gera unidades menores periodicamente. Deve ser um alvo prioritário para tropas de longo alcance.

### Espectro

Possui resistência ou imunidade parcial a ataques corpo a corpo. Deve criar uma razão clara para manter Arqueiros na composição.

### Regras comuns

- Cada inimigo tem função e counter claros.
- As novas espécies entram no Bestiário automaticamente.
- Skins e multiplicadores de era são herdados.
- O sistema de alvo deve permitir prioridades diferentes por classe.
- Os novos inimigos não devem ser somente versões com mais vida.

### Critérios de aceite

- Cada inimigo é reconhecível sem depender apenas de cor.
- O jogador consegue entender como reagir.
- As waves introduzem os inimigos gradualmente.
- O balanceamento não torna uma única tropa obrigatória.

---

## 11. Fase 8 — Árvore tecnológica, eventos e Ascensão

### Árvore tecnológica persistente

Construir a árvore sobre `bankGold`, dividida em três caminhos:

- Combate: stats, habilidades, eficiência e especializações de tropas.
- Economia: Ouro do Acampamento, idle, recompensas e eficiência de suprimentos.
- Defesa: vida da plantação, quartéis, resistência do núcleo e recuperação.

A árvore deve permitir escolhas e caminhos alternativos, em vez de exigir uma progressão linear completa.

### Eventos de run

Criar uma lista de eventos compatíveis com o estágio atual. Os eventos devem ser opcionais e não aparecer em todas as waves.

Exemplos:

- Recompensa imediata em Suprimentos em troca de uma próxima wave mais difícil.
- Relíquia com custo em Ouro do Acampamento.
- Noite Sombria: inimigos mais rápidos por duas waves em troca de recompensa maior.
- Escolha de risco entre recuperar vida, ganhar suprimentos ou aumentar dificuldade.

### Ascensão

Depois de uma marca de progressão, permitir reiniciar parte dos upgrades em troca de Essência da Floresta. Antes da confirmação, exibir claramente o que será perdido e mantido.

A Essência da Floresta deve fornecer bônus permanentes pequenos, como:

- Aumento de Ouro do Acampamento.
- Dano das tropas.
- Velocidade do farol.
- Eficiência da colheita ociosa.

### Critérios de aceite

- Tecnologia e Ascensão consomem somente `bankGold` ou moeda permanente própria.
- `combatCoins` nunca aparece em custos persistentes.
- Eventos possuem condições, oferta, risco/recompensa e duração.
- A Ascensão é opcional, explícita e migrável.
- O jogador consegue visualizar a próxima meta na Home.

---

## 12. Fase 9 — Bestiário expandido, estatísticas e Game Over

### Estatísticas da run

Adicionar ao estado temporário:

- Dano total por classe.
- Inimigos mortos por espécie.
- Dano sofrido pela plantação.
- Dano absorvido pelo Tanque.
- Tropas perdidas.
- Habilidades ativadas por classe.
- Bosses derrotados.
- Relíquias escolhidas.
- Tempo sobrevivido.
- Suprimentos ganhos, gastos e restantes.
- Quartéis usados e formações ativadas.

### Game Over detalhado

Reorganizar o relatório para mostrar wave, tempo, abates, Bosses, tropas, relíquias, dano por classe e recompensa dividida em categorias:

- Recompensa base da wave.
- Recompensa por inimigos derrotados.
- Recompensa por Bosses.
- Recompensas do Bestiário.
- Bônus de evento ou marco.

### Bestiário

Cada espécie deve possuir descrição curta, stats básicos, counter, marcos de derrota e recompensa única. Novos inimigos entram automaticamente e as recompensas devem ser idempotentes após reload ou migração.

### Home orientada a metas

Mostrar uma próxima meta contextual, como:

- Próxima Boss Wave.
- Próximo upgrade comprável.
- Próximo desbloqueio.
- Próximo marco do Bestiário.
- Próxima tecnologia disponível.
- Próxima condição de Ascensão.

### Critérios de aceite

- Game Over permite entender por que a run venceu ou perdeu.
- A estatística de cada classe ajuda a tomar decisão na próxima partida.
- Recompensas não são duplicadas ao reabrir a tela.
- A Home funciona como painel de objetivos, sem sobrecarregar a tela.

---

## 13. Fase 10 — Áudio, haptics e polimento audiovisual

### Música

Adicionar trilhas separadas ou variações para:

- Home.
- Acampamento.
- Arena.
- Arena em Boss Wave, com maior intensidade.

### Efeitos sonoros

Criar eventos para colocação de tropa, ataque do Guerreiro, disparo do Arqueiro, impacto, ataque do Tanque, morte de inimigo, morte de tropa, dano no farol, compra de tropa, compra de upgrade, escolha de relíquia, conclusão de wave, surgimento de Boss e Game Over.

### Controles

Adicionar volume geral, música ligada/desligada, efeitos ligados/desligados e haptics ligados/desligados. O carregamento deve ser eficiente e os efeitos recorrentes devem ser reutilizados.

### Haptics

Usar feedback curto para colocação, feedback mais forte para morte de tropa, sequência especial para surgimento de Boss e feedback comemorativo para derrota do Boss. Nunca executar haptics a cada frame.

### Efeitos visuais

- Impacto curto no ataque do Guerreiro.
- Projétil perceptível do Arqueiro.
- Estado defensivo do Tanque.
- Partículas limitadas em mortes e habilidades.
- Indicadores de habilidade ativos e cooldowns legíveis.

### Critérios de aceite

- Áudio e haptics podem ser desligados independentemente.
- Não há criação de objetos de áudio dentro do loop de 16 ms.
- Boss Wave possui identidade audiovisual distinta.
- O limite de partículas e projéteis é respeitado em waves grandes.

---

## 14. Fase 11 — Performance, balanceamento, testes e compatibilidade

### Performance

- Preservar simulação fixa de 16 ms.
- Evitar arrays e objetos temporários desnecessários por tick.
- Particionar entidades por lane e raio antes de adotar spatial hashing completo.
- Limitar/reutilizar partículas e projéteis.
- Cachear alvos e recalcular apenas quando necessário.
- Medir tempo de tick, FPS visual, quantidade de entidades e uso de memória.
- Testar Android de entrada, intermediário, topo de linha e telas de 60/90/120 Hz.

### Balanceamento

Coletar métricas de duração média da wave, tropas vivas, suprimentos gastos, taxa de derrota por wave, uso de cada classe, escolha de relíquias, ativação de habilidades e frequência de eventos.

Ajustar counters e recompensas com base nos dados, não apenas em alterações manuais de vida/dano. O objetivo é evitar composição obrigatória, tropa inútil ou relíquia dominante.

### Testes automatizados

Criar testes para:

- `getEffectiveCombatCost`.
- Stats centralizados.
- Relíquias e raridades.
- Formações e setores.
- Habilidades e cooldowns.
- Spawn e rota de inimigos.
- Fases de Boss.
- Ataques de novos inimigos.
- Colocação de tropa.
- Geração do farol.
- Recompensa de Game Over.
- Reset de partida.
- Persistência de `bankGold`.
- Ausência de persistência de `combatCoins`.
- Migrações de save.
- Árvore tecnológica e Ascensão.
- Eventos temporários.

### Critérios de aceite

- Type-check e lint sem erros.
- Testes unitários e de reducer passam.
- Build web e bundle Android passam.
- Fluxo Expo Go Android continua documentado e funcional.
- Nenhuma regressão nos botões Home, Arena, Game Over e Acampamento.

---

## 15. Fase 12 — Documentação e publicação

### Documentação

Atualizar:

- `README.md` com habilidades, formações, relíquias, inimigos, árvore, Ascensão, eventos, áudio e controles.
- `ASSETS.md` com novos sprites, Bosses, Voador, Demolidor, Invocador, Espectro e assets de áudio.
- `ASSET_REVIEW.md` com validações por fase.
- `PROGRESSION_EXPANSION.md` com árvore, Ascensão e eventos.
- `ANDROID_EXPO_GO.md` caso os comandos ou dependências mudem.
- Criar changelog do Update 0.3.

### Estratégia de commits

Cada entrega de risco deve ter commit separado e mensagem clara:

1. `test: add update 0.3 baseline fixtures`
2. `fix: centralize combat costs and save migrations`
3. `feat: add extensible troop ability system`
4. `feat: add warrior archer and tank abilities`
5. `feat: add sector bonuses and troop formations`
6. `feat: expand relic rarities and run builds`
7. `feat: add phased boss encounters and telegraphs`
8. `feat: add strategic enemy counters`
9. `feat: add technology tree run events and ascension`
10. `feat: expand run statistics and game over report`
11. `feat: add audio haptics and combat feedback`
12. `test: validate update 0.3 balance and mobile performance`
13. `docs: publish update 0.3 changelog and acceptance report`

Cada commit deve ser validado antes do push. Assets grandes e temporários não devem entrar no histórico. Cópias `_original`, previews, scripts descartáveis, `dist` e `.expo` devem ser removidos antes da publicação.

---

## 16. Checklist final de aceite do Update 0.3

### Economia e fundação

- [ ] Custo efetivo centralizado e igual no card e na compra.
- [ ] Relíquia de redução de custo funcionando.
- [ ] `combatCoins` e `bankGold` continuam completamente separados.
- [ ] Save versionado e migrável.
- [ ] Arqueiro Elite com arte própria ou fallback explícito.

### Tropas e estratégia

- [ ] Guerreiro possui Provocação.
- [ ] Arqueiro possui Chuva de Flechas.
- [ ] Tanque possui Muralha.
- [ ] Habilidades têm cooldown, feedback e bloqueios corretos.
- [ ] Quartéis possuem bônus setoriais.
- [ ] Formações atualizam ao nascer, morrer, mover ou perder condição.
- [ ] Stats efetivos passam por cálculo centralizado.

### Relíquias e Bosses

- [ ] Relíquias têm raridade.
- [ ] Ofertas evitam duplicatas e categorias repetidas.
- [ ] Builds comportamentais existem.
- [ ] Bosses possuem fases por vida.
- [ ] Bosses possuem telegráficos claros.
- [ ] Ataques especiais podem ser respondidos pelo jogador.

### Inimigos e progressão

- [ ] Voador possui counter claro.
- [ ] Demolidor prioriza quartéis.
- [ ] Invocador cria unidades menores.
- [ ] Espectro pressiona a dependência de ataques à distância.
- [ ] Todos entram no Bestiário com marcos e recompensas idempotentes.
- [ ] Árvore de tecnologia funciona com `bankGold`.
- [ ] Eventos opcionais de run funcionam.
- [ ] Ascensão deixa claro o que perde e mantém.

### Produto e polimento

- [ ] Game Over mostra estatísticas detalhadas e recompensa decomposta.
- [ ] Home mostra próxima meta.
- [ ] Áudio possui música por tela e variação de Boss.
- [ ] Efeitos sonoros e haptics possuem controles independentes.
- [ ] Ataques, habilidades e mortes têm feedback visual.
- [ ] Partículas e projéteis possuem limites.
- [ ] Testes automatizados cobrem sistemas críticos.
- [ ] Preview web, bundle Android e Expo Go passam.
- [ ] Performance permanece estável em Android de entrada.

---

## 17. Definição de concluído

O Update 0.3 será considerado concluído quando todas as caixas do checklist forem atendidas, cada fase tiver uma validação documentada, as economias continuarem separadas, o jogo permanecer jogável em tela vertical, as novas mecânicas forem perceptíveis durante uma run real e os testes confirmarem que as mudanças não quebraram o fluxo existente.

A prioridade é entregar sistemas que interajam entre si: tropas devem interagir com habilidades, relíquias e formações; quartéis devem influenciar posicionamento; inimigos devem exigir counters; Bosses devem testar essas respostas; eventos devem criar risco e recompensa; e a progressão do Acampamento deve ampliar as opções estratégicas sem transformar a vitória em automática.
