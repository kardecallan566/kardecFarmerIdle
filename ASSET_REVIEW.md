# Revisão visual inicial

## Observações confirmadas

- `assets/images/enemy-normal.png` é um sprite pixel-art 128×128 de um inimigo vermelho, com fundo claro embutido e leitura visual pequena.
- `assets/images/icon.png` já é um emblema customizado com trigo dourado, arqueiro azul, guerreiro verde e tanque cinza sobre fundo verde escuro; não é o logo padrão do React, mas precisa ser alinhado ao restante do jogo.
- O app usa `GameMap.tsx` na rota ativa. Os sprites de guardas e inimigos são usados como imagens SVG no mapa.
- A tela inicial ainda usa emoji de trigo, e o HUD/barra de cartas dependem de emoji, texto e blocos de cor em vez de ícones próprios.
- O inventário inclui resíduos explícitos do template: `react-logo.png`, `react-logo@2x.png`, `react-logo@3x.png` e `partial-react-logo.png`. Eles devem ser removidos se não houver referências legítimas.

## Direção provisória

Preservar o caráter de jogo tower-defense agrícola em pixel-art, com silhuetas legíveis em tamanho pequeno, paleta de terra/verde/trigo e acentos dourados/azuis. Os novos assets devem evitar fundos claros embutidos quando usados sobre o mapa e devem ter composição consistente entre guardas, inimigos, logo e ícones.

## Comparação adicional

- `enemy-boss.png` usa pixel-art de demônio vermelho/dourado com bastante detalhe e leitura forte de chefe, também em 128×128.
- `guard-warrior.png` usa pixel-art medieval azul/dourado com fundo preto/transparente aparente, visual mais detalhado e contraste alto.
- A família atual mistura fundos claros/escuros e estilos de recorte diferentes; a substituição deve normalizar transparência, escala aparente, contorno e paleta para evitar halos ou aparência de assets de fontes diferentes.

## Revisão dos assets finais

- O cenário final está coerente com o mapa circular: quatro setores agrícolas, canais azuis e área central livre para a plantação e as unidades interativas. A imagem funciona como camada de atmosfera sob os caminhos SVG.
- O logo final tem boa leitura, contraste e símbolo forte de trigo + defesa agrícola, mas a inspeção visual revelou um halo magenta/arroxeado residual na borda do recorte. Esse halo precisa ser removido antes de usá-lo como ícone, favicon e splash.

## Validação após limpeza

- O logo agora apresenta um contorno limpo, sem o halo magenta anterior, e mantém o símbolo de trigo, cultivo, ferramenta e escudo totalmente legível.
- O sprite do guerreiro mantém transparência, recorte limpo e uma silhueta forte em 512×512, adequada para ser reduzida nas cartas e no mapa sem perder a identidade azul/dourada.

## Verificação no navegador

O build exportado carregou a Home sem erro, exibindo o cenário agrícola e o novo emblema central. Ao iniciar a partida, o HUD mostrou wave, vida da plantação e moedas com a nova paleta escura; o mapa carregou o cenário circular, o núcleo central e os pontos de plantio; e a barra inferior exibiu os três retratos de guarda com os ícones vetoriais de estatísticas e custo. A estrutura de navegação e as interações principais permaneceram funcionais.

## Revalidação final

A exportação web final foi concluída com sucesso e a Home recarregada no navegador mostrou o cenário agrícola e o emblema renovado, sem erro de runtime visível. O erro anterior de SHA-1 do NativeWind foi resolvido ao deixar o CSS virtual do Metro habilitado.

## Verificação da segunda iteração

A partida abriu com o contador `1/1 inimigos`, confirmando que o estado das waves passou a refletir os spawns reais. A nova barra de tropas está horizontalmente rolável e os cartões permanecem legíveis. O mapa responsivo carregou, porém a composição ainda deixa uma faixa bege vazia entre o HUD e o mapa por causa do alinhamento vertical central; esse espaço será removido na próxima correção de layout.

## Verificação de movimento e efeitos

Na partida observada, a tropa foi vista avançando do canteiro até o corredor superior, enquanto partículas de morte, moedas e o cone de água do regador apareciam durante o ciclo. Isso confirma que o problema de tropas paradas foi corrigido. A recarga do build para testar o novo tamanho do mapa encontrou apenas o servidor temporário encerrado, sem indicar erro no bundle.

## Validação do layout ajustado

Após aumentar a área útil do mapa, a composição ficou mais preenchida verticalmente, com o regador, canteiros e faixa de tropas ocupando melhor a tela. O HUD permanece compacto, a barra inferior continua legível e o efeito de água no centro aparece como cone e pulsos. A validação final da caminhada da tropa segue sendo feita por observação temporal da partida.

## Validação do tower defense e modo vertical

A Home atualizada foi carregada com briefing da arena, primeira wave, quantidade de inimigos e próxima wave de chefe. Na partida, a HUD passou a exibir `WAVE 1`, `Próximo chefe: wave 5 (4 waves)`, inimigos ativos, inimigos gerados, barra de progresso, vida da plantação e moedas. A composição foi verificada em viewport vertical, com HUD em duas linhas, mapa central e barra de tropas na base.

## Verificação de tropas, estrada e regador

Na prévia final, a estrada passou a aparecer como uma faixa central escura com bordas, marcação tracejada e setas de direção. O regador ficou no centro da arena, com os quatro canteiros orbitando o núcleo e o cone de água alinhado ao eixo rotativo. A partida carregou com o HUD de wave e o primeiro inimigo sendo gerado no caminho central.

## Ajuste de regra do regador

O regador é exclusivamente uma estrutura central: ele gira, irriga os canteiros e aciona a geração das tropas, mas não causa dano aos monstros. O dano da batalha permanece restrito às tropas.

## Verificação do spawn e Game Over

Após a correção da transformação SVG, a Home carregou normalmente e a partida iniciou sem erro. O primeiro inimigo foi criado pela HUD e a estrada central ficou alinhada ao regador. A observação temporal continuará para confirmar o deslocamento pelo eixo e validar o novo feedback de dano antes da derrota.

## Verificação temporal do dano e percurso

A observação do build corrigido mostrou os inimigos alinhados na faixa central da estrada, avançando em direção ao regador. A vida da plantação caiu de 100 para 60 e depois para 20, com a barra da HUD mudando para estado crítico. Isso confirma que o dano acontece de forma progressiva e visível, sem derrota instantânea ou inimigos nascendo no canto superior direito.

## Validação de derrota e reinício

A partida foi observada até a plantação chegar a 0/100. A tela de Game Over exibiu o motivo, o regador sem vida e as estatísticas finais. Ao pressionar `Jogar Novamente`, o jogo retornou imediatamente para uma nova `Wave 1`, com plantação 100/100, moedas iniciais e contadores reiniciados.

## Verificação da meta-progressão e do Acampamento

A Home final mostrou o bloco de progresso contínuo, gold acumulado, wave máxima e acesso ao Acampamento do Farol. No Acampamento, o Guerreiro aparece disponível no nível 1, enquanto Arqueiro e Tanque aparecem bloqueados com custos de 180 e 360 gold. O novo fluxo também exibe o farol como núcleo protegido nas instruções.

## Verificação do farol e da arena

Na arena exportada, o antigo regador foi substituído por um farol SVG central com torre, lanterna dourada, brilho e feixe rotativo. O feixe ilumina os canteiros e a geração do Guerreiro permanece ativa. A barra inferior confirma que Arqueiro e Tanque estão bloqueados até o Acampamento, enquanto o Guerreiro exibe alcance reduzido para 32.

## Verificação do spawn unificado

No build final, a Wave 1 foi concluída com `5/5` inimigos gerados e a Wave 2 iniciou com `0/7` sem duplicar ou perder entidades. A arena manteve o farol central e os cards bloqueados de arqueiro/tanque, confirmando o ciclo de spawn único e os contadores coerentes.

## Verificação de persistência entre partidas

Foi semeado um perfil de teste no armazenamento web e a aplicação foi recarregada. A Home recuperou corretamente 600 gold, Wave máxima 4 e 2/3 tropas desbloqueadas, confirmando que a meta-progressão é lida fora da arena e não depende do estado temporário da run.

## Auditoria de botões do Game Over — validação intermediária

No build corrigido, o botão da Home abriu o Acampamento do Farol; o botão `Voltar ao menu principal` retornou à Home; `VOLTAR À ARENA` iniciou uma partida nova com Wave 1, 250 moedas e plantação 100/100. A árvore acessível do navegador reconheceu os controles corrigidos como `button`, incluindo as ações de treino, desbloqueio, arena e retorno.

## Reprodução natural da derrota

A partida de teste avançou até a Wave 5 e exibiu o aviso `PLANTAÇÃO ATINGIDA −20 VIDA`, reduzindo a plantação para 56/100. O loop continuou corretamente para a Wave 6, permitindo aguardar a tela de Game Over sem inserir um mecanismo de teste permanente.

## Validação direta do botão Jogar Novamente

Na tela real de Game Over (`Plantação: 0/100`), o botão `Jogar Novamente` respondeu ao toque e retornou para a arena na Wave 1, com plantação 100/100, 250 moedas, `0/5` inimigos gerados e sem estado residual da derrota.

## Estabilidade após reinício

Após usar `Jogar Novamente`, a segunda partida avançou normalmente da Wave 2 para a Wave 3, mantendo o loop, o HUD e o spawn ativos. Isso confirma que o reset não deixa a arena presa no estado de Game Over.

## Segunda reprodução até o chefe

A segunda partida permaneceu estável após o reinício e avançou até a Wave 5. O dano progressivo foi exibido na HUD e a plantação chegou a 56/100 durante a arena do chefe, sem travamento ou regressão de estado.

## Validação direta de Acampamento e Home no Game Over

Na segunda tela real de Game Over, `Abrir Acampamento` abriu o Acampamento do Farol com a recompensa da run e os controles de upgrades. Em seguida, `Voltar ao menu principal` retornou à Home, que voltou a exibir os botões `INICIAR DEFESA` e `ACAMPAMENTO DO FAROL` funcionando.

## Expansão do farol e novo cenário

O build atualizado carregou o novo cenário de bosque com pequena vila, riachos, casas e clareira central. O Acampamento passou a exibir `Feixe mais veloz`, `Pulso duplo` e `Pátios da vila`; após comprar velocidade e um pátio, a arena mostrou `Pulso 1x • 5/8 pátios`, oito posições visuais com bloqueios e a `LINHA DE DEFESA` ao redor do farol.

## Persistência e multi-geração

Um perfil de teste com upgrades persistidos foi recarregado sem perda. A arena exibiu `Pulso 3x • 8/8 pátios`; os cards mostraram Guerreiro `Vida 68 • Dano 20`, Arqueiro `Vida 37 • Dano 15` e Tanque `Vida 124 • Dano 10`. O farol percorreu a arena e uma tropa foi vista avançando pela estrada sem ocupar o centro.

## Confirmação objetiva do pulso múltiplo

Com `multiSpawn: 2`, a arena exibiu `Pulso 3x`. A inspeção dos elementos SVG encontrou o sprite do Guerreiro no plot e mais três sprites de Guerreiro gerados em posições distintas, confirmando que a melhoria gera múltiplas tropas de fato.

## Pressão de combate contra tropas

Com upgrades do farol e tropas fortalecidas, a run avançou até a Wave 6 e terminou em Game Over com apenas duas guardas colocadas. Isso confirma que o dano direto contra tropas está ativo e que inimigos de waves avançadas conseguem eliminar unidades, em vez de apenas causar dano visual à plantação.

## Expansão de progressão idle e tiers visuais — validação

- A Home no build web exibiu o saldo de gold ocioso, a taxa por minuto e o contador de espécies descobertas do bestiário.
- O Acampamento exibiu as seções Colheita Ociosa, Bestiário do Bosque e previews de Guerreiro, Arqueiro e Tanque com tier Veterano e cores de armadura bronze/verde.
- O perfil persistido de teste carregou corretamente os níveis do farol, os três tipos de tropa e os valores derivados de vida/dano.
- A geração de novos sprites de monstros atingiu o limite diário de imagens; os novos arquétipos usam a arte-base existente com diferenciação visual SVG por cor, escala, anel e etiqueta, mantendo a implementação jogável.

## Validação da arena com tiers e novos arquétipos

A arena carregou em viewport vertical com `Pulso 3x • 8/8 pátios`, três cards mostrando Guerreiro/Arqueiro/Tanque no tier Veterano e seus stats derivados. A Wave 1 foi concluída com `5/5` inimigos gerados e a plantação permaneceu em `100/100`, confirmando que a integração dos novos campos não quebrou o loop.

## Verificação de espécies por wave

A observação temporal confirmou o `COR` na Wave 3, correspondente ao novo Corredor, e o `BRU` na Wave 4, correspondente ao novo Bruto. A HUD manteve os contadores de spawn, o farol 3x e a plantação sem regressão durante a transição.

## Validação do gold idle e do bestiário persistente

Após simular uma hora offline e recarregar o build, a Home exibiu `+3 gold ocioso` na taxa atual e recuperou `2/5 espécies descobertas` do armazenamento. Isso confirma que o cálculo é feito no carregamento e que os dados do bestiário sobrevivem à navegação entre sessões.

## Resgate do gold idle

No Acampamento, o perfil exibiu `+3 GOLD OCIOSO`. Ao pressionar `RESGATAR GOLD`, o saldo do acampamento passou de 5000 para 5003 e o indicador idle foi zerado para `+0`, confirmando resgate único e persistência do ganho.

## Arena reorganizada e alcance oculto

No build polido, os oito campos foram reorganizados em duas colunas verticais, quatro de cada lado da estrada. O Guerreiro inicial ficou isolado no campo superior esquerdo, a estrada central permaneceu livre e o farol ganhou mais espaço visual. Os círculos de alcance e o texto de linha de defesa não aparecem mais na arena; o alcance continua existindo apenas na lógica de combate.

## Recompensas estratégicas entre waves

A primeira wave foi concluída e o jogo exibiu o overlay `INTERVALO TÁTICO` com três escolhas. A arena permaneceu pausada até a seleção. Ao escolher `+20% Dano`, o overlay fechou, a Wave 2 retomou com contadores ativos e a melhoria foi aplicada como upgrade da run.

## Verificação final do build polido

A exportação final carregou a Home com o painel de decisões de defesa e a arena com duas colunas de campos, estrada central livre, farol luminoso e sem círculos de ataque renderizados. O build usa o novo fluxo de relíquias entre waves e os cards de tropa continuam exibindo tiers visuais e stats persistentes.

## Boss eras, skins e arena expandida — 2026-08-17

A validação no build web confirmou a arena vertical com oito campos em duas colunas e o caminho visual coberto por uma faixa de bosque, enquanto o movimento interno dos inimigos continuou funcionando. Os cards carregaram os sprites transparentes de Guerreiro, Arqueiro e Tanque sem fundo branco.

Uma run real alcançou a Wave 5 e iniciou a Wave 6 após a transição do chefe. O conteúdo renderizado confirmou `BOSS 1` e minions `COR`, demonstrando a nova era de boss e a classificação visual dos corredores. O `INTERVALO TÁTICO` apareceu somente após o boss; ao escolher `+10 Vida`, o overlay fechou e a Wave 6 retomou normalmente.

A plantação terminou em 0/100 logo depois por falta de tropas suficientes no perfil de teste, e o Game Over abriu com os controles já funcionais. Os PNGs transparentes foram verificados após a limpeza conectada às bordas: pixels de canto ficaram com alpha 0 e os pixels internos da arte foram preservados.

## Revalidação do export limpo — 2026-08-17

Após remover cópias `_original`, versões `-clean`/`-alpha` e sprites brutos não referenciados, o export web foi reconstruído com sucesso. A Home carregou o cenário `forest-village-background.png`, o logo e o briefing de boss/relíquias sem erro visível.

Uma nova run no export limpo abriu em viewport vertical com `WAVE 1`, farol central, `Pulso 3x • 8/8 pátios`, oito campos em duas colunas e os cards de Guerreiro, Arqueiro e Tanque usando PNGs transparentes. A faixa central visual permaneceu coberta pelo bosque, sem rota tracejada ou círculos de alcance; o feixe rotativo do farol continuou visível e a plantação iniciou em `100/100`.

## Preparação dos quartéis e foreground — 2026-08-17

Foram gerados dois assets para a nova composição da arena. A inspeção visual revelou que o sprite do quartel mantém a arte principal, mas foi exportado como RGB com padrão quadriculado de transparência; ele precisa receber alpha real antes de ser usado. O overlay `forest-lane-foreground-transparent.png` foi exportado em RGBA, porém contém faixas magenta horizontais opacas no corredor central; esse artefato será removido antes da integração.

## Limpeza final dos novos assets — 2026-08-17

O sprite final `village-barracks.png` passou a ser RGBA e a arte do quartel ficou preservada sem o quadriculado. A inspeção do foreground confirmou que as laterais de bosque e lanternas estão legíveis, mas ainda existem linhas horizontais residuais no corredor central; a composição final removerá toda a faixa central por máscara espacial para garantir transparência absoluta sobre a pista.

## Quartéis e foreground na arena — 2026-08-17

O export web atualizado abriu a arena em viewport vertical sem erro. Os sete espaços livres passaram a exibir o rótulo `QUARTEL` e o novo sprite de treinamento em vez de `Plantar`. A camada de foreground adicionou árvores, arbustos, cercas e lanternas nas bordas do mapa, acima da pista visual, sem cobrir o farol central; o corredor central continuou livre para a movimentação lógica.

## Regressão encontrada no loop de 60 FPS — 2026-08-17

Na primeira run após a migração para `requestAnimationFrame`, a arena e os quartéis carregaram corretamente, mas a HUD permaneceu em `0/5 gerados` por vários segundos. O console não exibiu erro visível. O fechamento do callback mostra o reagendamento do frame, então a próxima investigação deve verificar a disponibilidade global do requestAnimationFrame e o estado `gameActive` no navegador antes de manter essa implementação.

## Correção do spawn após ajuste de clock — 2026-08-17

Após trocar apenas a simulação para `setInterval` de 16 ms e manter requestAnimationFrame nos efeitos visuais, o export recarregado voltou a gerar inimigos normalmente: a primeira run mostrou `1/5 gerados`, plantação `100/100` e moedas ativas. O quartel vazio, o Guerreiro inicial, o farol e o foreground carregaram juntos sem erro de bundle.

## Validação de fluidez e progressão — 2026-08-17

A run corrigida avançou da Wave 1 para a Wave 2 sem travar, completando `7/7 gerados` e mantendo a plantação em `100/100`. O frame clock visual foi medido no navegador durante um segundo: `61 frames` em `1008 ms`, aproximadamente `61 FPS`. A simulação permanece em passo de 16 ms para garantir atualização de gameplay a 60 Hz, enquanto o requestAnimationFrame mantém o bob, o farol e os efeitos visuais sincronizados ao display.

## Arena circular e economia dual — 2026-08-17

O export atualizado abriu uma run vertical com a HUD exibindo `SUPRIMENTOS` para a moeda temporária e `Acampamento: 5003 gold` para o saldo persistente. Os oito quartéis foram distribuídos em um anel ao redor do farol, com o Guerreiro inicial no setor norte, e os círculos de alcance/auras de tropas e monstros deixaram de ser desenhados no fluxo principal.

## Colocação e cobrança única — 2026-08-17

Na prévia, selecionar o Arqueiro exibiu `Selecione um terreno` sem descontar o saldo. Ao tocar no quartel vazio, o Arqueiro foi criado no anel e a HUD passou a mostrar `249 SUPRIMENTOS`, enquanto `Acampamento: 5003 gold` permaneceu intacto. O fluxo agora cobra a carta somente na confirmação do quartel e não duplica o desconto.

## Spawn externo e rota radial — 2026-08-17

A Wave 3 da prévia chegou a `8/8 gerados` e mostrou inimigos entrando por bordas diferentes do mapa, convergindo radialmente para o farol. A plantação permaneceu em `90/100`, o Arqueiro e o Guerreiro ficaram no anel de quartéis e não foram exibidos anéis circulares de alcance em torno das unidades.

## Acampamento com duas economias — 2026-08-17

O Acampamento abriu no viewport vertical com o saldo `5003 OURO DO ACAMPAMENTO`, o painel `DUAS ECONOMIAS` e botões de upgrades usando `OURO`. A seção explica que o ouro persiste entre partidas e compra upgrades, tropas e quartéis, enquanto os suprimentos nascem durante a wave e pagam apenas a defesa atual.

## Export final — 2026-08-17

O bundle final recarregou a Home com `ouro do Acampamento`, `OURO OCIOSO` e `suprimentos de combate`; a entrada `INICIAR DEFESA` abriu a arena sem erro. A HUD da arena mostrou `SUPRIMENTOS`, `Acampamento: 5003 gold`, `8/8 quartéis` e a primeira wave começou com spawn normal.

## Economia separada — 2026-08-18

O export atualizado abriu a Home com `0 ouro do Acampamento` e iniciou a arena com `251 SUPRIMENTOS` e `Acampamento: 0 gold`, comprovando que o saldo temporário nasce na run e não é herdado do ouro persistente. Os custos das cartas continuam sendo exibidos como valores de compra na arena, enquanto a HUD da run mantém o saldo de suprimentos isolado.

## Acampamento após a separação estrutural — 2026-08-18

A tela do Acampamento mostrou `0 OURO DO ACAMPAMENTO`, botões de colheita e upgrades com `OURO`, e o painel `DUAS ECONOMIAS` descrevendo suprimentos como recurso exclusivo da defesa atual. A run anterior não transferiu o saldo de `SUPRIMENTOS` para o Acampamento.

## Ícones de moeda — inspeção inicial — 2026-08-18

Foram gerados dois assets distintos: `currency-camp-gold.png`, com moeda dourada gravada com farol e trigo, e `currency-combat-supplies.png`, com estojo teal de suprimentos e ferramentas. Ambos têm silhuetas claramente diferentes e leitura adequada para HUD, mas a inspeção visual mostrou linhas/fringe magenta nas bordas e no lado direito, que precisam ser removidos antes da integração final.

## Ícones de moeda integrados — validação visual — 2026-08-18

A Home exibiu o ícone dourado em `PROGRESSO CONTÍNUO` e `OURO OCIOSO`. Na arena, a HUD exibiu o ícone teal dos `SUPRIMENTOS` e o dourado do `OURO`, e cada carta mostrou o ícone teal ao lado do custo de invocação. O bundle carregou os dois PNGs transparentes sem erro.

## Acampamento com identidade visual de moedas — 2026-08-18

A tela do Acampamento exibiu o ícone dourado no saldo principal, em `OURO OCIOSO`, nos upgrades do farol, treinamento e desbloqueios. O painel `DUAS ECONOMIAS` exibiu lado a lado o Ouro do Acampamento e o estojo teal dos Suprimentos de Combate.
