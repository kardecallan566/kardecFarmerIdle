# Expansão de progressão — Kardec Farmer Idle

## Objetivo

Adicionar uma camada de progressão contínua que combine ganhos idle fora da partida, um bestiário com recompensas de descoberta, novos arquétipos de monstros e evolução visual das tropas conforme o nível persistente aumenta.

## Sistemas planejados

| Sistema | Regra | Persistência |
|---|---|---|
| Ouro idle offline | O acampamento acumula gold enquanto o jogador está fora, limitado a 8 horas. A taxa começa em 2 gold/minuto e cresce com o upgrade de colheita idle. | `idleUpgradeLevel`, `lastOnlineAt` |
| Bestiário | Cada inimigo derrotado incrementa a espécie correspondente. Marcos de descoberta concedem bônus pontuais de gold e alimentam a tela de progresso. | `bestiaryDefeated` |
| Tiers visuais | Níveis 0–1 usam visual base; 2–3 veterano; 4–5 elite; 6+ lendário. Cada nível também muda a cor do brilho/insígnia, enquanto os thresholds trocam o sprite da armadura. | Derivado de `troopUpgradeLevels` |
| Novos inimigos | Corredor aparece a partir da wave 3; bruto a partir da wave 4; curandeiro a partir da wave 6. Bosses permanecem especiais nas waves múltiplas de 5. | Derivado da wave; contadores persistentes |
| Recompensa de espécie | Derrotar a primeira unidade de uma espécie dá um bônus pequeno de gold; completar marcos de 10/25/50 unidades dá recompensa maior. | Calculada pelo bestiário e salva |

## Arquitetura

`EnemyKind` será adicionado ao modelo `Enemy`, junto de parâmetros opcionais como `healingPower` e `abilityCooldown`. A função `getEnemyProfile(kind, wave)` centralizará vida, velocidade, dano à plantação, dano contra tropas, raio, cor e habilidade. A seleção da espécie será determinística em `getEnemyKindForSpawn(wave, spawnIndex)`, evitando spawns aleatórios difíceis de testar.

`getGuardVisualProfile(type, upgradeLevel)` retornará o sprite do tier, cor primária de armadura, cor de destaque, cor de aura e um índice de insígnia. O mapa, a barra de cartas e o Acampamento usarão a mesma função para impedir divergência visual entre telas. A regra de troca de sprite será compartilhada: base, veterano, elite e lendário.

A progressão idle será calculada apenas no carregamento do perfil. O estado manterá `idleGoldAvailable` como saldo transitório. `CLAIM_IDLE_GOLD` converte o saldo em `bankGold` e atualiza `lastOnlineAt`; upgrades do idle aumentam a taxa futura. Perfis antigos receberão defaults seguros sem apagar gold, tropas, níveis de farol ou melhor wave.

## Critérios de verificação

A validação deverá confirmar que: o gold offline aparece após recarregar; o claim atualiza a conta uma única vez; as três espécies novas aparecem em waves compatíveis; o curandeiro recupera vida de inimigos próximos sem ultrapassar `maxHealth`; o bestiário incrementa e recompensa somente a primeira descoberta/marcos; os sprites e cores mudam nos níveis 2, 4 e 6; e os valores de vida/dano continuam derivados do mesmo nível persistente.
