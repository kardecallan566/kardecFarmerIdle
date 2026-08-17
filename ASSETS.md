# Manifesto de assets visuais — Kardec Farmer Idle TD

## Direção artística

A identidade visual do jogo usa **pixel-art premium de tower defense agrícola**, com silhuetas legíveis em tamanhos reduzidos, contorno escuro, iluminação quente de fim de tarde e paleta de terra, verde de bosque, trigo dourado, água azul e ameaça vermelha/roxa. A arena é vertical e responsiva: um bosque com pequena vila, riachos e clareira protege o farol central, enquanto os oito quartéis ficam organizados em duas colunas.

Os sprites de unidades e monstros têm fundo verdadeiramente transparente, pose lateral ou em três quartos e leitura consistente sobre o mapa. A rota de inimigos continua existindo na lógica de movimentação, mas sua faixa visual é coberta pelo bosque para reduzir ruído e deixar o farol, os quartéis e as tropas como foco da defesa.

## Manifesto de assets finais

| Categoria | Arquivo(s) | Função | Requisitos atendidos |
|---|---|---|---|
| Cenário | `assets/images/forest-village-background.png` | Fundo da Home e da arena | Bosque, pequena vila, riachos e clareira central; composição segura para HUD e sprites |
| Foreground | `assets/images/forest-lane-foreground-transparent.png` | Camada acima da pista | Vegetação, cercas e lanternas nas bordas; corredor central totalmente transparente |
| Quartel | `assets/images/village-barracks.png` | Espaço livre de defesa | Quartel rural de madeira/pedra, alpha real, leitura clara em 56 px e sem texto embutido |
| Guarda base | `guard-warrior.png`, `guard-archer.png`, `guard-tank.png` | Fallback e tier inicial das tropas | Silhuetas de função clara, paleta distinta e uso compatível com Expo/SVG |
| Guarda veterano | `guard-warrior-veteran-transparent.png`, `guard-archer-veteran-transparent.png`, `guard-tank-veteran-transparent.png` | Tier persistente após evolução | Alpha limpo, cores de armadura reforçadas e leitura em cards/mapa |
| Guarda elite | `guard-warrior-elite-transparent.png`, `guard-tank-elite-transparent.png` | Evolução avançada | Visual mais intenso e contraste maior; o Arqueiro Elite usa fallback Veterano até existir uma arte dedicada |
| Guarda lendário | `guard-warrior-legendary-transparent.png`, `guard-archer-legendary-transparent.png`, `guard-tank-legendary-transparent.png` | Tier máximo atual | Silhueta premium, cores evolutivas e transparência real |
| Monstro comum | `enemy-normal.png` | Inimigo padrão das waves | Leitura rápida em tamanho pequeno e compatibilidade com a skin Wild |
| Corredor | `enemy-runner-terror-transparent.png` | Classe veloz | Sprite transparente e identidade visual própria |
| Bruto | `enemy-brute-terror-transparent.png` | Classe resistente | Sprite transparente, massa visual maior e identidade própria |
| Curandeiro | `enemy-healer-terror-transparent.png` | Classe de suporte | Sprite transparente e identidade própria |
| Boss antigo | `enemy-boss.png`, `enemy-boss-ancient-transparent.png` | Bosses de eras intermediárias | Escala superior, cor laranja/antiga e transparência no tier específico |
| Boss apocalipse | `enemy-boss-apocalypse-transparent.png` | Bosses de eras avançadas | Paleta roxa, atmosfera aterrorizante e transparência real |
| Marca | `assets/images/logo-kardec-farmer.png` | Logo da Home e branding | Emblema de trigo + defesa agrícola, sem depender de tipografia gerada |
| App icon | `assets/images/icon.png` | Ícone principal do Expo | Símbolo central simples, alto contraste e fundo verde escuro |
| Android | `android-icon-foreground.png`, `android-icon-background.png`, `android-icon-monochrome.png` | Ícones adaptativos | Margem segura, padrão verde-terra e versão monocromática |
| Web | `favicon.png` | Favicon | Símbolo simplificado e legível em tamanho pequeno |
| Splash | `splash-icon.png` | Splash screen | Marca central com leitura imediata |
| UI | `components/game/GameIcon.tsx` | Ícones de wave, vida, moedas e stats | SVG escalável, sem emojis e com texto adjacente preservado |

## Integração atual

`components/game/GameMap.tsx` seleciona sprites de tropa por tier e classe, sprites de monstros por arquétipo e sprites de boss por era. Os espaços livres são renderizados com `village-barracks.png`, enquanto `forest-lane-foreground-transparent.png` entra depois da faixa lógica da pista e antes das unidades, deixando a vegetação em primeiro plano sem cobrir a rota central. `components/game/CardBar.tsx` e `components/game/ProgressionMenu.tsx` usam os mesmos retratos transparentes para manter consistência entre arena e acampamento. `lib/game/types.ts` calcula `skinTier` e `bossEra`, e `lib/game/useGameLoop.ts` transfere esses valores para cada inimigo gerado; os minions de boss herdam a era e a skin do chefe.

As waves múltiplas de cinco recebem a classe visual de boss, escala maior de arena e banner discreto de era. O Intervalo Tático é exibido apenas depois dessas waves. O farol SVG central continua sendo a estrutura protegida e a origem das tropas, sem causar dano aos monstros.

Os arquivos de processo, cópias `_original`, previews e versões intermediárias `-clean`/`-alpha` foram removidos. Os arquivos explícitos do template React/Expo (`react-logo.png`, `react-logo@2x.png`, `react-logo@3x.png` e `partial-react-logo.png`) também permanecem fora do fluxo ativo.

## Critérios de aceitação

A composição deve continuar reconhecível em tela vertical pequena, sem halos brancos, fundos embutidos ou sprites cortados. Os quartéis devem substituir visualmente os pátios vazios e o foreground deve cobrir as bordas das pistas sem bloquear o corredor central. A evolução precisa ser visível nas cartas, no Acampamento e na arena. Os monstros devem manter classes e skins distintas conforme a wave, enquanto o caminho lógico permanece funcional mesmo oculto visualmente. A simulação usa passo de 16 ms e as animações visuais são sincronizadas ao requestAnimationFrame, permitindo renderização próxima de 60 FPS e acompanhando telas de maior frequência quando disponíveis. O projeto deve passar no type-check e carregar os assets finais no export web.
