import type { RunEvent, RunEventId, Upgrade } from './types';

export interface RunEventOutcome {
  combatCoinsDelta: number;
  plantationHealthDelta: number;
  upgrade?: Upgrade;
}

const EVENT_UPGRADES: Record<string, Upgrade> = {
  groveDamage: {
    id: 'event-grove-damage',
    name: 'Seiva Furiosa',
    description: 'As tropas recebem +12% de dano até o fim desta run.',
    type: 'damage',
    value: 0.12,
    rarity: 'rare',
    behavior: 'assault',
  },
  groveHealth: {
    id: 'event-grove-health',
    name: 'Casca Reforçada',
    description: 'As tropas recebem +18 vida até o fim desta run.',
    type: 'health',
    value: 18,
    rarity: 'rare',
    behavior: 'bastion',
  },
};

const RUN_EVENTS: Record<RunEventId, RunEvent> = {
  scavenger: {
    id: 'scavenger',
    title: 'Caravana na Clareira',
    description: 'Uma caravana abandonou caixas de suprimentos perto do farol. Você pode levar tudo ou separar parte para reforçar a defesa.',
    choices: [
      { id: 'stockpile', title: 'Estocar suprimentos', description: '+120 Suprimentos de Combate.' },
      { id: 'trade', title: 'Trocar por técnica', description: 'Receba Seiva Furiosa e +35 Suprimentos.' },
    ],
  },
  groveBlessing: {
    id: 'groveBlessing',
    title: 'Bênção do Bosque',
    description: 'As raízes do bosque alcançam o farol. Escolha entre fortalecer tropas ou recuperar a plantação.',
    choices: [
      { id: 'sap', title: 'Seiva Furiosa', description: 'Receba uma relíquia temporária de dano.' },
      { id: 'roots', title: 'Raízes Protetoras', description: 'Receba Casca Reforçada e recupere 20 vida do farol.' },
    ],
  },
  lastStand: {
    id: 'lastStand',
    title: 'Última Vigília',
    description: 'Batedores avisam que a próxima rota será difícil. Uma preparação agressiva pode render suprimentos, mas cobra vida do farol.',
    choices: [
      { id: 'fortify', title: 'Fortificar muralhas', description: '+35 vida do farol e +20 suprimentos.' },
      { id: 'ambush', title: 'Preparar emboscada', description: '+100 suprimentos, mas -18 vida do farol.' },
    ],
  },
};

export function getRunEventForWave(wave: number): RunEvent | null {
  if (wave < 6 || wave % 3 !== 0) return null;
  const eventId: RunEventId = wave % 9 === 0 ? 'lastStand' : wave % 6 === 0 ? 'scavenger' : 'groveBlessing';
  return RUN_EVENTS[eventId];
}

export function resolveRunEvent(eventId: RunEventId, choiceId: string): RunEventOutcome {
  if (eventId === 'scavenger' && choiceId === 'stockpile') {
    return { combatCoinsDelta: 120, plantationHealthDelta: 0 };
  }
  if (eventId === 'scavenger' && choiceId === 'trade') {
    return { combatCoinsDelta: 35, plantationHealthDelta: 0, upgrade: EVENT_UPGRADES.groveDamage };
  }
  if (eventId === 'groveBlessing' && choiceId === 'sap') {
    return { combatCoinsDelta: 0, plantationHealthDelta: 0, upgrade: EVENT_UPGRADES.groveDamage };
  }
  if (eventId === 'groveBlessing' && choiceId === 'roots') {
    return { combatCoinsDelta: 0, plantationHealthDelta: 20, upgrade: EVENT_UPGRADES.groveHealth };
  }
  if (eventId === 'lastStand' && choiceId === 'fortify') {
    return { combatCoinsDelta: 20, plantationHealthDelta: 35 };
  }
  return { combatCoinsDelta: 100, plantationHealthDelta: -18 };
}
