import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="flex flex-col items-center mt-10">
      <h1 className="text-4xl font-bold mb-8">Algorithm Visualizer</h1>
      <div className="flex space-x-4">
        <Link to="/sorting" className="bg-blue-500 text-white px-4 py-2 rounded">
          Sorting Visualizer
        </Link>
        <Link to="/pathfinding" className="bg-green-500 text-white px-4 py-2 rounded">
          Pathfinding Visualizer
        </Link>
        <Link to="/knn" className="bg-red-500 text-white px-4 py-2 rounded">
          KNN Visualizer
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
