import React, { useState } from 'react';

const Instructions = ({ type }) => {
  const [isOpen, setIsOpen] = useState(true);

  const instructions = {
    sorting: {
      title: "Sorting Visualizer Instructions",
      steps: [
        "Use the slider to adjust the array size",
        "Select a sorting algorithm",
        "Adjust the animation speed",
        "Click 'Start' to begin visualization",
        "Use 'Pause' to pause the animation",
        "Click 'Reset' to generate a new array"
      ]
    },
    pathfinding: {
      title: "Pathfinding Visualizer Instructions",
      steps: [
        "Click and drag to create walls",
        "Select a pathfinding algorithm",
        "Adjust the animation speed",
        "Click 'Start' to begin visualization",
        "Use 'Pause' to pause the animation",
        "Click 'Reset' to clear the grid"
      ]
    },
    ml: {
      title: "Machine Learning Visualizer Instructions",
      steps: [
        "Click on the canvas to add data points",
        "Select an ML algorithm",
        "Adjust the K value (for K-means and KNN)",
        "Adjust the animation speed",
        "Click 'Start' to begin visualization",
        "Use 'Clear' to reset the canvas"
      ]
    }
  };

  const info = instructions[type];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg max-w-md">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-lg text-gray-800">{info.title}</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <ol className="list-decimal list-inside space-y-1">
        {info.steps.map((step, index) => (
          <li key={index} className="text-gray-600">{step}</li>
        ))}
      </ol>
    </div>
  );
};

export default Instructions; 