import React, { useState, useRef, useEffect } from 'react';
import { colorThemes, clearCanvas, drawPoint, drawLine } from '../utils/canvasUtils';
import Instructions from '../../common/Instructions';
import AlgorithmDrawer from '../../AlgorithmDrawer';

const KNNVisualizer = () => {
  const [points, setPoints] = useState([]);
  const [testPoint, setTestPoint] = useState(null);
  const [nearestNeighbors, setNearestNeighbors] = useState([]);
  const [k, setK] = useState(3);
  const [currentClass, setCurrentClass] = useState(0);
  const [theme, setTheme] = useState('default');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [step, setStep] = useState(0);
  const [explanation, setExplanation] = useState('');
  
  const canvasRef = useRef(null);
  const maxClasses = 5;
  const intervalRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const colors = colorThemes[theme];

    // Clear and draw points
    clearCanvas(ctx, canvas.width, canvas.height);

    // Draw training points
    points.forEach(point => {
      drawPoint(ctx, point.x, point.y, colors.clusters[point.cluster], 10);
      // Add class label
      ctx.fillStyle = '#000';
      ctx.font = '12px Arial';
      ctx.fillText(`C${point.cluster}`, point.x + 12, point.y + 12);
    });

    // Draw test point and its connections if exists
    if (testPoint) {
      // Draw lines to nearest neighbors
      nearestNeighbors.forEach(neighbor => {
        drawLine(ctx, testPoint.x, testPoint.y, neighbor.x, neighbor.y, '#666', 1);
      });

      // Draw the test point
      const predictedClass = getPredictedClass();
      drawPoint(ctx, testPoint.x, testPoint.y, colors.clusters[predictedClass], 12);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Add "Test" label
      ctx.fillStyle = '#000';
      ctx.font = 'bold 14px Arial';
      ctx.fillText(`Test → C${predictedClass}`, testPoint.x + 15, testPoint.y - 15);
    }
  }, [points, testPoint, nearestNeighbors, theme, step]);

  const getPredictedClass = () => {
    if (!nearestNeighbors.length) return 0;
    const votes = Array(maxClasses).fill(0);
    nearestNeighbors.forEach(n => votes[n.cluster]++);
    return votes.indexOf(Math.max(...votes));
  };

  const findNearestNeighbors = (point) => {
    return points
      .map(p => ({
        ...p,
        distance: Math.hypot(p.x - point.x, p.y - point.y)
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, k);
  };

  const generateRandomPoints = (count = 20) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const newPoints = [];
    const padding = 50 * scaleX;
    
    for (let classIndex = 0; classIndex < maxClasses; classIndex++) {
      const centerX = padding + Math.random() * (canvas.width - 2 * padding);
      const centerY = padding + Math.random() * (canvas.height - 2 * padding);
      
      for (let j = 0; j < count/maxClasses; j++) {
        newPoints.push({
          x: centerX + (Math.random() - 0.5) * 100 * scaleX,
          y: centerY + (Math.random() - 0.5) * 100 * scaleY,
          cluster: classIndex
        });
      }
    }
    
    setPoints(prevPoints => [...prevPoints, ...newPoints]);
    setTestPoint(null);
    setNearestNeighbors([]);
    setAnalysisResult(null);
  };

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const newPoint = { 
      x: x * scaleX, 
      y: y * scaleY 
    };

    setTestPoint(newPoint);
    setNearestNeighbors(findNearestNeighbors(newPoint));
    analyzeResults(newPoint);
  };

  const analyzeResults = (point) => {
    if (!points.length || !point) return;

    const neighbors = findNearestNeighbors(point);
    if (!neighbors.length) return;

    const predictedClass = getPredictedClass();
    const pointsPerClass = Array(maxClasses).fill(0);
    points.forEach(p => pointsPerClass[p.cluster]++);

    const neighborClasses = Array(maxClasses).fill(0);
    neighbors.forEach(n => neighborClasses[n.cluster]++);

    setAnalysisResult({
      title: "KNN Classification Analysis",
      metrics: [
        {
          label: "Classification Result",
          items: [
            { name: "Predicted Class", value: `Class ${predictedClass}` },
            { name: "K Nearest Neighbors", value: `${k} points` },
            { name: "Neighbor Classes", value: neighborClasses.map((count, i) => 
              count > 0 ? `C${i}: ${count}` : '').filter(Boolean).join(', ') }
          ]
        },
        {
          label: "Dataset Information",
          items: [
            { name: "Total Points", value: points.length },
            { name: "Points per Class", value: pointsPerClass.map((count, i) => 
              `C${i}: ${count}`).join(', ') }
          ]
        }
      ]
    });
  };

  const startVisualization = () => {
    if (isRunning || !points.length) return;
    
    setIsRunning(true);
    setIsPaused(false);
    setStep(0);
    
    // Create a test point if none exists
    const canvas = canvasRef.current;
    const padding = 50;
    const newTestPoint = {
      x: padding + Math.random() * (canvas.width - 2 * padding),
      y: padding + Math.random() * (canvas.height - 2 * padding)
    };
    setTestPoint(newTestPoint);
    setNearestNeighbors([]);
    
    // Step-by-step visualization
    let currentK = 0;
    intervalRef.current = setInterval(() => {
      if (currentK < k) {
        const allNeighbors = points
          .map(p => ({
            ...p,
            distance: Math.hypot(p.x - newTestPoint.x, p.y - newTestPoint.y)
          }))
          .sort((a, b) => a.distance - b.distance);
        
        setNearestNeighbors(allNeighbors.slice(0, currentK + 1));
        currentK++;
        
        // Update step and explanation
        setStep(currentK);
        updateExplanation(currentK, allNeighbors.slice(0, currentK + 1));
      } else {
        clearInterval(intervalRef.current);
        const finalNeighbors = findNearestNeighbors(newTestPoint);
        setNearestNeighbors(finalNeighbors);
        analyzeResults(newTestPoint);
        setStep(k + 1);
        updateExplanation(k + 1, finalNeighbors);
        setIsRunning(false);
      }
    }, speed);
  };

  const pauseVisualization = () => {
    if (!isRunning) return;
    setIsPaused(!isPaused);
    if (isPaused) {
      startVisualization();
    } else {
      clearInterval(intervalRef.current);
    }
  };

  const stopVisualization = () => {
    setIsRunning(false);
    setIsPaused(false);
    clearInterval(intervalRef.current);
    setTestPoint(null);
    setNearestNeighbors([]);
  };

  const updateExplanation = (currentStep, neighbors) => {
    if (currentStep === 0) {
      setExplanation("Step 1: Added a new test point (black). We'll find its K nearest neighbors.");
    } else if (currentStep < k) {
      const classes = neighbors.reduce((acc, n) => {
        acc[n.cluster] = (acc[n.cluster] || 0) + 1;
        return acc;
      }, {});
      
      setExplanation(
        `Step ${currentStep + 1}: Found ${currentStep} nearest neighbor${currentStep > 1 ? 's' : ''}. ` +
        `Current votes: ${Object.entries(classes)
          .map(([cls, count]) => `Class ${cls}: ${count}`)
          .join(', ')}`
      );
    } else {
      const prediction = getPredictedClass();
      setExplanation(
        `Final Step: Classification complete! ` +
        `The test point is classified as Class ${prediction} ` +
        `based on majority voting among ${k} nearest neighbors.`
      );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-700">Speed:</span>
              <input
                type="range"
                min="100"
                max="2000"
                step="100"
                value={speed}
                onChange={(e) => setSpeed(parseInt(e.target.value))}
                disabled={isRunning}
                className="w-32"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={startVisualization}
              disabled={isRunning}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md font-medium disabled:opacity-50"
            >
              Start
            </button>

            <button
              onClick={pauseVisualization}
              disabled={!isRunning}
              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md font-medium disabled:opacity-50"
            >
              {isPaused ? 'Resume' : 'Pause'}
            </button>

            <button
              onClick={stopVisualization}
              disabled={!isRunning}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md font-medium disabled:opacity-50"
            >
              Stop
            </button>

            <button
              onClick={() => setIsDrawerOpen(true)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md font-medium"
            >
              Instructions
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="text-gray-700">K:</span>
            <input
              type="number"
              min="1"
              max="10"
              value={k}
              onChange={(e) => setK(Math.min(Math.max(parseInt(e.target.value) || 1, 1), 10))}
              className="w-16 px-2 py-1 border rounded-md"
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => generateRandomPoints(20)}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-md font-medium"
            >
              Generate Points
            </button>

            <button
              onClick={() => {
                setPoints([]);
                setTestPoint(null);
                setNearestNeighbors([]);
              }}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md font-medium"
            >
              Clear All
            </button>

            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="px-4 py-2 border rounded-md"
            >
              <option value="default">Default Colors</option>
              <option value="pastel">Pastel</option>
              <option value="vibrant">Vibrant</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-700">Add Training Point:</span>
            <div className="flex gap-1">
              {Array.from({ length: maxClasses }, (_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setCurrentClass(i);
                    setTestPoint(null);
                  }}
                  className={`w-8 h-8 rounded-full ${
                    currentClass === i ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                  }`}
                  style={{ backgroundColor: colorThemes[theme].clusters[i] }}
                />
              ))}
            </div>
          </div>
        </div>
        
        <div className="w-full max-w-6xl mx-auto">
          <div className="mt-4 bg-white rounded-lg shadow-md p-4">
            <div className="aspect-[16/9] w-full relative">
              <canvas
                ref={canvasRef}
                width={800}
                height={450}
                className="w-full h-full absolute top-0 left-0 border border-gray-200 rounded cursor-crosshair"
                style={{ background: 'white' }}
                onClick={(e) => {
                  const canvas = canvasRef.current;
                  const rect = e.target.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  const scaleX = canvas.width / rect.width;
                  const scaleY = canvas.height / rect.height;
                  
                  if (testPoint) {
                    // Add training point
                    setPoints(prevPoints => [...prevPoints, { 
                      x: testPoint.x, 
                      y: testPoint.y,
                      cluster: getPredictedClass()
                    }]);
                    setTestPoint(null);
                    setNearestNeighbors([]);
                  } else {
                    // Add test point
                    handleCanvasClick(e);
                  }
                }}
              />
            </div>
          </div>
        </div>

        {analysisResult && (
          <div className="mt-6 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">{analysisResult.title}</h3>
            {analysisResult.metrics.map((section, i) => (
              <div key={i} className="mb-4 last:mb-0">
                <h4 className="text-lg font-medium mb-2">{section.label}</h4>
                <div className="grid grid-cols-2 gap-4">
                  {section.items.map((item, j) => (
                    <div key={j} className="flex justify-between">
                      <span className="text-gray-600">{item.name}:</span>
                      <span className="font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AlgorithmDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        type="ml"
      />
      <Instructions type="ml" />

      {/* Explanation Panel */}
      <div className="mt-4 bg-blue-50 p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">KNN Visualization Steps</h3>
        <p className="text-gray-700">{explanation}</p>
      </div>

      {/* Legend */}
      <div className="mt-4 bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Legend</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-black"></div>
            <span>Test Point</span>
          </div>
          {Array.from({ length: maxClasses }, (_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: colorThemes[theme].clusters[i] }}
              ></div>
              <span>Class {i}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KNNVisualizer; 