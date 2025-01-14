export const kmeans = async (points, k, setClusters, speed, onComplete, isPaused) => {
  let isActive = true;
  
  const cleanup = () => {
    isActive = false;
  };

  try {
    let clusters = initializeClusters(points, k);
    let oldClusters = [];
    let iterations = 0;
    const maxIterations = 100;

    while (isActive && iterations < maxIterations && !clustersEqual(clusters, oldClusters)) {
      while (isPaused()) {
        if (!isActive) return cleanup;
        await sleep(100);
      }

      // ... clustering logic ...

      setClusters([...clusters]);
      await sleep(500 - speed * 20);
      iterations++;
    }

    if (isActive) {
      onComplete();
    }
  } catch (error) {
    console.error('Kmeans error:', error);
  }

  return cleanup;
}; 