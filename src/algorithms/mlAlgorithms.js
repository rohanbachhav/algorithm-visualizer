const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// K-means clustering algorithm
export const kmeans = async (points, k, setClusters, speed, onComplete, isPaused) => {
  let isActive = true;
  let clusters = initializeClusters(points, k);
  let oldClusters = [];
  let iterations = 0;
  const maxIterations = 100;

  while (isActive && iterations < maxIterations && !clustersEqual(clusters, oldClusters)) {
    while (isPaused()) {
      await sleep(100);
      if (!isActive) return () => {};
    }

    oldClusters = JSON.parse(JSON.stringify(clusters));

    // Assign points to nearest cluster
    points.forEach(point => {
      let minDist = Infinity;
      let clusterIndex = 0;

      clusters.forEach((cluster, index) => {
        const dist = calculateDistance(point, cluster);
        if (dist < minDist) {
          minDist = dist;
          clusterIndex = index;
        }
      });

      point.cluster = clusterIndex;
    });

    // Update cluster centers
    clusters = clusters.map((cluster, i) => {
      const clusterPoints = points.filter(p => p.cluster === i);
      if (clusterPoints.length === 0) return cluster;

      return {
        x: clusterPoints.reduce((sum, p) => sum + p.x, 0) / clusterPoints.length,
        y: clusterPoints.reduce((sum, p) => sum + p.y, 0) / clusterPoints.length
      };
    });

    setClusters([...clusters]);
    await sleep(500 - speed * 20);
    iterations++;
  }

  onComplete();
  return () => { isActive = false; };
};

// K-Nearest Neighbors algorithm
export const knn = async (points, k, setClusters, speed, onComplete, isPaused) => {
  let isActive = true;
  const predictions = [];
  const gridSize = 20;

  for (let x = 0; x < 800; x += gridSize) {
    for (let y = 0; y < 450; y += gridSize) {
      while (isPaused()) {
        await sleep(100);
        if (!isActive) return () => {};
      }

      if (!isActive) break;

      const prediction = predictPoint({ x, y }, points, k);
      predictions.push({ x, y, cluster: prediction });
      setClusters([...predictions]);
      await sleep(500 - speed * 20);
    }
  }

  onComplete();
  return () => { isActive = false; };
};

// Linear Regression algorithm
export const linearRegression = async (points, k, setClusters, speed, onComplete, isPaused) => {
  let isActive = true;
  const steps = 50;

  // Calculate regression line
  const { slope, intercept } = calculateRegression(points);
  const linePoints = [];

  for (let i = 0; i <= steps; i++) {
    while (isPaused()) {
      await sleep(100);
      if (!isActive) return () => {};
    }

    if (!isActive) break;

    const x = (800 * i) / steps;
    const y = slope * x + intercept;
    linePoints.push({ x, y });
    setClusters([...linePoints]);
    await sleep(500 - speed * 20);
  }

  onComplete();
  return () => { isActive = false; };
};

// Helper functions
const calculateDistance = (p1, p2) => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

const predictPoint = (point, points, k) => {
  const distances = points
    .map(p => ({ point: p, distance: calculateDistance(point, p) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, k);

  const votes = {};
  distances.forEach(({ point }) => {
    votes[point.cluster] = (votes[point.cluster] || 0) + 1;
  });

  return Object.entries(votes).reduce((a, b) => 
    votes[a] > votes[b] ? a : b
  )[0];
};

const calculateRegression = (points) => {
  const meanX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
  const meanY = points.reduce((sum, p) => sum + p.y, 0) / points.length;

  let numerator = 0;
  let denominator = 0;
  points.forEach(point => {
    numerator += (point.x - meanX) * (point.y - meanY);
    denominator += Math.pow(point.x - meanX, 2);
  });

  const slope = numerator / denominator;
  const intercept = meanY - slope * meanX;

  return { slope, intercept };
};

const clustersEqual = (clusters1, clusters2) => {
  if (clusters1.length !== clusters2.length) return false;
  return clusters1.every((cluster, i) => 
    Math.abs(cluster.x - clusters2[i].x) < 0.1 && 
    Math.abs(cluster.y - clusters2[i].y) < 0.1
  );
};

const initializeClusters = (points, k) => {
  const clusters = [];
  const usedIndices = new Set();

  while (clusters.length < k) {
    const index = Math.floor(Math.random() * points.length);
    if (!usedIndices.has(index)) {
      usedIndices.add(index);
      clusters.push({ ...points[index] });
    }
  }

  return clusters;
}; 