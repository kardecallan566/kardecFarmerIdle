# 🌾 Kardec Farmer Idle TD

Um jogo mobile **Tower Defense** com elementos **Roguelike** desenvolvido em **React Native** com **Expo**. Proteja sua plantação de inimigos cada vez mais fortes, coloque guardas estrategicamente e melhore suas habilidades entre as ondas!

## 🎮 Características Principais

### 🗺️ Mecânica de Jogo

- **Mapa Circular**: Farol no centro, oito quartéis em anel e oito rotas radiais invisíveis convergindo para o centro
- **Sistema de Waves**: Ondas progressivas de inimigos com dificuldade crescente
- **Boss Waves**: A cada 5 ondas, um Boss especial aparece com habilidades únicas
- **Movimento Radial**: Inimigos seguem os caminhos até atingir a plantação central

### 🛡️ Guardas (Towers)

Três tipos de guardas com características únicas:

| Guarda | Vida | Dano | Alcance | Suprimentos | Descrição |
|--------|------|------|---------|-------|-----------|
| **Guerreiro** | 50 | 15 | 32 | 100 suprimentos | Linha de frente corpo a corpo |
| **Arqueiro** | 30 | 10 | 160 | 120 suprimentos | Longo alcance, preciso |
| **Tanque** | 100 | 8 | 70 | 150 suprimentos | Resistente, absorve dano |

### 👹 Inimigos

- **Inimigos Normais**: Progressão de dificuldade a cada onda
- **Boss**: Aparece a cada 5 ondas com:
  - 5x mais vida que inimigos normais
  - Velocidade temporária aumentada
  - Gera minions ao sofrer dano

### 🎁 Sistema Roguelike

Após cada **Boss Wave**, escolha **1 entre 3 melhorias aleatórias** no Intervalo Tático:

- **Dano +**: Aumenta dano de todos os guardas
- **Alcance +**: Aumenta alcance de todos os guardas
- **Custo -**: Reduz custo de colocar novos guardas
- **Suprimentos +**: Aumenta o ganho de suprimentos temporários durante a defesa
- **Vida +**: Aumenta vida máxima da plantação

### 💰 Sistema de Duas Economias

O jogo mantém duas moedas independentes, com saldos e usos diferentes:

- **Ouro do Acampamento (`bankGold`)**: persiste entre partidas e é usado exclusivamente para desbloquear tropas, treinar classes, melhorar o farol, abrir quartéis e evoluir a colheita ociosa.
- **Suprimentos de combate (`combatCoins`)**: nascem durante a wave, aumentam por passagem de tempo e inimigos derrotados, e são usados exclusivamente para comprar tropas na arena atual. Esse saldo é reiniciado ao iniciar uma nova defesa e nunca é convertido diretamente em ouro do Acampamento.
- A seleção de uma carta não cobra nada; o custo é descontado uma única vez quando a tropa é confirmada em um quartel.
- Relíquias de `+50% Suprimentos` afetam apenas os ganhos temporários da defesa.
- A recompensa de fim de run é calculada pelo desempenho, não pelo saldo de suprimentos restante.

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
   - `SUPRIMENTOS` aparecem no canto superior direito da arena e pagam as tropas da wave
   - `OURO DO ACAMPAMENTO` aparece no Acampamento e paga upgrades persistentes
   - Cada guarda custa uma quantidade diferente de suprimentos
   - Derrote inimigos para ganhar suprimentos temporários

3. **Melhorias**:
   - Após cada Boss Wave, escolha 1 entre 3 melhorias no Intervalo Tático
   - Melhorias são cumulativas e afetam guardas existentes

4. **Game Over**:
   - Quando a plantação atinge 0 de vida, o jogo termina
   - Veja suas estatísticas finais
   - Reinicie para tentar novamente

## 📊 HUD (Interface)

- **Wave**: Número da onda atual
- **Inimigos**: Quantidade de inimigos restantes
- **Plantação**: Vida atual / Vida máxima
- **Suprimentos**: Saldo temporário usado para comprar tropas na wave
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

# Inicie o servidor de desenvolvimento nativo
pnpm dev

# Android com Expo Go
pnpm android

# Se a rede local não funcionar, use o túnel
pnpm android:tunnel
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
- **Gestão de Suprimentos**: Maximize o ganho temporário para colocar as tropas certas em cada wave

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
