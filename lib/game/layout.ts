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
    spawnDistance: Math.max(mapRadius + 54, Math.min(mapRadius * 1.45, height * 0.62)),
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
  const column = plotIndex < 4 ? -1 : 1;
  const row = plotIndex % 4;
  const columnOffset = Math.max(90, Math.min(138, plotDistance * 1.12));
  const rowSpacing = Math.max(70, Math.min(98, plotDistance * 0.86));
  const rowOffset = (row - 1.5) * rowSpacing;

  return {
    x: centerX + column * columnOffset,
    y: centerY + rowOffset,
  };
}
