import React, { useState, useRef, useEffect } from 'react';
import { kmeans } from '../algorithms/clusteringAlgorithms';
import { colorThemes, clearCanvas, drawPoint, drawLine } from '../utils/canvasUtils';
import Instructions from '../../common/Instructions';
import AlgorithmDrawer from '../../AlgorithmDrawer';

const KMeansVisualizer = () => {
  const [points, setPoints] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [k, setK] = useState(3);
  const [pointSize, setPointSize] = useState(6);
  const [showConnections, setShowConnections] = useState(false);
  const [theme, setTheme] = useState('default');
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(10);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  
  const canvasRef = useRef(null);
  const pauseRef = useRef(false);
  const cleanupRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const colors = colorThemes[theme];

    clearCanvas(ctx, canvas.width, canvas.height);

    points.forEach(point => {
      const color = point.cluster !== undefined ? colors.clusters[point.cluster] : colors.point;
      drawPoint(ctx, point.x, point.y, color, pointSize);
    });

    if (clusters.length > 0) {
      clusters.forEach((center, i) => {
        drawPoint(ctx, center.x, center.y, colors.clusters[i], pointSize * 1.5);

        if (showConnections) {
          points.forEach(point => {
            if (point.cluster === i) {
              drawLine(ctx, point.x, point.y, center.x, center.y, colors.clusters[i], 1);
            }
          });
        }
      });
    }
  }, [points, clusters, showConnections, theme, pointSize]);

  const generateRandomPoints = (count = 20) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const newPoints = [];
    const padding = 50 * scaleX;
    
    for (let i = 0; i < k; i++) {
      const centerX = padding + Math.random() * (canvas.width - 2 * padding);
      const centerY = padding + Math.random() * (canvas.height - 2 * padding);
      
      for (let j = 0; j < count/k; j++) {
        newPoints.push({
          x: centerX + (Math.random() - 0.5) * 100 * scaleX,
          y: centerY + (Math.random() - 0.5) * 100 * scaleY
        });
      }
    }
    
    setPoints(prevPoints => [...prevPoints, ...newPoints]);
  };

  const handleStart = async () => {
    if (isRunning && !isPaused) return;
    
    setIsRunning(true);
    setPaused(false);
    pauseRef.current = false;

    try {
      if (typeof cleanupRef.current === 'function') {
        cleanupRef.current();
        cleanupRef.current = null;
      }

      const cleanup = await kmeans(points, k, setClusters, speed, () => {
        setIsRunning(false);
        setPaused(false);
        pauseRef.current = false;
        cleanupRef.current = null;
        analyzeResults();
      }, () => pauseRef.current);

      cleanupRef.current = cleanup;
    } catch (error) {
      console.error('Visualization error:', error);
      setIsRunning(false);
      setPaused(false);
      cleanupRef.current = null;
    }
  };

  const handlePause = () => {
    setPaused(!isPaused);
    pauseRef.current = !pauseRef.current;
  };

  const handleStop = () => {
    if (typeof cleanupRef.current === 'function') {
      cleanupRef.current();
      cleanupRef.current = null;
    }
    setIsRunning(false);
    setPaused(false);
    pauseRef.current = false;
    setClusters([]);
    setAnalysisResult(null);
  };

  const analyzeResults = () => {
    if (!clusters.length) return;

    const pointsPerCluster = clusters.map((_, i) => 
      points.filter(p => p.cluster === i).length
    );

    const avgDistances = clusters.map((center, i) => {
      const clusterPoints = points.filter(p => p.cluster === i);
      if (clusterPoints.length === 0) return 0;
      const avgDist = clusterPoints.reduce((sum, p) => 
        sum + Math.hypot(p.x - center.x, p.y - center.y), 0) / clusterPoints.length;
      return avgDist.toFixed(2);
    });

    setAnalysisResult({
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
            { name: "Cluster Density", value: (points.length / k).toFixed(2) + ' points/cluster' }
          ]
        }
      ]
    });
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
                min="1"
                max="20"
                value={speed}
                onChange={(e) => setSpeed(parseInt(e.target.value))}
                disabled={isRunning && !isPaused}
                className="w-32"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={handleStart}
              disabled={isRunning && !isPaused}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md font-medium disabled:opacity-50"
            >
              {isPaused ? 'Resume' : 'Start'}
            </button>

            <button
              onClick={handlePause}
              disabled={!isRunning}
              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md font-medium disabled:opacity-50"
            >
              {isPaused ? 'Paused' : 'Pause'}
            </button>

            <button
              onClick={handleStop}
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
              min="2"
              max="10"
              value={k}
              onChange={(e) => setK(Math.min(Math.max(parseInt(e.target.value) || 2, 2), 10))}
              disabled={isRunning}
              className="w-16 px-2 py-1 border rounded-md"
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => generateRandomPoints(20)}
              disabled={isRunning}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-md font-medium disabled:opacity-50"
            >
              Generate Points
            </button>

            <button
              onClick={() => setPoints([])}
              disabled={isRunning}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md font-medium disabled:opacity-50"
            >
              Clear Points
            </button>

            <button
              onClick={() => setShowConnections(!showConnections)}
              className={`px-4 py-2 rounded-md font-medium ${
                showConnections ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-500 hover:bg-gray-600'
              } text-white`}
            >
              {showConnections ? 'Hide Connections' : 'Show Connections'}
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
                  if (!isRunning) {
                    const canvas = canvasRef.current;
                    const rect = e.target.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const scaleX = canvas.width / rect.width;
                    const scaleY = canvas.height / rect.height;
                    setPoints(prevPoints => [...prevPoints, { 
                      x: x * scaleX, 
                      y: y * scaleY 
                    }]);
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
    </div>
  );
};

export default KMeansVisualizer; 