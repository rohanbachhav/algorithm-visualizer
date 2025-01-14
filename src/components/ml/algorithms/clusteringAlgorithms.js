const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const kmeans = async (points, k, setClusters, speed, onComplete, isPaused) => {
  let isActive = true;
  
  const cleanup = () => {
    isActive = false;
  };

  try {
    if (points.length < k) {
      onComplete();
      return cleanup;
    }

    // Initialize centroids randomly from existing points
    let centroids = points
      .sort(() => Math.random() - 0.5)
      .slice(0, k)
      .map(p => ({ x: p.x, y: p.y }));
    
    let oldCentroids = [];
    let iterations = 0;
    const maxIterations = 100;

    while (isActive && iterations < maxIterations && !centroidsEqual(centroids, oldCentroids)) {
      while (isPaused()) {
        if (!isActive) return cleanup;
        await sleep(100);
      }

      // Assign points to nearest centroid
      points.forEach(point => {
        let minDist = Infinity;
        let cluster = 0;
        
        centroids.forEach((centroid, i) => {
          const dist = Math.hypot(point.x - centroid.x, point.y - centroid.y);
          if (dist < minDist) {
            minDist = dist;
            cluster = i;
          }
        });
        
        point.cluster = cluster;
      });

      // Store old centroids
      oldCentroids = centroids.map(c => ({ x: c.x, y: c.y }));

      // Update centroids
      centroids = centroids.map((_, i) => {
        const clusterPoints = points.filter(p => p.cluster === i);
        if (clusterPoints.length === 0) return oldCentroids[i];
        
        return {
          x: clusterPoints.reduce((sum, p) => sum + p.x, 0) / clusterPoints.length,
          y: clusterPoints.reduce((sum, p) => sum + p.y, 0) / clusterPoints.length
        };
      });

      setClusters(centroids);
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

const centroidsEqual = (c1, c2) => {
  if (c1.length !== c2.length) return false;
  return c1.every((centroid, i) => 
    Math.abs(centroid.x - c2[i].x) < 0.1 && 
    Math.abs(centroid.y - c2[i].y) < 0.1
  );
};

export const dbscan = async (points, epsilon, minPoints, setClusters, speed, onComplete, isPaused) => {
  let isActive = true;
  
  const cleanup = () => {
    isActive = false;
  };

  try {
    let clusters = [];
    let currentCluster = 0;
    const visited = new Set();

    const expandCluster = async (point, neighbors) => {
      point.cluster = currentCluster;
      
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          const newNeighbors = findNeighbors(neighbor, points, epsilon);
          
          if (newNeighbors.length >= minPoints) {
            neighbors.push(...newNeighbors.filter(n => !visited.has(n)));
          }
        }
        
        if (neighbor.cluster === undefined) {
          neighbor.cluster = currentCluster;
        }
      }
    };

    for (const point of points) {
      if (visited.has(point)) continue;
      
      visited.add(point);
      const neighbors = findNeighbors(point, points, epsilon);

      if (neighbors.length < minPoints) {
        point.cluster = -1; // Noise point
      } else {
        currentCluster++;
        await expandCluster(point, neighbors);
      }

      while (isPaused()) {
        if (!isActive) return cleanup;
        await sleep(100);
      }

      setClusters([...points]);
      await sleep(500 - speed * 20);
    }

    if (isActive) {
      onComplete();
    }
  } catch (error) {
    console.error('DBSCAN error:', error);
  }

  return cleanup;
};

const findNeighbors = (point, points, epsilon) => {
  return points.filter(p => 
    p !== point && 
    Math.hypot(p.x - point.x, p.y - point.y) <= epsilon
  );
};

export const hierarchicalClustering = async (points, k, setClusters, speed, onComplete, isPaused) => {
  let isActive = true;
  
  const cleanup = () => {
    isActive = false;
  };

  try {
    // Implementation of hierarchical clustering...
    // This is a placeholder for now
    onComplete();
  } catch (error) {
    console.error('Hierarchical clustering error:', error);
  }

  return cleanup;
}; 