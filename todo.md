# Kardec Farmer Idle TD - TODO

## Core Game Engine
- [x] Implementar sistema de mapa circular com caminhos radiais
- [x] Implementar sistema de waves e spawning de inimigos
- [x] Implementar pathfinding para inimigos (movimento radial)
- [x] Implementar sistema de colisão e ataque de guardas
- [x] Implementar sistema de vida da plantação
- [x] Implementar sistema de moedas e ganho passivo

## Guardas (Towers)
- [x] Implementar classe base de Guarda
- [x] Implementar Warrior (guerreiro equilibrado)
- [x] Implementar Archer (arqueiro longo alcance)
- [x] Implementar Tank (tanque resistente)
- [x] Implementar sistema de drag-and-drop para colocar guardas
- [x] Implementar validação de posições válidas para guardas

## Inimigos (Enemies)
- [x] Implementar classe base de Inimigo
- [x] Implementar inimigos normais com progressão de dificuldade
- [x] Implementar Boss a cada 5 waves
- [x] Implementar habilidades de Boss (velocidade temporária, geração de pequenos inimigos)
- [x] Implementar morte de inimigos com drop de moedas

## Sistema de Cartas e Recarga
- [x] Implementar sistema de cartas de guardas
- [x] Implementar tempo de recarga (cooldown) de cartas
- [x] Implementar indicador visual de recarga
- [x] Implementar sistema de custo em moedas

## Sistema Roguelike
- [x] Implementar gerador de melhorias aleatórias
- [x] Implementar tela de seleção de melhorias após waves
- [x] Implementar aplicação de melhorias ao gameplay
- [x] Implementar tipos de melhorias: dano, alcance, custo, moedas, vida

## Interface (HUD)
- [x] Implementar barra de status (wave, inimigos, vida, moedas)
- [x] Implementar barra de cartas na parte inferior
- [x] Implementar indicadores visuais de recarga de cartas
- [x] Implementar feedback visual de ações do jogador

## Telas
- [x] Implementar Home Screen com botão de iniciar
- [x] Implementar Game Screen principal
- [x] Implementar Game Over Screen com estatísticas
- [x] Implementar Wave Rewards Screen

## Efeitos Visuais e Animações
- [x] Implementar animação de ataque de guardas
- [x] Implementar efeito de morte de inimigos
- [x] Implementar animação de moedas voando para o contador
- [x] Implementar feedback visual de dano à plantação
- [x] Implementar transições entre telas

## Áudio e Feedback
- [x] Implementar sons de ataque
- [x] Implementar sons de morte de inimigo
- [x] Implementar sons de ganho de moedas
- [x] Implementar haptic feedback em ações principais

## Polimento e Otimização
- [x] Otimizar renderização do mapa e inimigos
- [x] Otimizar cálculos de pathfinding
- [x] Implementar pausa do jogo (opcional)
- [x] Testar performance em diferentes dispositivos
- [x] Ajustar balanço de dificuldade

## Persistência
- [x] Implementar salvamento de melhor wave
- [x] Implementar salvamento de estatísticas globais
- [x] Implementar carregamento de dados ao iniciar

## Testes
- [x] Testar fluxo completo de uma partida
- [x] Testar sistema de guardas e ataques
- [x] Testar sistema de waves e Boss
- [x] Testar melhorias roguelike
- [x] Testar Game Over e reinício
