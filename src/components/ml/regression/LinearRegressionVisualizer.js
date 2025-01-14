import React, { useState, useRef, useEffect } from 'react';
import { clearCanvas, drawPoint, drawLine } from '../utils/canvasUtils';

const LinearRegressionVisualizer = () => {
  const [points, setPoints] = useState([]);
  const [step, setStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [line, setLine] = useState({ slope: 0, intercept: 0 });
  const [explanation, setExplanation] = useState('Welcome! Let\'s learn Linear Regression step by step.');
  
  const canvasRef = useRef(null);
  const timeoutRef = useRef(null);

  // Clear everything and start fresh
  const reset = () => {
    setPoints([]);
    setStep(0);
    setIsRunning(false);
    setLine({ slope: 0, intercept: 0 });
    setExplanation('Welcome! Let\'s learn Linear Regression step by step.');
  };

  // Generate simple example points
  const generateExample = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    reset();
    
    // Create points that clearly show a trend
    const newPoints = [
      { x: 100, y: 400 },
      { x: 200, y: 350 },
      { x: 300, y: 300 },
      { x: 400, y: 250 },
      { x: 500, y: 200 },
      { x: 600, y: 150 },
    ];
    
    setPoints(newPoints);
    setExplanation('Here\'s a simple example. These points show a clear downward trend. Click "Start" to see how we find the best line!');
  };

  const startVisualization = () => {
    if (points.length < 2) {
      setExplanation('Add at least 2 points first by clicking on the canvas!');
      return;
    }

    setIsRunning(true);
    setStep(0);
    runNextStep();
  };

  const runNextStep = () => {
    setStep(prevStep => {
      const newStep = prevStep + 1;
      
      // Clear previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      switch(newStep) {
        case 1:
          setExplanation('Step 1: First, we look at our data points. Notice any pattern?');
          timeoutRef.current = setTimeout(runNextStep, 2500);
          break;

        case 2:
          setExplanation('Step 2: We\'ll try to find a line that best fits these points...');
          // Start with average slope
          const firstPoint = points[0];
          const lastPoint = points[points.length - 1];
          const initialSlope = (lastPoint.y - firstPoint.y) / (lastPoint.x - firstPoint.x);
          const initialIntercept = firstPoint.y - (initialSlope * firstPoint.x);
          setLine({ slope: initialSlope, intercept: initialIntercept });
          timeoutRef.current = setTimeout(runNextStep, 2500);
          break;

        case 3:
          setExplanation('Step 3: We measure how far each point is from our line. These are called "errors".');
          timeoutRef.current = setTimeout(runNextStep, 2500);
          break;

        case 4:
          setExplanation('Step 4: Now we adjust our line to make these errors smaller...');
          // Improve the line fit
          const meanX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
          const meanY = points.reduce((sum, p) => sum + p.y, 0) / points.length;
          
          let numerator = 0;
          let denominator = 0;
          
          points.forEach(point => {
            numerator += (point.x - meanX) * (point.y - meanY);
            denominator += (point.x - meanX) * (point.x - meanX);
          });
          
          const newSlope = numerator / denominator;
          const newIntercept = meanY - (newSlope * meanX);
          
          setLine({ slope: newSlope, intercept: newIntercept });
          timeoutRef.current = setTimeout(runNextStep, 2500);
          break;

        case 5:
          setExplanation('Final Step: This is our best-fitting line! It minimizes the total error between the line and all points.');
          setIsRunning(false);
          break;

        default:
          setIsRunning(false);
          break;
      }

      return newStep;
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    clearCanvas(ctx, canvas.width, canvas.height);

    // Draw coordinate system
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    
    // Draw grid
    for (let i = 0; i < canvas.width; i += 50) {
      drawLine(ctx, i, 0, i, canvas.height, '#e5e7eb', 1);
    }
    for (let i = 0; i < canvas.height; i += 50) {
      drawLine(ctx, 0, i, canvas.width, i, '#e5e7eb', 1);
    }

    // Draw points
    points.forEach((point, index) => {
      drawPoint(ctx, point.x, point.y, '#3b82f6', 10);
      
      // Label points
      ctx.fillStyle = '#1f2937';
      ctx.font = '16px Arial';
      ctx.fillText(`P${index + 1}`, point.x + 15, point.y - 15);
    });

    // Draw regression line if we're past step 1
    if (step > 1) {
      const startX = 0;
      const endX = canvas.width;
      const startY = line.slope * startX + line.intercept;
      const endY = line.slope * endX + line.intercept;
      drawLine(ctx, startX, startY, endX, endY, '#ef4444', 3);
    }

    // Draw error lines in step 3
    if (step === 3) {
      points.forEach(point => {
        const predictedY = line.slope * point.x + line.intercept;
        drawLine(ctx, point.x, point.y, point.x, predictedY, '#9ca3af', 2);
      });
    }

  }, [points, step, line]);

  return (
    <div className="container mx-auto p-3 max-w-5xl">
      <div className="space-y-3">
        {/* Controls */}
        <div className="flex justify-center space-x-3">
          <button
            onClick={startVisualization}
            disabled={isRunning || points.length < 2}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-base font-medium disabled:opacity-50"
          >
            Start
          </button>
          
          <button
            onClick={generateExample}
            disabled={isRunning}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md text-base font-medium disabled:opacity-50"
          >
            Show Example
          </button>
          
          <button
            onClick={reset}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md text-base font-medium"
          >
            Reset
          </button>
        </div>

        {/* Explanation Box */}
        <div className="bg-blue-50 p-3 rounded-md text-lg text-center">
          {explanation}
        </div>

        {/* Canvas */}
        <div className="bg-white rounded-md shadow-md p-3">
          <canvas
            ref={canvasRef}
            width={750}
            height={375}
            className="w-full border border-gray-200 rounded-md cursor-crosshair"
            onClick={(e) => {
              if (!isRunning) {
                const rect = e.target.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const scaleX = e.target.width / rect.width;
                const scaleY = e.target.height / rect.height;
                setPoints(prev => [...prev, { 
                  x: x * scaleX, 
                  y: y * scaleY 
                }]);
              }
            }}
          />
        </div>

        {/* Instructions - More readable but still compact */}
        <div className="bg-gray-50 p-3 rounded-md text-sm">
          <span className="font-medium">How to use: </span>
          <span>1. Click to add points or use "Show Example" • </span>
          <span>2. Click "Start" to see the regression • </span>
          <span>3. Watch the line fit • </span>
          <span>4. Use "Reset" to start over</span>
        </div>
      </div>
    </div>
  );
};

export default LinearRegressionVisualizer; 