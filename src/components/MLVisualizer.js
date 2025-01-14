import React, { useState, useEffect, useRef } from 'react';
import { kmeans, knn, linearRegression } from '../algorithms/mlAlgorithms';
import AlgorithmDrawer from './AlgorithmDrawer';
import Instructions from './common/Instructions';

const MLVisualizer = () => {
  const [algorithm, setAlgorithm] = useState('kmeans');
  const [points, setPoints] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [k, setK] = useState(3);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(10);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [pointCount, setPointCount] = useState(20);
  const [showGrid, setShowGrid] = useState(true);
  const [pointSize, setPointSize] = useState(6);
  const [selectedPoints, setSelectedPoints] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showVoronoi, setShowVoronoi] = useState(false);
  const [showConnections, setShowConnections] = useState(false);
  const [theme, setTheme] = useState('default');
  const pauseRef = useRef(false);
  const [analysisResult, setAnalysisResult] = useState('');

  const colorThemes = {
    default: (i) => `hsl(${(i * 360) / k}, 70%, 50%)`,
    pastel: (i) => `hsl(${(i * 360) / k}, 70%, 85%)`,
    vibrant: (i) => `hsl(${(i * 360) / k}, 100%, 60%)`,
    monochrome: (i) => `hsl(220, 70%, ${40 + (i * 40) / k}%)`
  };

  const handleCanvasClick = (e) => {
    if (isRunning) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Get click coordinates relative to canvas
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert to canvas scale
    const canvasX = (x / rect.width) * canvas.width;
    const canvasY = (y / rect.height) * canvas.height;
    
    setPoints(prevPoints => [...prevPoints, { x: canvasX, y: canvasY }]);
  };

  const clearCanvas = () => {
    setPoints([]);
    setClusters([]);
    setIsRunning(false);
    setPaused(false);
  };

  const handleStart = () => {
    if (points.length < k) {
      alert(`Please add at least ${k} points`);
      return;
    }

    setIsRunning(true);
    setPaused(false);
    pauseRef.current = false;

    const algorithms = {
      kmeans,
      knn,
      linearRegression
    };

    if (animationRef.current) {
      animationRef.current();
    }

    animationRef.current = algorithms[algorithm](
      points,
      k,
      setClusters,
      speed,
      () => {
        setIsRunning(false);
        setPaused(false);
        pauseRef.current = false;
        animationRef.current = null;
      },
      () => pauseRef.current
    );
  };

  const handlePause = () => {
    setPaused(!isPaused);
    pauseRef.current = !pauseRef.current;
  };

  const handleStop = () => {
    if (animationRef.current) {
      animationRef.current();
      animationRef.current = null;
    }
    setIsRunning(false);
    setPaused(false);
    pauseRef.current = false;
    setClusters([]);
  };

  const generateRandomPoints = (count = pointCount) => {
    if (isRunning) return;
    
    const canvas = canvasRef.current;
    const newPoints = [];
    const padding = 50;
    
    // Generate points in patterns based on algorithm
    switch (algorithm) {
      case 'kmeans':
        // Generate clustered points
        for (let i = 0; i < k; i++) {
          const centerX = padding + Math.random() * (canvas.width - 2 * padding);
          const centerY = padding + Math.random() * (canvas.height - 2 * padding);
          
          for (let j = 0; j < count/k; j++) {
            newPoints.push({
              x: centerX + (Math.random() - 0.5) * 100,
              y: centerY + (Math.random() - 0.5) * 100
            });
          }
        }
        break;
        
      case 'linearRegression':
        // Generate points with linear correlation
        const slope = Math.random() - 0.5;
        const noise = 50;
        for (let i = 0; i < count; i++) {
          const x = padding + Math.random() * (canvas.width - 2 * padding);
          const y = slope * x + (Math.random() - 0.5) * noise;
          newPoints.push({ x, y });
        }
        break;
        
      default:
        // Random distribution
        for (let i = 0; i < count; i++) {
          newPoints.push({
            x: padding + Math.random() * (canvas.width - 2 * padding),
            y: padding + Math.random() * (canvas.height - 2 * padding)
          });
        }
    }
    
    setPoints(prevPoints => [...prevPoints, ...newPoints]);
  };

  const handleCanvasMouseDown = (e) => {
    if (isRunning) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width * canvas.width;
    const y = (e.clientY - rect.top) / rect.height * canvas.height;
    
    // Check if clicking near existing point for deletion
    const clickedPoint = points.find(p => 
      Math.hypot(p.x - x, p.y - y) < pointSize * 2
    );

    if (e.shiftKey && clickedPoint) {
      setPoints(points.filter(p => p !== clickedPoint));
    } else {
      setPoints([...points, { x, y }]);
    }
    
    setIsDragging(true);
  };

  const handleCanvasMouseMove = (e) => {
    if (!isDragging || isRunning) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width * canvas.width;
    const y = (e.clientY - rect.top) / rect.height * canvas.height;
    
    if (!e.shiftKey) {
      setPoints([...points, { x, y }]);
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  const handleKChange = (e) => {
    const value = parseInt(e.target.value);
    if (isNaN(value)) return;
    
    // Clamp value between 2 and 10
    const clampedValue = Math.min(Math.max(value, 2), 10);
    setK(clampedValue);
    
    // If user tried to input a value > 10, show feedback
    if (value > 10) {
      alert('Maximum K value is 10');
    }
  };

  const analyzeResults = () => {
    let analysis = {};

    switch (algorithm) {
      case 'kmeans':
        const avgDistances = clusters.map((center, i) => {
          const clusterPoints = points.filter(p => p.cluster === i);
          if (clusterPoints.length === 0) return 0;
          const avgDist = clusterPoints.reduce((sum, p) => 
            sum + Math.hypot(p.x - center.x, p.y - center.y), 0) / clusterPoints.length;
          return avgDist.toFixed(2);
        });

        const pointsPerCluster = clusters.map((_, i) => 
          points.filter(p => p.cluster === i).length
        );

        analysis = {
          title: "K-means Clustering Analysis",
          metrics: [
            {
              label: "Cluster Information",
              items: [
                { name: "Number of Clusters", value: k },
                { name: "Total Points", value: points.length },
                { name: "Points per Cluster", value: pointsPerCluster.join(', ') },
                { name: "Distribution Range", value: `${Math.min(...pointsPerCluster)} to ${Math.max(...pointsPerCluster)} points` }
              ]
            },
            {
              label: "Quality Metrics",
              items: [
                { name: "Average Distances to Centroids", value: avgDistances.join(', ') },
                { name: "Convergence Status", value: clusters.length > 0 ? 'Complete' : 'Not converged' },
                { name: "Cluster Density", value: (points.length / k).toFixed(2) + ' points/cluster' }
              ]
            }
          ]
        };
        break;

      case 'knn':
        const uniqueClasses = new Set(points.filter(p => p.cluster !== undefined).map(p => p.cluster));
        const coverage = ((clusters.length / (800 * 450)) * 100).toFixed(2);
        
        analysis = {
          title: "K-Nearest Neighbors Analysis",
          metrics: [
            {
              label: "Classification Details",
              items: [
                { name: "K Neighbors", value: k },
                { name: "Number of Classes", value: uniqueClasses.size },
                { name: "Training Points", value: points.length }
              ]
            },
            {
              label: "Coverage Metrics",
              items: [
                { name: "Space Coverage", value: `${coverage}%` },
                { name: "Classification Status", value: clusters.length > 0 ? 'Complete' : 'In Progress' },
                { name: "Points per Class", value: Math.round(points.length / uniqueClasses.size) }
              ]
            }
          ]
        };
        break;

      case 'linearRegression':
        if (clusters.length >= 2) {
          const [start, end] = clusters;
          const slope = (end.y - start.y) / (end.x - start.x);
          const intercept = start.y - slope * start.x;
          const r2 = calculateR2(points, slope, intercept);
          
          analysis = {
            title: "Linear Regression Analysis",
            metrics: [
              {
                label: "Regression Line",
                items: [
                  { name: "Slope", value: slope.toFixed(4) },
                  { name: "Y-intercept", value: intercept.toFixed(2) },
                  { name: "Equation", value: `y = ${slope.toFixed(2)}x + ${intercept.toFixed(2)}` }
                ]
              },
              {
                label: "Fit Quality",
                items: [
                  { name: "R² Score", value: r2.toFixed(4) },
                  { name: "Number of Points", value: points.length },
                  { name: "Fit Quality", value: r2 > 0.8 ? 'Good' : r2 > 0.5 ? 'Moderate' : 'Poor' }
                ]
              }
            ]
          };
        }
        break;

      default:
        analysis = null;
    }

    setAnalysisResult(analysis);
  };

  // Calculate R² for linear regression
  const calculateR2 = (points, slope, intercept) => {
    if (points.length < 2) return 0;
    
    const yMean = points.reduce((sum, p) => sum + p.y, 0) / points.length;
    const ssTotal = points.reduce((sum, p) => sum + Math.pow(p.y - yMean, 2), 0);
    const ssResidual = points.reduce((sum, p) => {
      const yPred = slope * p.x + intercept;
      return sum + Math.pow(p.y - yPred, 2);
    }, 0);
    
    return 1 - (ssResidual / ssTotal);
  };

  useEffect(() => {
    if (!isRunning && clusters.length > 0) {
      analyzeResults();
    }
  }, [isRunning, clusters, points, k, algorithm]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = '#f0f0f0';
      ctx.lineWidth = 1;
      
      for (let x = 0; x <= canvas.width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      
      for (let y = 0; y <= canvas.height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    }

    // Draw connections between points and their centroids
    if (showConnections && algorithm === 'kmeans' && clusters.length > 0) {
      ctx.strokeStyle = '#ddd';
      ctx.lineWidth = 0.5;
      points.forEach(point => {
        if (point.cluster !== undefined) {
          const centroid = clusters[point.cluster];
          ctx.beginPath();
          ctx.moveTo(point.x, point.y);
          ctx.lineTo(centroid.x, centroid.y);
          ctx.stroke();
        }
      });
    }
    
    // Draw points with shadows
    points.forEach(point => {
      ctx.beginPath();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
      ctx.shadowBlur = 4;
      ctx.arc(point.x, point.y, pointSize, 0, 2 * Math.PI);
      ctx.fillStyle = point.cluster !== undefined 
        ? colorThemes[theme](point.cluster)
        : '#666';
      ctx.fill();
      ctx.shadowColor = 'transparent';
    });

    // Draw cluster centroids with distinctive style
    clusters.forEach((center, i) => {
      // Draw outer ring
      ctx.beginPath();
      ctx.arc(center.x, center.y, pointSize * 2, 0, 2 * Math.PI);
      ctx.strokeStyle = colorThemes[theme](i);
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw inner circle
      ctx.beginPath();
      ctx.arc(center.x, center.y, pointSize * 1.2, 0, 2 * Math.PI);
      ctx.fillStyle = colorThemes[theme](i);
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();

      // Draw center dot
      ctx.beginPath();
      ctx.arc(center.x, center.y, pointSize * 0.5, 0, 2 * Math.PI);
      ctx.fillStyle = 'white';
      ctx.fill();
    });

    // Draw regression line for linear regression
    if (algorithm === 'linearRegression' && clusters.length === 2) {
      const [start, end] = clusters;
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

  }, [points, clusters, k, showGrid, pointSize, showConnections, theme, algorithm]);

  return (
    <div className="pt-4 px-4 pb-20">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">
          Machine Learning Visualizer
        </h1>

        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4">
              <button
                onClick={handleStart}
                disabled={isRunning && !isPaused}
                className={`px-4 py-2 rounded-md font-medium ${
                  isRunning && !isPaused
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {isPaused ? 'Resume' : 'Start'}
              </button>
              
              <button
                onClick={handlePause}
                disabled={!isRunning}
                className={`px-4 py-2 rounded-md font-medium ${
                  !isRunning
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                }`}
              >
                {isPaused ? 'Paused' : 'Pause'}
              </button>
              
              <button
                onClick={handleStop}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md font-medium"
              >
                Stop
              </button>

              <button
                onClick={clearCanvas}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md font-medium"
              >
                Clear
              </button>

              <button
                onClick={() => generateRandomPoints(20)}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-md font-medium flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Random Points
              </button>
            </div>

            <div className="flex gap-4 items-center">
              <select
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value)}
                disabled={isRunning}
                className="px-4 py-2 border rounded-md"
              >
                <option value="kmeans">K-means Clustering</option>
                <option value="knn">K-Nearest Neighbors</option>
                <option value="linearRegression">Linear Regression</option>
              </select>

              <div className="flex items-center gap-2">
                <span className="text-gray-700">K:</span>
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={k}
                  onChange={handleKChange}
                  onBlur={() => {
                    // Also clamp value on blur
                    setK(Math.min(Math.max(k, 2), 10));
                  }}
                  disabled={isRunning || algorithm === 'linearRegression'}
                  className="w-16 px-2 py-1 border rounded-md"
                />
                <span className="text-xs text-gray-500">(2-10)</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-gray-700">Speed:</span>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={speed}
                  onChange={(e) => setSpeed(parseInt(e.target.value))}
                  className="w-32"
                />
              </div>

              <button
                onClick={() => setIsDrawerOpen(true)}
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-md font-medium"
              >
                Algorithm Info
              </button>

              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="px-4 py-2 border rounded-md"
              >
                <option value="default">Default Colors</option>
                <option value="pastel">Pastel</option>
                <option value="vibrant">Vibrant</option>
                <option value="monochrome">Monochrome</option>
              </select>

              {algorithm === 'kmeans' && (
                <>
                  <button
                    onClick={() => setShowConnections(!showConnections)}
                    className={`px-4 py-2 rounded-md font-medium ${
                      showConnections ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-500 hover:bg-gray-600'
                    } text-white`}
                  >
                    {showConnections ? 'Hide Connections' : 'Show Connections'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="aspect-[16/9] w-full relative">
            <canvas
              ref={canvasRef}
              width={800}
              height={450}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
              className="w-full h-full absolute top-0 left-0 border border-gray-200 rounded cursor-crosshair"
              style={{ 
                background: 'white',
                touchAction: 'none'
              }}
            />
          </div>
        </div>

        <div className="mt-3 text-center text-sm text-gray-600">
          <p>
            Click to add points. Hold and drag to draw points. 
            Hold Shift + Click to delete points. 
            {algorithm === 'kmeans' && ' Toggle connections to see centroid relationships.'}
          </p>
        </div>

        {/* Analysis Results Panel */}
        {analysisResult && (
          <div className="mt-4 bg-white rounded-lg shadow-md p-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {analysisResult.title}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysisResult.metrics.map((section, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-700 mb-3">
                    {section.label}
                  </h4>
                  <div className="space-y-2">
                    {section.items.map((item, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <span className="text-gray-600">{item.name}:</span>
                        <span className="font-mono text-gray-800 bg-white px-2 py-1 rounded">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <AlgorithmDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          algorithm={algorithm}
          type="ml"
        />
      </div>
      <Instructions type="ml" />
    </div>
  );
};

export default MLVisualizer; 