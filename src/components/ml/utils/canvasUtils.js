export const colorThemes = {
  default: {
    clusters: [
      '#FF6B6B', // Red
      '#4ECDC4', // Teal
      '#45B7D1', // Blue
      '#96CEB4', // Green
      '#FFEEAD', // Yellow
      '#D4A5A5', // Pink
      '#9E9E9E', // Gray
      '#FFB6C1', // Light pink
      '#87CEEB', // Sky blue
      '#98FB98'  // Pale green
    ],
    line: '#2C3E50',
    point: '#34495E',
    residual: '#E74C3C',
    confidence: 'rgba(52, 152, 219, 0.2)',
    grid: 'rgba(0, 0, 0, 0.1)',
    prediction: 'rgba(0, 0, 0, 0.05)'
  },
  pastel: {
    clusters: [
      '#FFB3BA', // Pastel red
      '#BAFFC9', // Pastel green
      '#BAE1FF', // Pastel blue
      '#FFFFBA', // Pastel yellow
      '#FFB3FF', // Pastel purple
      '#E0BBE4', // Pastel lavender
      '#957DAD', // Pastel violet
      '#D4A5A5', // Pastel pink
      '#9DC8C8', // Pastel teal
      '#FFDFD3'  // Pastel peach
    ],
    line: '#957DAD',
    point: '#7D7D7D',
    residual: '#FF9AA2',
    confidence: 'rgba(149, 125, 173, 0.2)',
    grid: 'rgba(0, 0, 0, 0.1)',
    prediction: 'rgba(0, 0, 0, 0.05)'
  },
  vibrant: {
    clusters: [
      '#FF0000', // Pure red
      '#00FF00', // Pure green
      '#0000FF', // Pure blue
      '#FFFF00', // Pure yellow
      '#FF00FF', // Pure magenta
      '#00FFFF', // Pure cyan
      '#FF8000', // Pure orange
      '#8000FF', // Pure purple
      '#0080FF', // Pure sky blue
      '#FF0080'  // Pure pink
    ],
    line: '#000000',
    point: '#333333',
    residual: '#FF4136',
    confidence: 'rgba(0, 116, 217, 0.2)',
    grid: 'rgba(0, 0, 0, 0.1)',
    prediction: 'rgba(0, 0, 0, 0.05)'
  },
  monochrome: {
    clusters: [
      '#000000', // Black
      '#333333',
      '#666666',
      '#999999',
      '#CCCCCC',
      '#1A1A1A',
      '#4D4D4D',
      '#808080',
      '#B3B3B3',
      '#E6E6E6'  // Light gray
    ],
    line: '#000000',
    point: '#333333',
    residual: '#666666',
    confidence: 'rgba(0, 0, 0, 0.2)',
    grid: 'rgba(0, 0, 0, 0.1)',
    prediction: 'rgba(0, 0, 0, 0.05)'
  }
};

export const clearCanvas = (ctx, width, height) => {
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, width, height);
};

export const drawPoint = (ctx, x, y, color, size = 6) => {
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
};

export const drawLine = (ctx, startX, startY, endX, endY, color, width = 2) => {
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
};

export const drawGrid = (ctx, width, height, size, color) => {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;

  for (let x = 0; x < width; x += size) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  for (let y = 0; y < height; y += size) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
};

export const drawTreeNode = (ctx, x, y, radius, text, fillColor = '#fff', strokeColor = '#000') => {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = fillColor;
  ctx.fill();
  ctx.strokeStyle = strokeColor;
  ctx.stroke();

  ctx.fillStyle = fillColor === '#fff' ? '#000' : '#fff';
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
};

export const drawArrow = (ctx, fromX, fromY, toX, toY, color = '#666') => {
  const headLength = 10;
  const angle = Math.atan2(toY - fromY, toX - fromX);

  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(
    toX - headLength * Math.cos(angle - Math.PI / 6),
    toY - headLength * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    toX - headLength * Math.cos(angle + Math.PI / 6),
    toY - headLength * Math.sin(angle + Math.PI / 6)
  );
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}; 