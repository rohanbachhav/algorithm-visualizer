import React, { useState, useRef, useEffect } from 'react';
import BaseVisualizer from '../common/BaseVisualizer';
import { kmeans, dbscan, hierarchicalClustering } from '../algorithms/clusteringAlgorithms';

const algorithms = {
  kmeans: 'K-means Clustering',
  dbscan: 'DBSCAN',
  hierarchicalClustering: 'Hierarchical Clustering'
};

const ClusteringVisualizer = () => {
  const [points, setPoints] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [k, setK] = useState(3);
  const [epsilon, setEpsilon] = useState(50); // For DBSCAN
  const [minPoints, setMinPoints] = useState(4); // For DBSCAN
  const [pointSize, setPointSize] = useState(6);
  const [showConnections, setShowConnections] = useState(false);
  const [theme, setTheme] = useState('default');
  
  const canvasRef = useRef(null);

  const generateRandomPoints = (count = 20) => {
    const canvas = canvasRef.current;
    const newPoints = [];
    const padding = 50;
    
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
    
    setPoints(prevPoints => [...prevPoints, ...newPoints]);
  };

  const handleVisualize = async (algorithm, speed, isPaused, onComplete) => {
    let isActive = true;
    
    const algorithmMap = {
      kmeans: () => kmeans(points, k, setClusters, speed, onComplete, isPaused),
      dbscan: () => dbscan(points, epsilon, minPoints, setClusters, speed, onComplete, isPaused),
      hierarchicalClustering: () => hierarchicalClustering(points, k, setClusters, speed, onComplete, isPaused)
    };

    try {
      const cleanup = await algorithmMap[algorithm]?.();
      return () => {
        isActive = false;
        if (typeof cleanup === 'function') {
          cleanup();
        }
      };
    } catch (error) {
      console.error('Algorithm error:', error);
      return () => { isActive = false; };
    }
  };

  const renderControls = ({ algorithm, isRunning }) => (
    <div className="mt-4 flex flex-wrap gap-4 items-center">
      <div className="flex items-center gap-2">
        {algorithm === 'kmeans' && (
          <>
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
          </>
        )}
        {algorithm === 'dbscan' && (
          <>
            <span className="text-gray-700">Epsilon:</span>
            <input
              type="number"
              min="10"
              max="200"
              value={epsilon}
              onChange={(e) => setEpsilon(parseInt(e.target.value))}
              disabled={isRunning}
              className="w-20 px-2 py-1 border rounded-md"
            />
            <span className="text-gray-700 ml-4">Min Points:</span>
            <input
              type="number"
              min="2"
              max="10"
              value={minPoints}
              onChange={(e) => setMinPoints(parseInt(e.target.value))}
              disabled={isRunning}
              className="w-16 px-2 py-1 border rounded-md"
            />
          </>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => generateRandomPoints(20)}
          disabled={isRunning}
          className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-md font-medium"
        >
          Generate Points
        </button>

        <button
          onClick={() => setPoints([])}
          disabled={isRunning}
          className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md font-medium"
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
  );

  // ... Canvas rendering code ...

  return (
    <BaseVisualizer
      algorithms={algorithms}
      defaultAlgorithm="kmeans"
      onVisualize={handleVisualize}
      renderControls={renderControls}
      renderCanvas={renderCanvas}
      analyzeResults={analyzeResults}
    />
  );
};

export default ClusteringVisualizer; 