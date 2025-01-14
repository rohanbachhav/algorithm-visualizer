import React, { useState, useRef, useEffect } from 'react';
import Instructions from '../../common/Instructions';
import AlgorithmDrawer from '../../AlgorithmDrawer';

const BaseVisualizer = ({ 
  algorithms,
  defaultAlgorithm,
  onVisualize,
  renderControls,
  renderCanvas,
  analyzeResults
}) => {
  const [algorithm, setAlgorithm] = useState(defaultAlgorithm);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(10);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  
  const pauseRef = useRef(false);
  const cleanupRef = useRef(null);

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

      const cleanup = await onVisualize(
        algorithm,
        speed,
        () => pauseRef.current,
        () => {
          setIsRunning(false);
          setPaused(false);
          pauseRef.current = false;
          cleanupRef.current = null;
          if (analyzeResults) {
            const results = analyzeResults();
            setAnalysisResult(results);
          }
        }
      );

      cleanupRef.current = typeof cleanup === 'function' ? cleanup : null;
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
    setAnalysisResult(null);
  };

  useEffect(() => {
    return () => {
      if (typeof cleanupRef.current === 'function') {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
              disabled={isRunning}
              className="px-4 py-2 border rounded-md"
            >
              {Object.entries(algorithms).map(([key, name]) => (
                <option key={key} value={key}>{name}</option>
              ))}
            </select>

            <div className="flex items-center space-x-2">
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

        {renderControls({ algorithm, isRunning, speed })}
        
        <div className="w-full max-w-6xl mx-auto">
          {renderCanvas({ algorithm, isRunning, isPaused })}
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

export default BaseVisualizer; 