const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const linearRegression = async (points, setLine, speed, onComplete, isPaused) => {
  let isActive = true;

  const cleanup = () => {
    isActive = false;
  };

  try {
    if (points.length < 2) {
      onComplete();
      return cleanup;
    }

    // Calculate means
    const meanX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
    const meanY = points.reduce((sum, p) => sum + p.y, 0) / points.length;

    // Gradient descent parameters
    let slope = 0;
    let intercept = meanY;
    const learningRate = 0.0001;
    const iterations = 100;

    for (let i = 0; i < iterations && isActive; i++) {
      while (isPaused()) {
        if (!isActive) return cleanup;
        await sleep(100);
      }

      // Calculate gradients
      let slopeGrad = 0;
      let interceptGrad = 0;

      for (const point of points) {
        const prediction = slope * point.x + intercept;
        const error = prediction - point.y;
        slopeGrad += error * point.x;
        interceptGrad += error;
      }

      slopeGrad = slopeGrad * (2 / points.length);
      interceptGrad = interceptGrad * (2 / points.length);

      // Update parameters
      slope = slope - learningRate * slopeGrad;
      intercept = intercept - learningRate * interceptGrad;

      // Update line state
      setLine({ slope, intercept });

      // Delay for visualization
      await sleep(500 - speed * 20);
    }

    if (isActive) {
      onComplete();
    }
  } catch (error) {
    console.error('Linear regression error:', error);
  }

  return cleanup;
};

// Helper function to calculate R²
export const calculateR2 = (points, line) => {
  if (!line || points.length < 2) return 0;
  
  const yMean = points.reduce((sum, p) => sum + p.y, 0) / points.length;
  const ssTotal = points.reduce((sum, p) => sum + Math.pow(p.y - yMean, 2), 0);
  const ssResidual = points.reduce((sum, p) => {
    const yPred = line.slope * p.x + line.intercept;
    return sum + Math.pow(p.y - yPred, 2);
  }, 0);
  
  return 1 - (ssResidual / ssTotal);
};

// Helper function to calculate confidence intervals
export const calculateConfidenceIntervals = (points, line) => {
  const n = points.length;
  if (n < 2) return null;

  // Calculate standard error
  const yPred = points.map(p => line.slope * p.x + line.intercept);
  const residuals = points.map((p, i) => p.y - yPred[i]);
  const standardError = Math.sqrt(residuals.reduce((sum, r) => sum + r * r, 0) / (n - 2));

  // Calculate x mean and variance
  const xMean = points.reduce((sum, p) => sum + p.x, 0) / n;
  const xVar = points.reduce((sum, p) => sum + Math.pow(p.x - xMean, 2), 0) / (n - 1);

  // t-value for 95% confidence (approximation)
  const tValue = 1.96;

  return {
    standardError,
    getInterval: (x) => {
      const yPred = line.slope * x + line.intercept;
      const se = standardError * Math.sqrt(1/n + Math.pow(x - xMean, 2) / ((n-1) * xVar));
      const margin = tValue * se;
      return {
        upper: yPred + margin,
        lower: yPred - margin
      };
    }
  };
}; 