import React, { useState, useEffect, useRef } from 'react';
import { dijkstra, astar, bfs, dfs } from '../algorithms/pathfindingAlgorithms';
import AlgorithmDrawer from './AlgorithmDrawer';
const PathfindingVisualizer = () => {

  const [grid, setGrid] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('dfs');
  const [startNode, setStartNode] = useState({ row: 10, col: 10 });
  const [endNode, setEndNode] = useState({ row: 10, col: 40 });
  const [isDrawingWalls, setIsDrawingWalls] = useState(false);
  const [speed, setSpeed] = useState(10);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const pausedRef = useRef(false);
  const algorithmRef = useRef(null);
  const [wallPercentage, setWallPercentage] = useState(20);

  // Grid dimensions
  const GRID_ROWS = 20;
  const GRID_COLS = 40;

  // Calculate start and end positions based on grid size
  const START_NODE_ROW = Math.floor(GRID_ROWS / 2);    // Middle row
  const START_NODE_COL = Math.floor(GRID_COLS / 4);    // 1/4 of the way from left
  const END_NODE_ROW = Math.floor(GRID_ROWS / 2);      // Middle row
  const END_NODE_COL = Math.floor(GRID_COLS * 3 / 4);  // 3/4 of the way from left

  startNode.row = START_NODE_ROW;
  startNode.col = START_NODE_COL;
  endNode.row = END_NODE_ROW;
  endNode.col = END_NODE_COL;

  useEffect(() => {
    initializeGrid();
  }, []);

  const createNode = (row, col) => {
    return {
      row,
      col,
      isStart: row === START_NODE_ROW && col === START_NODE_COL,
      isEnd: row === END_NODE_ROW && col === END_NODE_COL,
      distance: Infinity,
      isVisited: false,
      isWall: false,
      previousNode: null,
    };
  };
  
  const initializeGrid = () => {
    const grid = [];
    for (let row = 0; row < GRID_ROWS; row++) {
      const currentRow = [];
      for (let col = 0; col < GRID_COLS; col++) {
        currentRow.push(createNode(row, col));
      }
      grid.push(currentRow);
    }
    setGrid(grid);
  };

  const handleMouseDown = (row, col) => {
    if (isRunning) return;
    
    const node = grid[row][col];
    if (node.isStart || node.isEnd) return;

    setIsDrawingWalls(true);
    const newGrid = [...grid];
    newGrid[row][col].isWall = !newGrid[row][col].isWall;
    setGrid(newGrid);
  };

  const handleMouseEnter = (row, col) => {
    if (!isDrawingWalls || isRunning) return;
    
    const node = grid[row][col];
    if (node.isStart || node.isEnd) return;

    const newGrid = [...grid];
    newGrid[row][col].isWall = !newGrid[row][col].isWall;
    setGrid(newGrid);
  };

  const handleMouseUp = () => {
    setIsDrawingWalls(false);
  };

  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
    pausedRef.current = false;

    const algorithms = {
      dfs,
      bfs,
      dijkstra,
      astar
    };

    algorithmRef.current = algorithms[selectedAlgorithm](
      grid,
      startNode,
      endNode,
      setGrid,
      () => {
        setIsRunning(false);
        algorithmRef.current = null;
        pausedRef.current = false;
      },
      () => pausedRef.current,
      speed
    );
  };

  const handlePause = () => {
    pausedRef.current = !pausedRef.current;
    setIsPaused(!isPaused);
  };

  const handleStop = () => {
    setIsRunning(false);
    setIsPaused(false);
    window.location.reload();
  };

  const getNodeClassName = (node) => {
    if (node.isStart) return 'bg-green-500';
    if (node.isEnd) return 'bg-red-500';
    if (node.isWall) return 'bg-gray-800';
    if (node.isPath) return 'bg-yellow-400';
    if (node.isVisited) return 'bg-blue-300';
    return 'bg-white';
  };

  const handlePercentageChange = (e) => {
    const value = Math.min(Math.max(parseInt(e.target.value) || 10, 10), 40);
    setWallPercentage(value);
  };

  const generateRandomObstacles = () => {
    if (isRunning) return;
    const newGrid = [...grid];

    // Clear existing walls
    for (let i = 0; i < GRID_ROWS; i++) {
      for (let j = 0; j < GRID_COLS; j++) {
        if (!newGrid[i][j].isStart && !newGrid[i][j].isEnd) {
          newGrid[i][j].isWall = false;
        }
      }
    }

    // Generate new walls based on percentage
    const totalCells = GRID_ROWS * GRID_COLS;
    const wallsToAdd = Math.floor((totalCells * wallPercentage) / 100);

    let wallsAdded = 0;
    while (wallsAdded < wallsToAdd) {
      const row = Math.floor(Math.random() * GRID_ROWS);
      const col = Math.floor(Math.random() * GRID_COLS);
      if (!newGrid[row][col].isWall && !newGrid[row][col].isStart && !newGrid[row][col].isEnd) {
        newGrid[row][col].isWall = true;
        wallsAdded++;
      }
    }

    setGrid(newGrid);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          Pathfinding Visualizer
        </h1>

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
                disabled={!isRunning}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  !isRunning
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                Stop
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={generateRandomObstacles}
                  disabled={isRunning}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    isRunning
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-purple-500 hover:bg-purple-600 text-white'
                  }`}
                >
                  Random Maze
                </button>
                <input
                  type="number"
                  value={wallPercentage}
                  onChange={handlePercentageChange}
                  disabled={isRunning}
                  min="10"
                  max="30"
                  className="w-16 px-2 py-1 text-sm border rounded"
                />
                <span className="text-sm text-gray-600">%</span>
              </div>

            </div>

            <div className="flex gap-4 items-center">
              <select
                value={selectedAlgorithm}
                onChange={(e) => setSelectedAlgorithm(e.target.value)}
                disabled={isRunning}
                className="px-4 py-2 border rounded-md"
              >
                <option value="dfs">Depth First Search</option>
                <option value="bfs">Breadth First Search</option>
                <option value="dijkstra">Dijkstra's Algorithm</option>
                <option value="astar">A* Search</option>
              </select>

              <button
                onClick={() => setIsDrawerOpen(true)}
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-md font-medium"
              >
                Algorithm Info
              </button>

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
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div 
            className="grid gap-[1px] bg-gray-200"
            style={{
              gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))`,
            }}
            onMouseLeave={() => setIsDrawingWalls(false)}
          >
            {grid.map((row, rowIdx) =>
              row.map((node, nodeIdx) => (
                <div
                  key={`${rowIdx}-${nodeIdx}`}
                  className={`w-full h-6 ${getNodeClassName(node)} transition-colors duration-200`}
                  onMouseDown={() => handleMouseDown(rowIdx, nodeIdx)}
                  onMouseEnter={() => handleMouseEnter(rowIdx, nodeIdx)}
                  onMouseUp={handleMouseUp}
                />
              ))
            )}
          </div>
        </div>

        <AlgorithmDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          algorithm={selectedAlgorithm}
        />
      </div>
    </div>
  );
};

export default PathfindingVisualizer; 