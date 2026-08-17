# Abrir o Kardec Farmer Idle no Expo Go para Android

## Diagnóstico

O erro `Uncaught Error: java.io.IOException: failed to download remote update` normalmente significa que o Expo Go não conseguiu alcançar o servidor Metro e baixar o bundle JavaScript. Nesta configuração, o projeto estava iniciando o Metro com `--web`, embora o fluxo usado fosse o Expo Go Android. Além disso, em alguns ambientes o Expo anuncia um endereço LAN `169.254.x.x`, que é um endereço link-local e não costuma ser acessível pelo telefone.

O projeto agora inicia o alvo nativo explicitamente com Expo Go, mantém o modo web separado e usa as versões de patch compatíveis com o SDK 54.

## Procedimento recomendado

No computador, dentro da raiz do projeto, execute:

```bash
pnpm install
rm -rf .expo
pnpm android
```

O comando `pnpm android` equivale a `expo start --go --lan`. O telefone Android e o computador precisam estar na mesma rede Wi-Fi. No Expo Go, escaneie o QR exibido pelo Metro. Não use o QR gerado pelo modo `pnpm dev:web`, pois esse comando é exclusivo do navegador.

Se o telefone não conseguir acessar o computador pela rede local, execute:

```bash
pnpm android:tunnel
```

Depois, escaneie o novo QR exibido pelo Metro. O endereço deverá usar um domínio público do túnel, normalmente terminado em `exp.direct`. O túnel é mais lento que LAN, mas contorna isolamento de Wi-Fi, firewall e redes públicas.

Para limpar o cache do Metro antes de uma nova tentativa, use:

```bash
pnpm android:clear
```

No Android, também é recomendável fechar o Expo Go completamente e limpar apenas o cache em **Configurações > Aplicativos > Expo Go > Armazenamento > Limpar cache**. Reabra o Expo Go e escaneie um QR novo.

## Emulador Android

Se o teste for feito em um emulador no mesmo computador, o comando abaixo costuma ser suficiente:

```bash
pnpm android
```

Como alternativa, com o Metro rodando na porta 8081, é possível usar:

```bash
adb reverse tcp:8081 tcp:8081
```

Em seguida, recarregue o projeto no Expo Go.

## Verificações rápidas

| Verificação | Resultado esperado |
|---|---|
| Alvo do Metro | `Using Expo Go` |
| URL para Android | `exp://...`, nunca somente `http://localhost` |
| Rede local | Computador e telefone na mesma Wi-Fi |
| Link LAN | Deve apontar para um IP privado acessível, como `192.168.x.x`; `169.254.x.x` indica um endereço link-local problemático |
| Versões | `pnpm dlx expo-doctor` deve terminar com `18/18 checks passed` |
| Modo web | Usar somente `pnpm dev:web` ou `pnpm exec expo start --web` |

Se o modo túnel retornar `ngrok tunnel took too long to connect`, o problema é externo ao bundle: tente outra rede, desative VPN/proxy temporariamente ou permita o processo do ngrok no firewall. O código do jogo e o bundle podem ser válidos mesmo quando o túnel não consegue estabelecer conexão.
