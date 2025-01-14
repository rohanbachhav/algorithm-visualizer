const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const dijkstra = async (grid, startNode, endNode, setGrid, onComplete, isPaused, speed) => {
  let newGrid = grid.map(row => [...row]);
  let isActive = true;
  const visitedNodesInOrder = [];
  const startNodeObj = newGrid[startNode.row][startNode.col];
  startNodeObj.distance = 0;
  
  const unvisitedNodes = getAllNodes(newGrid);

  while (unvisitedNodes.length && isActive) {
    if (isPaused()) {
      await sleep(100);
      continue;
    }

    sortNodesByDistance(unvisitedNodes);
    const closestNode = unvisitedNodes.shift();

    if (closestNode.distance === Infinity) {
      onComplete();
      return () => { isActive = false; };
    }

    closestNode.isVisited = true;
    visitedNodesInOrder.push(closestNode);
    
    if (closestNode.row === endNode.row && closestNode.col === endNode.col) {
      const nodesInShortestPath = getNodesInShortestPath(closestNode);
      await animateShortestPath(nodesInShortestPath, newGrid, setGrid, speed);
      onComplete();
      return () => { isActive = false; };
    }

    updateUnvisitedNeighbors(closestNode, newGrid);
    setGrid([...newGrid]);
    await sleep(500 - speed * 20);
  }

  return () => { isActive = false; };
};

// Helper function to get nodes in shortest path
const getNodesInShortestPath = (finishNode) => {
  const nodesInShortestPath = [];
  let currentNode = finishNode;
  while (currentNode !== null) {
    nodesInShortestPath.unshift(currentNode);
    currentNode = currentNode.previousNode;
  }
  return nodesInShortestPath;
};

// Helper function to animate shortest path
const animateShortestPath = async (nodesInShortestPath, grid, setGrid, speed) => {
  for (let i = 0; i < nodesInShortestPath.length; i++) {
    await sleep(50);
    const node = nodesInShortestPath[i];
    if (!node.isStart && !node.isEnd) {
      node.isPath = true;
      setGrid([...grid]);
    }
  }
};

// Update the updateUnvisitedNeighbors function
const updateUnvisitedNeighbors = (node, grid) => {
  const unvisitedNeighbors = getUnvisitedNeighbors(node, grid);
  for (const neighbor of unvisitedNeighbors) {
    neighbor.distance = node.distance + 1;
    neighbor.previousNode = node;
  }
};

export const astar = async (grid, startNode, endNode, setGrid, onComplete, isPaused, speed) => {
  let newGrid = grid.map(row => [...row]);
  let isActive = true;
  const visitedNodesInOrder = [];
  const startNodeObj = newGrid[startNode.row][startNode.col];
  startNodeObj.distance = 0;
  startNodeObj.heuristic = manhattanDistance(startNode, endNode);
  startNodeObj.totalDistance = startNodeObj.heuristic;
  
  const openSet = [startNodeObj];
  const closedSet = new Set();

  while (openSet.length && isActive) {
    if (isPaused()) {
      await sleep(100);
      continue;
    }

    sortNodesByTotalDistance(openSet);
    const current = openSet.shift();
    closedSet.add(current);

    if (current.row === endNode.row && current.col === endNode.col) {
      const nodesInShortestPath = getNodesInShortestPath(current);
      await animateShortestPath(nodesInShortestPath, newGrid, setGrid, speed);
      onComplete();
      return () => { isActive = false; };
    }

    const neighbors = getUnvisitedNeighbors(current, newGrid);
    for (const neighbor of neighbors) {
      if (closedSet.has(neighbor) || neighbor.isWall) continue;

      const tentativeDistance = current.distance + 1;

      if (!openSet.includes(neighbor)) {
        openSet.push(neighbor);
      } else if (tentativeDistance >= neighbor.distance) {
        continue;
      }

      neighbor.previousNode = current;
      neighbor.distance = tentativeDistance;
      neighbor.heuristic = manhattanDistance({ row: neighbor.row, col: neighbor.col }, endNode);
      neighbor.totalDistance = neighbor.distance + neighbor.heuristic;
      neighbor.isVisited = true;
    }

    setGrid([...newGrid]);
    await sleep(500 - speed * 20);
  }

  return () => { isActive = false; };
};

export const bfs = async (grid, startNode, endNode, setGrid, onComplete, isPaused, speed) => {
  let newGrid = grid.map(row => [...row]);
  let isActive = true;
  const visitedNodesInOrder = [];
  const queue = [newGrid[startNode.row][startNode.col]];
  const visited = new Set();

  while (queue.length && isActive) {
    if (isPaused()) {
      await sleep(100);
      continue;
    }

    const current = queue.shift();
    if (visited.has(`${current.row}-${current.col}`)) continue;

    visited.add(`${current.row}-${current.col}`);
    current.isVisited = true;

    if (current.row === endNode.row && current.col === endNode.col) {
      const nodesInShortestPath = getNodesInShortestPath(current);
      await animateShortestPath(nodesInShortestPath, newGrid, setGrid, speed);
      onComplete();
      return () => { isActive = false; };
    }

    const neighbors = getUnvisitedNeighbors(current, newGrid);
    for (const neighbor of neighbors) {
      if (!visited.has(`${neighbor.row}-${neighbor.col}`)) {
        neighbor.previousNode = current;
        queue.push(neighbor);
      }
    }

    setGrid([...newGrid]);
    await sleep(500 - speed * 20);
  }

  return () => { isActive = false; };
};

export const dfs = async (grid, startNode, endNode, setGrid, onComplete, isPaused, speed) => {
  let newGrid = grid.map(row => [...row]);
  let isActive = true;
  const visitedNodesInOrder = [];
  const stack = [newGrid[startNode.row][startNode.col]];
  const visited = new Set();

  while (stack.length && isActive) {
    if (isPaused()) {
      await sleep(100);
      continue;
    }

    const current = stack.pop();
    if (visited.has(`${current.row}-${current.col}`)) continue;

    visited.add(`${current.row}-${current.col}`);
    current.isVisited = true;

    if (current.row === endNode.row && current.col === endNode.col) {
      const nodesInShortestPath = getNodesInShortestPath(current);
      await animateShortestPath(nodesInShortestPath, newGrid, setGrid, speed);
      onComplete();
      return () => { isActive = false; };
    }

    const neighbors = getUnvisitedNeighbors(current, newGrid);
    for (const neighbor of neighbors) {
      if (!visited.has(`${neighbor.row}-${neighbor.col}`)) {
        neighbor.previousNode = current;
        stack.push(neighbor);
      }
    }

    setGrid([...newGrid]);
    await sleep(500 - speed * 20);
  }

  return () => { isActive = false; };
};

// Helper functions
const getAllNodes = (grid) => {
  const nodes = [];
  for (const row of grid) {
    for (const node of row) {
      nodes.push(node);
    }
  }
  return nodes;
};

const sortNodesByDistance = (nodes) => {
  nodes.sort((a, b) => a.distance - b.distance);
};

const sortNodesByTotalDistance = (nodes) => {
  nodes.sort((a, b) => a.totalDistance - b.totalDistance);
};

const getUnvisitedNeighbors = (node, grid) => {
  const neighbors = [];
  const { row, col } = node;
  
  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0) neighbors.push(grid[row][col - 1]);
  if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
  
  return neighbors.filter(neighbor => !neighbor.isVisited && !neighbor.isWall);
};

const manhattanDistance = (node1, node2) => {
  return Math.abs(node1.row - node2.row) + Math.abs(node1.col - node2.col);
}; 