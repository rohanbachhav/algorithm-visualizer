import React from 'react';

const algorithmInfo = {
  // Pathfinding Algorithms
  dfs: {
    name: 'Depth-First Search',
    description: 'A graph traversal algorithm that explores as far as possible along each branch before backtracking.',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    characteristics: [
      'Does not guarantee shortest path',
      'Uses a stack data structure',
      'Good for maze generation',
      'Memory efficient for deep graphs'
    ],
    steps: [
      'Start at the initial node',
      'Mark current node as visited and add to stack',
      'Get an unvisited neighbor of current node',
      'If no unvisited neighbors, backtrack by popping from stack',
      'Repeat until stack is empty or target is found'
    ]
  },
  bfs: {
    name: 'Breadth-First Search',
    description: 'Explores all neighbor nodes at present depth before moving to nodes at the next depth level.',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    characteristics: [
      'Guarantees shortest path in unweighted graphs',
      'Uses a queue data structure',
      'Explores nodes level by level',
      'Good for finding shortest path'
    ],
    steps: [
      'Start at the initial node',
      'Visit all neighbors of current level',
      'Move to next level of nodes',
      'Mark visited nodes to avoid cycles',
      'Continue until target is found or all nodes are visited'
    ]
  },
  dijkstra: {
    name: "Dijkstra's Algorithm",
    description: 'Finds the shortest path between nodes in a weighted graph.',
    timeComplexity: 'O((V + E) log V)',
    spaceComplexity: 'O(V)',
    characteristics: [
      'Guarantees shortest path in weighted graphs',
      'Uses a priority queue',
      'Cannot handle negative weights',
      'Optimal for single-source shortest path'
    ],
    steps: [
      'Initialize distances to all nodes as infinity',
      'Set distance to start node as 0',
      'Select unvisited node with minimum distance',
      'Update distances to all unvisited neighbors',
      'Mark current node as visited and repeat'
    ]
  },
  astar: {
    name: 'A* Search',
    description: 'A best-first search algorithm that finds the shortest path using heuristics.',
    timeComplexity: 'O(E)',
    spaceComplexity: 'O(V)',
    characteristics: [
      'Guarantees shortest path',
      'Uses heuristics for efficiency',
      'Combines Dijkstra and Best-First Search',
      'Optimal when heuristic is admissible'
    ],
    steps: [
      'Start with initial node',
      'Calculate f(n) = g(n) + h(n) for neighbors',
      'Choose node with lowest f(n)',
      'Update path if better one is found',
      'Continue until target is reached'
    ]
  },
  // Sorting Algorithms
  bubble: {
    name: 'Bubble Sort',
    description: 'A simple sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    characteristics: [
      'Simple to understand and implement',
      'In-place sorting',
      'Stable sorting algorithm',
      'Not suitable for large datasets'
    ],
    steps: [
      'Start from the first element',
      'Compare adjacent elements',
      'Swap if they are in wrong order',
      'Repeat until no swaps needed',
      'Largest element "bubbles up" to the end'
    ]
  },
  quick: {
    name: 'Quick Sort',
    description: 'A divide-and-conquer algorithm that picks a pivot element and partitions the array around it.',
    timeComplexity: 'O(n log n) average, O(n²) worst',
    spaceComplexity: 'O(log n)',
    characteristics: [
      'Efficient for large datasets',
      'In-place sorting',
      'Unstable sorting algorithm',
      'Recursive implementation'
    ],
    steps: [
      'Choose a pivot element',
      'Partition array around pivot',
      'Move smaller elements to left',
      'Move larger elements to right',
      'Recursively sort sub-arrays'
    ]
  },
  merge: {
    name: 'Merge Sort',
    description: 'A divide-and-conquer algorithm that divides the array into smaller subarrays, sorts them, and then merges them back together.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    characteristics: [
      'Stable sorting algorithm',
      'Predictable performance',
      'Not in-place',
      'Good for linked lists'
    ],
    steps: [
      'Divide array into two halves',
      'Recursively sort both halves',
      'Merge sorted halves',
      'Compare elements while merging',
      'Create final sorted array'
    ]
  },
  insertion: {
    name: 'Insertion Sort',
    description: 'Builds the final sorted array one item at a time by repeatedly inserting a new element into the sorted portion of the array.',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    characteristics: [
      'Simple implementation',
      'Efficient for small data sets',
      'Adaptive algorithm',
      'Stable sorting algorithm'
    ],
    steps: [
      'Start with first element',
      'Take next unsorted element',
      'Insert it into sorted portion',
      'Shift larger elements right',
      'Repeat until array is sorted'
    ]
  }
};

const AlgorithmDrawer = ({ isOpen, onClose, algorithm }) => {
  if (!isOpen) return null;

  const info = algorithmInfo[algorithm];
  if (!info) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="bg-white w-96 h-full overflow-y-auto shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">{info.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Description</h3>
            <p className="text-gray-600">{info.description}</p>
          </div>

          {/* Complexity */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Complexity</h3>
            <div className="space-y-2">
              <p className="text-gray-600">Time: {info.timeComplexity}</p>
              <p className="text-gray-600">Space: {info.spaceComplexity}</p>
            </div>
          </div>

          {/* Characteristics */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Key Characteristics</h3>
            <ul className="list-disc list-inside space-y-1">
              {info.characteristics.map((char, index) => (
                <li key={index} className="text-gray-600">{char}</li>
              ))}
            </ul>
          </div>

          {/* Steps */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Algorithm Steps</h3>
            <ol className="list-decimal list-inside space-y-1">
              {info.steps.map((step, index) => (
                <li key={index} className="text-gray-600">{step}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlgorithmDrawer; 