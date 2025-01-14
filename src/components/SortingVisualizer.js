import React, { useState, useEffect, useRef, useCallback } from 'react';
import { bubbleSort, quickSort, mergeSort, insertionSort } from '../algorithms/sortingAlgorithms';
import AlgorithmDrawer from './AlgorithmDrawer';
import Instructions from './common/Instructions';

const SortingVisualizer = () => {
  const [array, setArray] = useState([]);
  const [speed, setSpeed] = useState(10);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('bubble');
  const [barCount, setBarCount] = useState(50);
  const [comparing, setComparing] = useState([]);
  const [swapping, setSwapping] = useState([]);
  const [sorted, setSorted] = useState([]);
  const sortingRef = useRef(null);
  const pausedRef = useRef(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const generateArray = useCallback(() => {
    const newArray = Array.from({ length: barCount }, () =>
      Math.floor(Math.random() * 300) + 10
    );
    setArray(newArray);
    setComparing([]);
    setSwapping([]);
    setSorted([]);
  }, [barCount]);

  useEffect(() => {
    generateArray();
  }, [barCount, generateArray]);

  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
    pausedRef.current = false;
    setSorted([]);
    
    const algorithms = {
      bubble: bubbleSort,
      quick: quickSort,
      merge: mergeSort,
      insertion: insertionSort
    };

    if (sortingRef.current) {
      sortingRef.current();
    }

    sortingRef.current = algorithms[selectedAlgorithm](
      array,
      speed,
      setArray,
      (sortedIndices) => {
        setIsRunning(false);
        setSorted(sortedIndices);
        sortingRef.current = null;
        pausedRef.current = false;
      },
      () => pausedRef.current,
      setComparing,
      setSwapping
    );
  };

  const handlePause = () => {
    pausedRef.current = !pausedRef.current;
    setIsPaused(!isPaused);
  };

  const handleStop = () => {
    if (sortingRef.current) {
      sortingRef.current();
      sortingRef.current = null;
    }
    setIsRunning(false);
    setIsPaused(false);
    pausedRef.current = false;
    setComparing([]);
    setSwapping([]);
    setSorted([]);
    generateArray();
  };

  const getBarColor = (index) => {
    if (swapping.includes(index)) return 'bg-red-500';
    if (comparing.includes(index)) return 'bg-yellow-400';
    if (sorted.includes(index)) return 'bg-green-500';
    return 'bg-blue-500';
  };

  const renderLegend = () => (
    <div className="flex gap-6 justify-center mb-4 bg-white p-4 rounded-lg shadow-md">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-blue-500 rounded"></div>
        <span className="text-gray-700">Unsorted</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-yellow-400 rounded"></div>
        <span className="text-gray-700">Comparing</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-red-500 rounded"></div>
        <span className="text-gray-700">Swapping</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-green-500 rounded"></div>
        <span className="text-gray-700">Sorted</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          Sorting Visualizer
        </h1>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
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
            </div>

            <div className="flex flex-wrap gap-6 items-center">
              <select
                value={selectedAlgorithm}
                onChange={(e) => setSelectedAlgorithm(e.target.value)}
                disabled={isRunning}
                className="px-4 py-2 border rounded-md"
              >
                <option value="bubble">Bubble Sort</option>
                <option value="quick">Quick Sort</option>
                <option value="merge">Merge Sort</option>
                <option value="insertion">Insertion Sort</option>
              </select>

              <button
                onClick={() => setIsDrawerOpen(true)}
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-md font-medium"
              >
                Algorithm Info
              </button>

              <div className="flex items-center gap-2">
                <span className="text-gray-700 whitespace-nowrap">Speed:</span>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={speed}
                  onChange={(e) => setSpeed(parseInt(e.target.value))}
                  className="w-32"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-gray-700 whitespace-nowrap">Bars: {barCount}</span>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={barCount}
                  onChange={(e) => setBarCount(parseInt(e.target.value))}
                  disabled={isRunning}
                  className="w-32"
                />
              </div>

              <button
                onClick={generateArray}
                disabled={isRunning}
                className={`px-4 py-2 rounded-md font-medium ${
                  isRunning
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                Generate New Array
              </button>
            </div>
          </div>
        </div>

        {renderLegend()}

        {/* Updated Visualization */}
        <div className="bg-white rounded-lg shadow-md p-6 h-[400px] flex items-end justify-center gap-1">
          {array.map((value, idx) => (
            <div
              key={idx}
              style={{
                height: `${value}px`,
                width: `${Math.max(2, Math.floor(800 / array.length))}px`,
                transition: 'height 0.1s ease-in-out, background-color 0.1s ease-in-out'
              }}
              className={`${getBarColor(idx)} rounded-t-sm`}
            />
          ))}
        </div>

        <AlgorithmDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          algorithm={selectedAlgorithm}
        />
      </div>
      <Instructions type="sorting" />
    </div>
  );
};

export default SortingVisualizer;
