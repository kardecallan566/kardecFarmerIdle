import { Vector2, INITIAL_GAME_CONFIG } from './types';

import type { Upgrade } from './types';
import { RELIC_CATALOG } from './relics';

export function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function radiansToDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

export function distance(p1: Vector2, p2: Vector2): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function angle(p1: Vector2, p2: Vector2): number {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}

// Generate radial paths from center outward
export function generateRadialPaths(
  centerX: number,
  centerY: number,
  pathCount: number,
  maxDistance: number
): Vector2[][] {
  const paths: Vector2[][] = [];
  const angleStep = (2 * Math.PI) / pathCount;

  for (let i = 0; i < pathCount; i++) {
    const pathAngle = angleStep * i;
    const path: Vector2[] = [];

    // Generate points along the radial path from outside to center
    const steps = 20;
    for (let j = 0; j <= steps; j++) {
      const t = j / steps; // 0 to 1
      const dist = maxDistance * (1 - t); // From maxDistance to 0
      const x = centerX + Math.cos(pathAngle) * dist;
      const y = centerY + Math.sin(pathAngle) * dist;
      path.push({ x, y });
    }

    paths.push(path);
  }

  return paths;
}

// Get spawn point for a specific path
export function getSpawnPoint(
  centerX: number,
  centerY: number,
  pathIndex: number,
  pathCount: number,
  spawnDistance: number
): Vector2 {
  const angleStep = (2 * Math.PI) / pathCount;
  const angle = angleStep * pathIndex;
  return {
    x: centerX + Math.cos(angle) * spawnDistance,
    y: centerY + Math.sin(angle) * spawnDistance,
  };
}

// Get position on a radial path based on progress (0 to 1)
export function getPositionOnPath(
  centerX: number,
  centerY: number,
  pathIndex: number,
  pathCount: number,
  progress: number,
  maxDistance: number
): Vector2 {
  const angleStep = (2 * Math.PI) / pathCount;
  const pathAngle = angleStep * pathIndex;
  const dist = maxDistance * (1 - progress);
  return {
    x: centerX + Math.cos(pathAngle) * dist,
    y: centerY + Math.sin(pathAngle) * dist,
  };
}

// Check if a position is valid for placing a guard (near paths, not too close to center)
export function isValidGuardPosition(
  x: number,
  y: number,
  centerX: number,
  centerY: number,
  pathCount: number,
  mapRadius: number,
  plantationRadius: number,
  minDistFromPath: number = 40
): boolean {
  const dist = distance({ x: centerX, y: centerY }, { x, y });

  // Must be outside plantation
  if (dist < plantationRadius + 30) return false;

  // Must be within map
  if (dist > mapRadius) return false;

  // Check distance to nearest path
  const angleStep = (2 * Math.PI) / pathCount;
  let minDistToPath = Infinity;

  for (let i = 0; i < pathCount; i++) {
    const pathAngle = angleStep * i;
    // Distance from point to radial line
    const dx = x - centerX;
    const dy = y - centerY;
    const pointAngle = Math.atan2(dy, dx);

    // Normalize angles to compare
    let angleDiff = Math.abs(pointAngle - pathAngle);
    if (angleDiff > Math.PI) {
      angleDiff = 2 * Math.PI - angleDiff;
    }

    // If close to this path angle, calculate perpendicular distance
    if (angleDiff < Math.PI / 4) {
      minDistToPath = Math.min(minDistToPath, 0); // On or very close to path
    }
  }

  return minDistToPath <= minDistFromPath;
}

// Generate weighted relic options for the tactical break.
export function generateUpgradeOptions(count: number = 3): Upgrade[] {
  const pool = [...RELIC_CATALOG];
  const selected: Upgrade[] = [];

  while (selected.length < Math.min(count, pool.length)) {
    const totalWeight = pool.reduce((sum, relic) => sum + relic.weight, 0);
    let roll = Math.random() * totalWeight;
    let selectedIndex = pool.length - 1;

    for (let index = 0; index < pool.length; index += 1) {
      roll -= pool[index].weight;
      if (roll <= 0) {
        selectedIndex = index;
        break;
      }
    }

    const [relic] = pool.splice(selectedIndex, 1);
    selected.push({
      id: generateId('relic'),
      name: relic.name,
      description: relic.description,
      type: relic.type,
      value: relic.value,
      targetGuard: relic.targetGuard,
      stat: relic.stat,
      rarity: relic.rarity,
      behavior: relic.behavior,
    });
  }

  return selected;
}

// Generate unique ID
export function generateId(prefix: string = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
