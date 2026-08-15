# Plano de assets visuais — Kardec Farmer Idle TD

## Direção artística

A nova identidade visual seguirá uma linguagem de **pixel-art premium de tower defense agrícola**, com silhuetas limpas, contorno escuro de 1–2 px, iluminação quente de fim de tarde e paleta baseada em terra, verde-folha, trigo dourado, azul de água e vermelho de ameaça. O mapa deve transmitir uma fazenda circular protegida por um núcleo de cultivo, com caminhos radiais claramente legíveis por baixo das unidades.

A câmera e a leitura permanecem ortográficas e frontais, porque os sprites são renderizados em tamanhos reduzidos sobre um mapa SVG. Todos os personagens terão fundo verdadeiramente transparente, sombra mínima integrada ao sprite apenas quando útil e pose lateral/3⁄4 consistente. O chefe terá uma escala visual e contraste superiores ao inimigo comum; os guardas terão cores de função estáveis: azul para guerreiro, verde para arqueiro e cinza-metal para tanque.

## Manifesto de substituição

| Categoria | Arquivo-alvo | Função | Requisitos visuais |
|---|---|---|---|
| Cenário | `assets/images/farm-background.png` | Fundo da Home e base visual do mapa | Fazenda circular vista de cima, caminhos radiais, plantação central, sem texto, área segura para sobreposição da UI |
| Guarda | `assets/images/guard-warrior.png` | Unidade corpo a corpo | Guerreiro fazendeiro medieval azul/dourado, silhueta compacta, transparente |
| Guarda | `assets/images/guard-archer.png` | Unidade de longo alcance | Arqueira/arqueiro rural verde, arco visível, transparente |
| Guarda | `assets/images/guard-tank.png` | Unidade resistente | Guardião agrícola com armadura cinza e escudo, silhueta larga, transparente |
| Inimigo | `assets/images/enemy-normal.png` | Inimigo de onda comum | Criatura de praga vermelha/terrosa, ameaçadora mas legível em 30 px, transparente |
| Inimigo | `assets/images/enemy-boss.png` | Chefe de cada 5 waves | Monstro de praga grande, chifres/coroa de espinhos, vermelho/dourado, transparente |
| Marca | `assets/images/logo-kardec-farmer.png` | Logo da Home e branding | Emblema trigo + defesa agrícola, sem depender de tipografia gerada, fundo transparente |
| App icon | `assets/images/icon.png` | Ícone principal do Expo | Símbolo central simples derivado do trigo e do núcleo da plantação, fundo verde escuro, alta legibilidade em 512 px |
| Android | `assets/images/android-icon-foreground.png` | Foreground adaptativo | Mesmo símbolo central, margem segura para máscara Android, transparente |
| Android | `assets/images/android-icon-background.png` | Background adaptativo | Textura/padrão verde-terra sem detalhes frágeis |
| Android | `assets/images/android-icon-monochrome.png` | Ícone monocromático | Marca de trigo/torre em branco sólido, transparente |
| Web | `assets/images/favicon.png` | Favicon | Símbolo central simplificado, alto contraste, sem texto pequeno |
| Splash | `assets/images/splash-icon.png` | Splash screen | Marca central com leitura imediata sobre fundo claro/escuro |
| UI | `components/game/GameIcon.tsx` (`wave`) | HUD da wave | Estandarte de onda em SVG, escalável e sem emoji |
| UI | `components/game/GameIcon.tsx` (`health`) | Vida da plantação | Regador + broto em SVG, escalável e sem emoji |
| UI | `components/game/GameIcon.tsx` (`coin`) | Moedas | Moeda de trigo em SVG, escalável e sem emoji |
| UI | `components/game/GameIcon.tsx` (`range`) | Alcance da carta | Alvo/retícula agrícola em SVG, escalável |
| UI | `components/game/GameIcon.tsx` (`damage`) | Dano da carta | Foice em SVG, escalável |
| UI | `components/game/GameIcon.tsx` (`speed`) | Velocidade da carta | Raio em SVG, escalável |

## Integração prevista

`GameMap.tsx` usa os cinco sprites de unidade atualizados. O cenário é integrado como camada visual de fundo, mantendo os caminhos e os elementos interativos no SVG para não alterar as regras do jogo. `HomeScreen.tsx` usa o logo gerado e o cenário agrícola, substituindo o emoji de trigo. `GameHUD.tsx` e `CardBar.tsx` usam os seis ícones de UI do componente `GameIcon.tsx` no lugar dos emojis, mantendo textos, números e estados funcionais. `app.config.ts` aponta o branding principal, adaptativo, favicon e splash para os arquivos renovados.

Os arquivos explícitos do template React/Expo — `react-logo.png`, `react-logo@2x.png`, `react-logo@3x.png` e `partial-react-logo.png` — foram removidos após a confirmação de que não existem referências ativas. O mapa também deixou de depender de emojis para a plantação, água e indicadores centrais, mantendo texto acessível para a vida da plantação.

## Critérios de aceitação

A composição deve continuar reconhecível em tela pequena, sem halos de fundo ou sprites cortados. O logo deve funcionar como símbolo sem texto microscópico. As cartas devem manter legibilidade de nome, custo e estatísticas; os novos ícones serão decorativos e terão `accessibilityLabel`/texto adjacente preservado quando aplicável. O projeto precisa continuar passando no type-check e não pode manter referências aos assets do React.
