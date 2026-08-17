export interface MapLayout {
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  mapRadius: number;
  spawnDistance: number;
  plotDistance: number;
  guardHoldDistance: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function getMapLayout(width: number, windowHeight: number, isBossWave = false): MapLayout {
  const height = clamp(windowHeight * (isBossWave ? 0.76 : 0.66), isBossWave ? 410 : 360, isBossWave ? 640 : 560);
  const mapRadius = clamp(Math.min(width * (isBossWave ? 0.42 : 0.38), height * 0.36), isBossWave ? 126 : 112, isBossWave ? 196 : 168);
  const centerY = clamp(height * (isBossWave ? 0.5 : 0.52), mapRadius + 78, height - 96);
  const plotDistance = clamp(mapRadius * 0.72, isBossWave ? 88 : 80, isBossWave ? 126 : 112);

  return {
    width,
    height,
    centerX: width / 2,
    centerY,
    mapRadius,
    spawnDistance: Math.max(mapRadius + 54, width * 0.62, height * 0.58),
    plotDistance,
    guardHoldDistance: clamp(mapRadius * 0.34, 42, 58),
  };
}

export function getPlotPosition(
  plotIndex: number,
  centerX: number,
  centerY: number,
  plotDistance: number,
) {
  const ringRadius = Math.max(94, Math.min(132, plotDistance * 0.94));
  const angle = -Math.PI / 2 + (plotIndex / 8) * Math.PI * 2;

  return {
    x: centerX + Math.cos(angle) * ringRadius,
    y: centerY + Math.sin(angle) * ringRadius,
  };
}
