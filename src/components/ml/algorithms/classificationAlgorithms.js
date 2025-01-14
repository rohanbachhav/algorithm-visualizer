const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const knn = async (points, k, setPredictions, speed, onComplete, isPaused, gridSize) => {
  let isActive = true;

  const cleanup = () => {
    isActive = false;
  };

  try {
    if (points.length === 0) {
      onComplete();
      return cleanup;
    }

    const predictions = [];
    const stepSize = Math.max(1, Math.floor(800 / gridSize));

    for (let x = 0; x < 800 && isActive; x += stepSize) {
      for (let y = 0; y < 450 && isActive; y += stepSize) {
        while (isPaused()) {
          if (!isActive) return cleanup;
          await sleep(100);
        }

        // Calculate distances to all points
        const distances = points.map(point => ({
          distance: Math.hypot(x - point.x, y - point.y),
          cluster: point.cluster
        }));

        // Sort by distance and get k nearest neighbors
        distances.sort((a, b) => a.distance - b.distance);
        const kNearest = distances.slice(0, k);

        // Count occurrences of each class
        const classCounts = {};
        kNearest.forEach(neighbor => {
          classCounts[neighbor.cluster] = (classCounts[neighbor.cluster] || 0) + 1;
        });

        // Find the most common class
        let predictedClass = 0;
        let maxCount = 0;
        Object.entries(classCounts).forEach(([cluster, count]) => {
          if (count > maxCount) {
            maxCount = count;
            predictedClass = parseInt(cluster);
          }
        });

        predictions.push({ x, y, cluster: predictedClass });

        // Update predictions every few points
        if (predictions.length % (gridSize * 2) === 0) {
          setPredictions([...predictions]);
          await sleep(500 - speed * 20);
        }
      }
    }

    if (isActive) {
      setPredictions(predictions);
      onComplete();
    }
  } catch (error) {
    console.error('KNN error:', error);
  }

  return cleanup;
}; 