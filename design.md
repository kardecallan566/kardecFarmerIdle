# Kardec Farmer Idle TD - Design Document

## Screen List

1. **Home Screen** - Menu principal com botão para iniciar jogo
2. **Game Screen** - Tela principal do jogo com mapa circular, HUD e cartas
3. **Game Over Screen** - Tela de derrota com estatísticas e botão de reiniciar
4. **Wave Rewards Screen** - Tela de seleção de melhorias roguelike após cada wave

## Primary Content and Functionality

### Home Screen
- Título do jogo "Kardec Farmer Idle TD"
- Botão grande "Iniciar Jogo"
- Exibição de melhor wave alcançada (se houver)
- Background com tema agrícola

### Game Screen (Main Gameplay)
**Layout:**
- **Top HUD (Status Bar)**
  - Wave atual (ex: "Wave 5/∞")
  - Inimigos restantes (ex: "12/20")
  - Vida da plantação (barra com ícone)
  - Moedas disponíveis (ex: "💰 250")

- **Center Area (Game Map)**
  - Mapa circular com plantação no centro
  - Caminhos radiais (4-6 caminhos) levando até a plantação
  - Inimigos movimentando-se pelos caminhos
  - Guardas posicionados próximos aos caminhos
  - Efeitos visuais de ataques

- **Bottom Area (Card Bar)**
  - 3 cartas de guardas disponíveis
  - Cada carta mostra: ícone, nome, custo em moedas, tempo de recarga
  - Cartas indisponíveis aparecem escurecidas
  - Drag-and-drop para posicionar guardas

### Game Over Screen
- Título "Game Over"
- Estatísticas:
  - Wave alcançada
  - Total de inimigos derrotados
  - Moedas coletadas
  - Melhor wave anterior (se houver)
- Botão "Reiniciar Jogo"

### Wave Rewards Screen
- Título "Escolha uma Melhoria"
- 3 cartas de melhoria aleatórias com descrição
- Cada melhoria mostra efeito (ex: "+20% Dano", "+1 Alcance")
- Seleção por toque

## Key User Flows

### Flow 1: Iniciar Jogo
1. Home Screen → Toque em "Iniciar Jogo"
2. Game Screen inicia com Wave 1
3. Primeiros inimigos aparecem

### Flow 2: Colocar Guarda
1. Toque em carta de guarda
2. Mapa entra em modo de seleção
3. Toque em posição válida próxima aos caminhos
4. Guarda é colocado, carta entra em recarga

### Flow 3: Completar Wave
1. Todos os inimigos da wave são derrotados
2. Pausa curta (3 segundos)
3. Wave Rewards Screen aparece
4. Jogador seleciona uma melhoria
5. Próxima wave inicia automaticamente

### Flow 4: Game Over
1. Plantação perde toda sua vida
2. Game Over Screen aparece com estatísticas
3. Toque em "Reiniciar" volta para Home Screen

## Color Choices

| Elemento | Cor | Uso |
|----------|-----|-----|
| **Primary** | #2D5016 (Verde Escuro) | Botões principais, acentos |
| **Background** | #F5E6D3 (Bege Claro) | Fundo geral |
| **Surface** | #FFFFFF (Branco) | Cards, superfícies elevadas |
| **Foreground** | #1A1A1A (Quase Preto) | Texto principal |
| **Muted** | #8B7355 (Marrom) | Texto secundário |
| **Success** | #4CAF50 (Verde) | Ganhos, vida |
| **Warning** | #FF9800 (Laranja) | Alertas, dano |
| **Error** | #F44336 (Vermelho) | Perda de vida |
| **Plantação** | #FFD700 (Ouro) | Elemento central a proteger |
| **Inimigo** | #8B0000 (Vermelho Escuro) | Inimigos |
| **Guarda Warrior** | #4169E1 (Azul Real) | Guerreiro |
| **Guarda Archer** | #32CD32 (Verde Lima) | Arqueiro |
| **Guarda Tank** | #A9A9A9 (Cinza) | Tanque |

## Game Mechanics

### Guardas
- **Warrior (Guerreiro)**: Equilibrado - Dano médio, alcance médio, velocidade média
- **Archer (Arqueiro)**: Longo alcance - Dano baixo, alcance alto, velocidade rápida
- **Tank (Tanque)**: Resistente - Dano baixo, alcance baixo, vida alta

### Inimigos
- Surgem nas extremidades do mapa
- Seguem o caminho radial mais próximo
- Aumentam em quantidade, velocidade e vida a cada wave
- Concedem moedas ao morrer

### Waves
- Cada wave aumenta dificuldade progressivamente
- A cada 5 waves, surge um Boss
- Entre waves: 3 segundos de pausa + seleção de melhoria

### Moedas
- Ganhas ao derrotar inimigos
- Ganhas passivamente ao longo do tempo
- Usadas para invocar guardas
- Multiplicadas por melhorias roguelike

### Melhorias Roguelike
- Escolha 1 de 3 opções aleatórias após cada wave
- Exemplos: +20% Dano, +1 Alcance, -20% Custo, +50% Moedas, +1 Vida Plantação
- Acumulam-se ao longo da partida
