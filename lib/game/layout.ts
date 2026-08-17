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

export function getMapLayout(width: number, windowHeight: number): MapLayout {
  const height = clamp(windowHeight * 0.66, 360, 560);
  const mapRadius = clamp(Math.min(width * 0.38, height * 0.36), 112, 168);
  const centerY = clamp(height * 0.52, mapRadius + 78, height - 96);
  const plotDistance = clamp(mapRadius * 0.72, 80, 112);

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
