const CLUSTER_COLORS = {
  available: '#22c55e', // green-500
  reserved: '#f59e0b', // amber-500
  rented: '#ef4444', // red-500
  background: '#1e293b', // slate-800
  stroke: '#334155', // slate-700
};

export interface IClusterRingIconParams {
  available: number;
  reserved: number;
  rented: number;
  size?: number;
}

/**
 * Генерирует ImageData для ring chart кластера
 */
export function generateClusterRingIcon(params: IClusterRingIconParams): ImageData {
  const { available, reserved, rented, size = 48 } = params;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const centerX = size / 2;
  const centerY = size / 2;
  const outerRadius = size / 2 - 2;
  const ringWidth = 6;
  const innerRadius = outerRadius - ringWidth;

  const total = available + reserved + rented;

  // Фон центрального круга
  ctx.beginPath();
  ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
  ctx.fillStyle = CLUSTER_COLORS.background;
  ctx.fill();

  if (total === 0) {
    // Пустой кластер — серое кольцо
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius - ringWidth / 2, 0, Math.PI * 2);
    ctx.strokeStyle = CLUSTER_COLORS.stroke;
    ctx.lineWidth = ringWidth;
    ctx.stroke();
    return ctx.getImageData(0, 0, size, size);
  }

  // Рисуем сегменты кольца
  const segments = [
    { count: available, color: CLUSTER_COLORS.available },
    { count: reserved, color: CLUSTER_COLORS.reserved },
    { count: rented, color: CLUSTER_COLORS.rented },
  ].filter(s => s.count > 0);

  let startAngle = -Math.PI / 2; // Начинаем с 12 часов

  for (const segment of segments) {
    const sweepAngle = (segment.count / total) * Math.PI * 2;

    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius - ringWidth / 2, startAngle, startAngle + sweepAngle);
    ctx.strokeStyle = segment.color;
    ctx.lineWidth = ringWidth;
    ctx.lineCap = 'butt';
    ctx.stroke();

    startAngle += sweepAngle;
  }

  return ctx.getImageData(0, 0, size, size);
}
