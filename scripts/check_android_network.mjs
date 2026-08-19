import os from "node:os";

const interfaces = os.networkInterfaces();
const candidates = [];

for (const [name, entries] of Object.entries(interfaces)) {
  for (const entry of entries ?? []) {
    if (entry.family !== "IPv4" || entry.internal) continue;
    const isLinkLocal = entry.address.startsWith("169.254.");
    candidates.push({ name, address: entry.address, isLinkLocal });
  }
}

console.log("Interfaces IPv4 disponíveis para o Expo Go Android:");
if (candidates.length === 0) {
  console.log("  Nenhum IP IPv4 externo foi encontrado.");
} else {
  for (const candidate of candidates) {
    console.log(`  ${candidate.name}: ${candidate.address}${candidate.isLinkLocal ? " (link-local; evite este endereço)" : ""}`);
  }
}

console.log("\nRecomendações:");
console.log("  1. O computador e o Android devem estar na mesma rede Wi-Fi.");
console.log("  2. Prefira um IP privado como 192.168.x.x, 10.x.x.x ou 172.16-31.x.x.");
console.log("  3. Não use localhost no telefone e evite 169.254.x.x.");
console.log("  4. Libere o Node/Expo para conexões privadas no firewall do Windows.");
console.log("  5. Depois execute pnpm android:clear e escaneie um QR novo.");
