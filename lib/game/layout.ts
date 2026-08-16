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
  const plotDistance = clamp(mapRadius * 0.58, 62, 92);

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
  const angle = (plotIndex * Math.PI) / 4;
  const pathOffset = plotIndex === 2 ? plotDistance * 0.42 : plotIndex === 6 ? -plotDistance * 0.42 : 0;

  return {
    x: centerX + Math.cos(angle) * plotDistance + pathOffset,
    y: centerY + Math.sin(angle) * plotDistance,
  };
}
