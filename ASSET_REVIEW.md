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
