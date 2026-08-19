# Abrir o Kardec Farmer Idle no Expo Go para Android

## Diagnóstico confirmado

O erro `Uncaught Error: java.io.IOException: failed to download remote update` indica que o Expo Go não conseguiu baixar o bundle JavaScript do projeto. A configuração resolvida do app usa **Expo SDK 54**, não declara `updates.url` nem `runtimeVersion`, e o Metro local foi validado: o endpoint `/status` respondeu `packager-status:running` e o entrypoint do Expo Router respondeu HTTP 200 com o bundle Android.

Portanto, neste projeto, a mensagem normalmente é causada por uma destas situações: o telefone não alcança o IP LAN do computador; o QR antigo aponta para outro projeto/porta; o Expo Go ficou com cache de um update anterior; existe isolamento de Wi-Fi, VPN, proxy ou firewall; ou o Expo Go instalado no telefone está antigo e não acompanha o SDK 54.

## Procedimento recomendado em aparelho físico

Na raiz do projeto, execute primeiro:

```bash
pnpm install
rm -rf .expo
pnpm android:clear
```

O Metro deverá indicar **Using Expo Go** e mostrar um QR baseado em `exp://...`. O Android e o computador precisam estar na mesma rede Wi-Fi. Evite rede de convidados, VPN e redes corporativas que bloqueiem comunicação entre dispositivos.

No Expo Go, feche completamente o projeto anterior, remova-o da lista de recentes se necessário e escaneie **o QR recém-gerado**. Não use QR salvo, link de uma sessão anterior, nem o QR produzido por `pnpm dev:web`.

Se a rede LAN não funcionar, use o túnel:

```bash
pnpm android:tunnel:clear
```

O QR do túnel deve usar um endereço público `exp.direct`. O túnel é mais lento, porém evita a maioria dos bloqueios de Wi-Fi, firewall e roteador.

## Emulador Android

Com o Metro rodando na porta 8081, execute:

```bash
adb reverse tcp:8081 tcp:8081
pnpm android:clear
```

Depois, recarregue o projeto no Expo Go. Para aparelho físico, **não** use `localhost`: esse endereço aponta para o próprio telefone, não para o computador.

## Limpeza adicional no Android

Se o erro persistir, abra **Configurações → Aplicativos → Expo Go → Armazenamento**, toque em **Limpar cache** e reabra o Expo Go. Se ainda houver falha, use **Limpar armazenamento/dados**, abra novamente a conta/sessão do Expo Go e escaneie um QR novo. Confirme também na Play Store que o Expo Go está atualizado e é compatível com o SDK 54.

## Comandos disponíveis

| Comando | Uso |
|---|---|
| `pnpm android` | Metro para Expo Go em LAN, porta 8081 |
| `pnpm android:clear` | LAN com cache do Metro limpo |
| `pnpm android:tunnel` | Expo Go via túnel público |
| `pnpm android:tunnel:clear` | Túnel público com cache limpo |
| `pnpm dev:web` | Somente navegador; não usar o QR para Android |

## Verificações rápidas

| Verificação | Resultado esperado |
|---|---|
| SDK do projeto | `54.0.0` |
| Alvo do Metro | `Using Expo Go` |
| URL Android | `exp://...`, não apenas `http://localhost` |
| LAN | IP privado acessível, como `192.168.x.x` |
| Link problemático | `169.254.x.x` é link-local e geralmente não funciona no telefone |
| Bundle local | `http://127.0.0.1:8081/node_modules/expo-router/entry.bundle?platform=android&dev=true&minify=false` responde HTTP 200 no computador |
| Compatibilidade | `pnpm dlx expo-doctor` termina com `18/18 checks passed` |

Se o túnel retornar `ngrok tunnel took too long to connect`, o problema está na rede/túnel, não no bundle do jogo. Tente outra rede, desative VPN/proxy temporariamente ou permita o processo do túnel no firewall.
