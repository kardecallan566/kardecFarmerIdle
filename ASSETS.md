# Manifesto de assets visuais — Kardec Farmer Idle TD

## Direção artística

A identidade visual do jogo usa **pixel-art premium de tower defense agrícola**, com silhuetas legíveis em tamanhos reduzidos, contorno escuro, iluminação quente de fim de tarde e paleta de terra, verde de bosque, trigo dourado, água azul e ameaça vermelha/roxa. A arena é vertical e responsiva: um bosque com pequena vila, riachos e clareira protege o farol central, enquanto os oito quartéis ficam organizados em um anel circular ao redor do farol.

Os sprites de unidades e monstros têm fundo verdadeiramente transparente, pose lateral ou em três quartos e leitura consistente sobre o mapa. A rota de inimigos continua existindo na lógica de movimentação em oito direções radiais, mas sua faixa visual é coberta pelo bosque para reduzir ruído e deixar o farol, os quartéis e as tropas como foco da defesa.

## Manifesto de assets finais

| Categoria | Arquivo(s) | Função | Requisitos atendidos |
|---|---|---|---|
| Cenário | `assets/images/forest-village-background.png` | Fundo da Home e da arena | Bosque, pequena vila, riachos e clareira central; composição segura para HUD e sprites |
| Foreground | `assets/images/forest-lane-foreground-transparent.png` | Camada acima da pista | Vegetação, cercas e lanternas nas bordas; corredor central totalmente transparente |
| Quartel | `assets/images/village-barracks.png` | Espaço livre de defesa | Quartel rural de madeira/pedra, alpha real, leitura clara em 56 px e sem texto embutido |
| Guarda base | `guard-warrior.png`, `guard-archer.png`, `guard-tank.png` | Fallback e tier inicial das tropas | Silhuetas de função clara, paleta distinta e uso compatível com Expo/SVG |
| Guarda veterano | `guard-warrior-veteran-transparent.png`, `guard-archer-veteran-transparent.png`, `guard-tank-veteran-transparent.png` | Tier persistente após evolução | Alpha limpo, cores de armadura reforçadas e leitura em cards/mapa |
| Guarda elite | `guard-warrior-elite-transparent.png`, `guard-archer-elite-transparent.png`, `guard-tank-elite-transparent.png` | Evolução avançada | Visual mais intenso, armadura escura com detalhes dourados e transparência real nas três classes |
| Guarda lendário | `guard-warrior-legendary-transparent.png`, `guard-archer-legendary-transparent.png`, `guard-tank-legendary-transparent.png` | Tier máximo atual | Silhueta premium, cores evolutivas e transparência real |
| Monstro comum | `enemy-normal.png` | Inimigo padrão das waves | Leitura rápida em tamanho pequeno e compatibilidade com a skin Wild |
| Corredor | `enemy-runner-terror-transparent.png` | Classe veloz | Sprite transparente e identidade visual própria |
| Bruto | `enemy-brute-terror-transparent.png` | Classe resistente | Sprite transparente, massa visual maior e identidade própria |
| Curandeiro | `enemy-healer-terror-transparent.png` | Classe de suporte | Sprite transparente e identidade própria |
| Voador | `enemy-flyer-terror-transparent.png` | Classe aérea veloz | Sprite transparente, silhueta alada e counter de arqueiros |
| Demolidor | `enemy-demolisher-terror-transparent.png` | Classe de cerco | Sprite transparente, massa pesada e dano ampliado ao farol |
| Invocador | `enemy-summoner-terror-transparent.png` | Classe de suporte ofensivo | Sprite transparente, cajado violeta e geração periódica de corredores |
| Espectro | `enemy-wraith-terror-transparent.png` | Classe espectral | Sprite transparente, traversal incorpóreo e counter de tanques |
| Boss antigo | `enemy-boss.png`, `enemy-boss-ancient-transparent.png` | Bosses de eras intermediárias | Escala superior, cor laranja/antiga e transparência no tier específico |
| Boss apocalipse | `enemy-boss-apocalypse-transparent.png` | Bosses de eras avançadas | Paleta roxa, atmosfera aterrorizante e transparência real |
| Marca | `assets/images/logo-kardec-farmer.png` | Logo da Home e branding | Emblema de trigo + defesa agrícola, sem depender de tipografia gerada |
| App icon | `assets/images/icon.png` | Ícone principal do Expo | Símbolo central simples, alto contraste e fundo verde escuro |
| Android | `android-icon-foreground.png`, `android-icon-background.png`, `android-icon-monochrome.png` | Ícones adaptativos | Margem segura, padrão verde-terra e versão monocromática |
| Web | `favicon.png` | Favicon | Símbolo simplificado e legível em tamanho pequeno |
| Splash | `splash-icon.png` | Splash screen | Marca central com leitura imediata |
| UI | `components/game/GameIcon.tsx` | Ícones de wave, vida, moedas e stats | SVG escalável, sem emojis e com texto adjacente preservado |

## Integração atual

`components/game/GameMap.tsx` seleciona sprites de tropa por tier e classe, sprites de monstros por arquétipo — incluindo Voador, Demolidor, Invocador e Espectro — e sprites de boss por era. Os oito espaços livres são renderizados com `village-barracks.png` em anel ao redor do farol, enquanto `forest-lane-foreground-transparent.png` entra depois da faixa lógica da pista e antes das unidades, deixando a vegetação em primeiro plano sem cobrir a rota central. `components/game/CardBar.tsx` e `components/game/ProgressionMenu.tsx` usam os mesmos retratos transparentes para manter consistência entre arena e acampamento. `lib/game/types.ts` calcula `skinTier` e `bossEra`, e `lib/game/useGameLoop.ts` gera monstros fora da viewport em oito lanes radiais; quando uma tropa está posicionada à frente, o inimigo a persegue antes de retomar o farol. Os minions de boss herdam a era e a skin do chefe.

As waves múltiplas de cinco recebem a classe visual de boss, escala maior de arena e banner discreto de era. O Intervalo Tático é exibido apenas depois dessas waves. O farol SVG central continua sendo a estrutura protegida e a origem das tropas, sem causar dano aos monstros.

Os arquivos de processo, cópias `_original`, previews e versões intermediárias `-clean`/`-alpha` foram removidos. Os arquivos explícitos do template React/Expo (`react-logo.png`, `react-logo@2x.png`, `react-logo@3x.png` e `partial-react-logo.png`) também permanecem fora do fluxo ativo. `GameState.combatCoins` representa suprimentos temporários da wave; `bankGold` continua sendo o ouro persistente usado exclusivamente no Acampamento.

## Critérios de aceitação

A composição deve continuar reconhecível em tela vertical pequena, sem halos brancos, fundos embutidos ou sprites cortados. Os quartéis devem substituir visualmente os pátios vazios e formar um anel legível ao redor do farol. Nenhum círculo de alcance, aura ou indicador de alvo deve aparecer em torno de tropas ou monstros; apenas o farol pode usar pulsos circulares próprios. O foreground deve cobrir as bordas das pistas sem bloquear o corredor central. A evolução precisa ser visível nas cartas, no Acampamento e na arena. Os monstros devem nascer fora da tela, avançar pelas oito rotas radiais e priorizar tropas posicionadas no caminho antes de atingir o farol. `combatCoins` deve pagar apenas tropas da wave, enquanto `bankGold` deve pagar apenas upgrades e desbloqueios do Acampamento. A simulação usa passo de 16 ms e as animações visuais são sincronizadas ao requestAnimationFrame, permitindo renderização próxima de 60 FPS e acompanhando telas de maior frequência quando disponíveis. O projeto deve passar no type-check e carregar os assets finais no export web.

## Ícones de economia

- `assets/images/currency-camp-gold.png`: ícone dourado com farol e trigo para o **Ouro do Acampamento**, usado em upgrades, desbloqueios, colheita ociosa, Home e recompensas de Game Over.
- `assets/images/currency-combat-supplies.png`: estojo teal com trigo e ferramentas para **Suprimentos de Combate**, usado na HUD da arena, nos custos das cartas e na explicação da economia temporária.

Os dois arquivos são sprites PNG RGBA com fundo transparente e silhuetas intencionalmente diferentes para evitar confusão em telas pequenas.
