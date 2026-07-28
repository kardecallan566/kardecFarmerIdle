# 🌾 Kardec Farmer Idle TD

Um jogo mobile **Tower Defense** com elementos **Roguelike** desenvolvido em **React Native** com **Expo**. Proteja sua plantação de inimigos cada vez mais fortes, coloque guardas estrategicamente e melhore suas habilidades entre as ondas!

## 🎮 Características Principais

### 🗺️ Mecânica de Jogo

- **Mapa Circular**: Plantação no centro com 4 caminhos radiais convergindo para o centro
- **Sistema de Waves**: Ondas progressivas de inimigos com dificuldade crescente
- **Boss Waves**: A cada 5 ondas, um Boss especial aparece com habilidades únicas
- **Movimento Radial**: Inimigos seguem os caminhos até atingir a plantação central

### 🛡️ Guardas (Towers)

Três tipos de guardas com características únicas:

| Guarda | Vida | Dano | Alcance | Custo | Descrição |
|--------|------|------|---------|-------|-----------|
| **Guerreiro** | 50 | 15 | 80 | 100 moedas | Equilibrado, ataque rápido |
| **Arqueiro** | 30 | 10 | 150 | 120 moedas | Longo alcance, preciso |
| **Tanque** | 100 | 5 | 60 | 150 moedas | Resistente, absorve dano |

### 👹 Inimigos

- **Inimigos Normais**: Progressão de dificuldade a cada onda
- **Boss**: Aparece a cada 5 ondas com:
  - 5x mais vida que inimigos normais
  - Velocidade temporária aumentada
  - Gera minions ao sofrer dano

### 🎁 Sistema Roguelike

Após cada onda, escolha **1 entre 3 melhorias aleatórias**:

- **Dano +**: Aumenta dano de todos os guardas
- **Alcance +**: Aumenta alcance de todos os guardas
- **Custo -**: Reduz custo de colocar novos guardas
- **Moedas +**: Aumenta ganho de moedas por inimigo derrotado
- **Vida +**: Aumenta vida máxima da plantação

### 💰 Sistema de Moedas

- Ganhe moedas derrotando inimigos
- Ganho passivo entre ondas
- Use moedas para colocar novos guardas
- Animação visual de coleta de moedas

### 🎨 Animações e Efeitos

- **Animações de Ataque**: Projéteis visuais dos guardas aos inimigos
- **Animações de Morte**: Partículas explosivas quando inimigos morrem
- **Animações de Moedas**: Moedas voam para o contador com easing suave
- **Barras de Vida**: Indicadores visuais de saúde para guardas e inimigos
- **Efeito de Pulso**: Plantação pulsa para indicar importância

## 🚀 Como Jogar

### Objetivo
Proteja sua plantação do máximo de ondas possível. Cada onda que passa aumenta a dificuldade!

### Controles

1. **Colocar Guardas**: 
   - Toque em uma carta de guarda na barra inferior
   - Toque no mapa para colocar o guarda
   - Válido apenas fora da plantação e dentro do mapa

2. **Gerenciar Recursos**:
   - Moedas aparecem no canto superior direito
   - Cada guarda custa moedas diferentes
   - Ganhe moedas derrotando inimigos

3. **Melhorias**:
   - Após cada onda, escolha 1 entre 3 melhorias
   - Melhorias são cumulativas e afetam guardas existentes

4. **Game Over**:
   - Quando a plantação atinge 0 de vida, o jogo termina
   - Veja suas estatísticas finais
   - Reinicie para tentar novamente

## 📊 HUD (Interface)

- **Wave**: Número da onda atual
- **Inimigos**: Quantidade de inimigos restantes
- **Plantação**: Vida atual / Vida máxima
- **Moedas**: Quantidade de moedas disponíveis
- **Cartas**: Barra de guardas com indicador de cooldown

## 🛠️ Tecnologia

- **Framework**: React Native com Expo SDK 54
- **Linguagem**: TypeScript
- **Styling**: NativeWind (Tailwind CSS)
- **Animações**: React Native Reanimated 4.x
- **Persistência**: AsyncStorage para salvar melhor wave

## 📦 Instalação

### Pré-requisitos
- Node.js 18+
- pnpm ou npm
- Expo CLI

### Passos

```bash
# Clone o repositório
git clone https://github.com/kardecallan566/kardecFarmerIdle.git
cd kardecFarmerIdle

# Instale as dependências
pnpm install

# Inicie o servidor de desenvolvimento
pnpm dev

# No Expo Go (iOS/Android)
# Escaneie o código QR ou use: exps://8081-...
```

## 🎯 Estratégia de Jogo

### Dicas Iniciais

1. **Comece com Guerreiros**: Bom custo-benefício no início
2. **Posicione Estrategicamente**: Use o alcance dos arqueiros para cobrir áreas
3. **Diversifique**: Combine diferentes tipos de guardas
4. **Melhore Constantemente**: Escolha melhorias que complementem sua estratégia

### Estratégias Avançadas

- **Defesa em Camadas**: Coloque guardas em múltiplas linhas
- **Foco em Alcance**: Arqueiros com alcance máximo cobrem mais área
- **Tanques Defensivos**: Use tanques para absorver dano de Bosses
- **Farming de Moedas**: Maximize ganho de moedas para colocar mais guardas

## 📱 Compatibilidade

- **iOS**: 13.0+
- **Android**: 5.0+ (API 21)
- **Web**: Suporte experimental

## 🐛 Problemas Conhecidos

- Animações podem ter lag em dispositivos antigos
- Alguns efeitos de sombra podem não renderizar corretamente em web

## 🔄 Atualizações Futuras

- [ ] Sistema de sons e efeitos sonoros
- [ ] Novos tipos de guardas especiais
- [ ] Sistema de achievements
- [ ] Leaderboard online
- [ ] Modo infinito com dificuldade extrema
- [ ] Temas visuais alternativos

## 📄 Licença

Este projeto é de código aberto. Sinta-se livre para usar, modificar e distribuir.

## 👤 Autor

Desenvolvido por **Kardec** com ❤️

## 🤝 Contribuições

Contribuições são bem-vindas! Sinta-se livre para abrir issues ou pull requests.

---

**Divirta-se jogando Kardec Farmer Idle TD!** 🌾🛡️👹
