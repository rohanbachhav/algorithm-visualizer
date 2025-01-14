import React, { useState, useRef, useEffect } from 'react';
import { clearCanvas, drawPoint, drawLine } from '../utils/canvasUtils';

const DecisionTreeVisualizer = () => {
  const [points, setPoints] = useState([]);
  const [splits, setSplits] = useState([]);
  const [step, setStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [explanation, setExplanation] = useState('Welcome! Let\'s learn how Decision Trees classify data.');
  
  const canvasRef = useRef(null);
  const treeCanvasRef = useRef(null);
  const timeoutRef = useRef(null);

  const generateExample = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Generate two clear clusters of points
    const newPoints = [];
    
    // Cluster 1 (top-right)
    for (let i = 0; i < 10; i++) {
      newPoints.push({
        x: 500 + Math.random() * 150,
        y: 100 + Math.random() * 150,
        class: 0
      });
    }

    // Cluster 2 (bottom-left)
    for (let i = 0; i < 10; i++) {
      newPoints.push({
        x: 100 + Math.random() * 150,
        y: 250 + Math.random() * 150,
        class: 1
      });
    }

    setPoints(newPoints);
    setSplits([]);
    setStep(0);
    setExplanation('Example data generated! Click Start to see how the Decision Tree splits the data.');
  };

  const findBestSplit = (currentPoints) => {
    let bestGain = -1;
    let bestSplit = null;
    
    // Try different x and y positions for splitting
    for (let x = 100; x < 700; x += 50) {
      const xGain = calculateInformationGain(currentPoints, 'x', x);
      if (xGain > bestGain) {
        bestGain = xGain;
        bestSplit = { type: 'vertical', position: x };
      }
    }

    for (let y = 50; y < 400; y += 50) {
      const yGain = calculateInformationGain(currentPoints, 'y', y);
      if (yGain > bestGain) {
        bestGain = yGain;
        bestSplit = { type: 'horizontal', position: y };
      }
    }

    return bestSplit;
  };

  const calculateInformationGain = (points, axis, position) => {
    const leftPoints = points.filter(p => p[axis] < position);
    const rightPoints = points.filter(p => p[axis] >= position);
    
    const parentEntropy = calculateEntropy(points);
    const leftEntropy = calculateEntropy(leftPoints);
    const rightEntropy = calculateEntropy(rightPoints);
    
    const leftWeight = leftPoints.length / points.length;
    const rightWeight = rightPoints.length / points.length;
    
    return parentEntropy - (leftWeight * leftEntropy + rightWeight * rightEntropy);
  };

  const calculateEntropy = (points) => {
    if (points.length === 0) return 0;
    
    const classCounts = points.reduce((acc, p) => {
      acc[p.class] = (acc[p.class] || 0) + 1;
      return acc;
    }, {});
    
    return Object.values(classCounts).reduce((entropy, count) => {
      const p = count / points.length;
      return entropy - p * Math.log2(p);
    }, 0);
  };

  const startVisualization = () => {
    if (points.length < 2) {
      setExplanation('Add at least 2 points first!');
      return;
    }

    setIsRunning(true);
    setStep(0);
    setSplits([]);
    runNextStep();
  };

  const runNextStep = () => {
    setStep(prevStep => {
      const newStep = prevStep + 1;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      switch(newStep) {
        case 1:
          setExplanation('Step 1: Looking at our data points. We want to find the best way to separate different classes.');
          timeoutRef.current = setTimeout(runNextStep, 2500);
          break;

        case 2: {
          const bestSplit = findBestSplit(points);
          setSplits([bestSplit]);
          setExplanation('Step 2: Found the best split! This line maximizes the separation between classes.');
          timeoutRef.current = setTimeout(runNextStep, 2500);
          break;
        }

        case 3: {
          const firstSplit = splits[0];
          const leftPoints = points.filter(p => 
            firstSplit.type === 'vertical' ? p.x < firstSplit.position : p.y < firstSplit.position
          );
          const rightPoints = points.filter(p => 
            firstSplit.type === 'vertical' ? p.x >= firstSplit.position : p.y >= firstSplit.position
          );

          const leftSplit = findBestSplit(leftPoints);
          const rightSplit = findBestSplit(rightPoints);
          
          setSplits(prev => [...prev, leftSplit, rightSplit].filter(Boolean));
          setExplanation('Step 3: Creating more splits to further separate the classes.');
          timeoutRef.current = setTimeout(runNextStep, 2500);
          break;
        }

        case 4:
          setExplanation('Final Step: Our Decision Tree has created regions for each class!');
          setIsRunning(false);
          break;

        default:
          setIsRunning(false);
          break;
      }

      return newStep;
    });
  };

  const drawRegions = (ctx, canvas, splits) => {
    const regions = [];
    const cellSize = 10;
    
    // Create a grid of points and classify each
    for (let x = 0; x < canvas.width; x += cellSize) {
      for (let y = 0; y < canvas.height; y += cellSize) {
        let region = 0;
        
        // Apply each split to determine region
        splits.forEach(split => {
          if (split.type === 'vertical') {
            if (x < split.position) region = split.leftClass;
            else region = split.rightClass;
          } else {
            if (y < split.position) region = split.leftClass;
            else region = split.rightClass;
          }
        });
        
        // Fill the cell with appropriate color
        ctx.fillStyle = region === 0 ? 
          'rgba(59, 130, 246, 0.1)' : // Light blue
          'rgba(239, 68, 68, 0.1)';   // Light red
        ctx.fillRect(x, y, cellSize, cellSize);
      }
    }
  };

  const drawTreeNode = (ctx, x, y, node, isLeft) => {
    // Draw node circle
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fillStyle = node.isLeaf ? 
      (node.class === 0 ? '#3b82f6' : '#ef4444') : '#fff';
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.stroke();

    // Draw node text
    ctx.fillStyle = node.isLeaf ? '#fff' : '#000';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (node.isLeaf) {
      ctx.fillText(`Class ${node.class}`, x, y);
    } else {
      const splitText = node.split.type === 'vertical' ? 
        `x < ${node.split.position.toFixed(0)}` :
        `y < ${node.split.position.toFixed(0)}`;
      ctx.fillText(splitText, x, y);
    }

    // Draw arrow label
    if (isLeft !== undefined) {
      ctx.fillStyle = '#666';
      ctx.font = '12px Arial';
      ctx.fillText(
        isLeft ? 'Yes' : 'No',
        x + (isLeft ? -30 : 30),
        y - 15
      );
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const treeCanvas = treeCanvasRef.current;
    if (!canvas || !treeCanvas) return;
    
    const ctx = canvas.getContext('2d');
    const treeCtx = treeCanvas.getContext('2d');
    
    // Clear both canvases
    clearCanvas(ctx, canvas.width, canvas.height);
    clearCanvas(treeCtx, treeCanvas.width, treeCanvas.height);

    // Draw colored regions if we have splits
    if (splits.length > 0) {
      drawRegions(ctx, canvas, splits);
    }

    // Draw grid
    ctx.strokeStyle = '#f0f0f0';
    for (let i = 0; i < canvas.width; i += 50) {
      drawLine(ctx, i, 0, i, canvas.height, '#f0f0f0', 0.5);
      drawLine(ctx, 0, i, canvas.width, i, '#f0f0f0', 0.5);
    }

    // Draw splits with animation
    splits.forEach((split, index) => {
      if (split.type === 'vertical') {
        const progress = Math.min(1, (step - index) * 0.5);
        drawLine(ctx, split.position, 0, 
          split.position, canvas.height * progress, '#000', 2);
      } else {
        const progress = Math.min(1, (step - index) * 0.5);
        drawLine(ctx, 0, split.position, 
          canvas.width * progress, split.position, '#000', 2);
      }
    });

    // Draw points
    points.forEach(point => {
      const color = point.class === 0 ? '#3b82f6' : '#ef4444';
      drawPoint(ctx, point.x, point.y, color, 8);
    });

    // Draw tree structure
    if (splits.length > 0) {
      const buildTreeStructure = (splits, depth = 0) => {
        if (!splits.length) return null;
        
        const split = splits[0];
        const remainingSplits = splits.slice(1);
        
        return {
          split,
          left: buildTreeStructure(remainingSplits.slice(0, Math.floor(remainingSplits.length/2)), depth + 1),
          right: buildTreeStructure(remainingSplits.slice(Math.floor(remainingSplits.length/2)), depth + 1),
          depth
        };
      };

      const treeStructure = buildTreeStructure(splits);
      const drawTree = (node, x, y, parentX, parentY) => {
        if (!node) return;

        // Draw connection line from parent
        if (parentX !== undefined) {
          drawLine(treeCtx, parentX, parentY, x, y, '#666', 2);
        }

        // Draw node
        drawTreeNode(treeCtx, x, y, node, parentX ? x < parentX : undefined);

        // Draw children
        const childSpacing = 120 / (node.depth + 1);
        if (node.left) {
          drawTree(node.left, x - childSpacing, y + 80, x, y);
        }
        if (node.right) {
          drawTree(node.right, x + childSpacing, y + 80, x, y);
        }
      };

      drawTree(treeStructure, treeCanvas.width/2, 40);
    }

  }, [points, splits, step]);

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
            onClick={() => {
              setPoints([]);
              setSplits([]);
              setStep(0);
              setExplanation('Welcome! Let\'s learn how Decision Trees classify data.');
            }}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md text-base font-medium"
          >
            Reset
          </button>
        </div>

        {/* Explanation */}
        <div className="bg-blue-50 p-3 rounded-md text-lg text-center">
          {explanation}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Main Canvas - Data Space */}
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
                    y: y * scaleY,
                    class: prev.length % 2 // Alternate between classes
                  }]);
                }
              }}
            />
            <div className="text-center text-sm mt-2">
              Click to add points (alternates between blue and red class)
            </div>
          </div>

          {/* Tree Structure Canvas */}
          <div className="bg-white rounded-md shadow-md p-3">
            <canvas
              ref={treeCanvasRef}
              width={750}
              height={375}
              className="w-full border border-gray-200 rounded-md"
            />
            <div className="text-center text-sm mt-2">
              Decision Tree Structure
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-gray-50 p-3 rounded-md text-sm">
          <span className="font-medium">How to use: </span>
          <span>1. Click to add points of different classes • </span>
          <span>2. Use "Show Example" for demo data • </span>
          <span>3. Click "Start" to see the tree grow • </span>
          <span>4. Watch how the tree splits the data</span>
        </div>
      </div>
    </div>
  );
};

export default DecisionTreeVisualizer; 