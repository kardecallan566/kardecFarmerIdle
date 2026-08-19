# Executar o Kardec Farmer Idle no Android

## Alvo do projeto

O Kardec Farmer Idle está configurado como **Android-only**. O manifesto Expo resolvido informa `platforms: ["android"]`, não declara configuração web ou iOS e desativa verificações automáticas de OTA com `updates.enabled: false`, `checkAutomatically: "NEVER"` e `fallbackToCacheTimeout: 0`.

O jogo deve ser aberto pelo **Expo Go Android usando o QR da sessão local do Metro**. Não use `pnpm dev:web`, links salvos de uma publicação anterior, nem um projeto listado em “Recentes” no Expo Go.

## Procedimento obrigatório no Windows

Na raiz atualizada do projeto, execute:

```powershell
git pull origin main
pnpm install
Remove-Item -Recurse -Force .expo -ErrorAction SilentlyContinue
pnpm android:clear
```

No Android, abra o Expo Go, remova o projeto antigo da lista de recentes se ele aparecer e escaneie o QR gerado por `pnpm android:clear`. O QR deve apontar para uma sessão `exp://...` do Metro local.

O comando `pnpm android:clear` usa túnel por padrão para evitar que o telefone dependa do IP LAN do computador. O túnel é somente uma conexão ao Metro local; ele não é um update remoto do jogo.

Se você estiver em uma rede Wi-Fi confiável, com computador e telefone na mesma rede, pode usar o modo LAN:

```powershell
pnpm android:lan
```

Se você preferir escolher explicitamente o túnel, use:

```powershell
pnpm android:tunnel:clear
```

## Comandos Android

| Comando | Uso |
|---|---|
| `pnpm android` | Expo Go Android via túnel |
| `pnpm android:lan` | Expo Go Android via LAN |
| `pnpm android:clear` | Expo Go Android via túnel com cache limpo |
| `pnpm android:tunnel` | Expo Go Android via túnel |
| `pnpm android:tunnel:clear` | Túnel com cache limpo |
| `pnpm android:offline` | LAN com modo offline do Metro, útil para evitar consultas externas |
| `pnpm dev` | Alias Android: executa `pnpm android:clear` |

## Se aparecer `failed to download remote update`

Essa mensagem normalmente indica que o Expo Go está tentando abrir uma sessão antiga ou não consegue alcançar o Metro atual. Faça esta sequência completa:

1. Feche o Expo Go pelo menu de aplicativos recentes do Android.
2. Abra **Configurações → Aplicativos → Expo Go → Armazenamento** e toque em **Limpar cache**. Se o erro continuar, use **Limpar armazenamento/dados**.
3. No computador, execute novamente `Remove-Item -Recurse -Force .expo -ErrorAction SilentlyContinue` e depois `pnpm android:clear`.
4. Abra o Expo Go sem selecionar um projeto antigo e escaneie o QR novo.
5. Se a LAN falhar, use `pnpm android:tunnel:clear`.
6. Atualize o Expo Go pela Play Store. O projeto usa Expo SDK 54, portanto o Expo Go precisa ser uma versão atual compatível com SDK 54.

Se estiver usando um emulador Android no mesmo computador, prefira:

```powershell
adb reverse tcp:8081 tcp:8081
pnpm android:clear
```

## Diagnóstico técnico

A configuração resolvida pode ser conferida com:

```powershell
pnpm exec expo config --json
```

Os valores esperados são `platforms: ["android"]`, `sdkVersion: "54.0.0"` e `updates.enabled: false`. Para o fluxo local, o Metro deve mostrar `Using Expo Go` e a URL deve começar com `exp://`.

O modo web não faz parte do fluxo do jogo. Qualquer log `Web Bundled`, `dev:web` ou `Premature close` gerado ao tentar abrir uma página web deve ser ignorado para o teste Android; use exclusivamente os comandos `android:*` deste documento.
