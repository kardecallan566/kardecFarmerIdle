export interface MapLayout {
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  mapRadius: number;
  spawnDistance: number;
  plotDistance: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function getMapLayout(width: number, windowHeight: number): MapLayout {
  const height = clamp(windowHeight * 0.66, 360, 560);
  const mapRadius = clamp(Math.min(width * 0.38, height * 0.36), 112, 168);
  const centerY = height * 0.72;

  return {
    width,
    height,
    centerX: width / 2,
    centerY,
    mapRadius,
    spawnDistance: Math.max(mapRadius + 54, Math.min(mapRadius * 1.45, height * 0.62)),
    plotDistance: clamp(mapRadius * 0.58, 62, 92),
  };
}
