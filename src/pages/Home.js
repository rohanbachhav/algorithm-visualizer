import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const mlAlgorithms = [
    {
      name: 'KNN Classification',
      description: 'Learn how K-Nearest Neighbors classifies data points based on their neighbors',
      path: '/ml/knn',
      color: 'bg-blue-500'
    },
    {
      name: 'Linear Regression',
      description: 'Visualize how linear regression finds the best-fitting line through data',
      path: '/ml/linear-regression',
      color: 'bg-green-500'
    },
    {
      name: 'K-Means Clustering',
      description: 'See how K-Means groups similar data points into clusters',
      path: '/ml/kmeans',
      color: 'bg-purple-500'
    }
  ];

  const additionalAlgorithms = [
    {
      title: 'Sorting Algorithms',
      description: 'Visualize how different sorting algorithms like Bubble Sort and Quick Sort work',
      path: '/sorting',
      icon: '🔄'
    },
    {
      title: 'Pathfinding Algorithms',
      description: 'See how algorithms like Dijkstra and A* find the shortest path',
      path: '/pathfinding',
      icon: '🎯'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-4">
        Machine Learning Visualizer
      </h1>
      <p className="text-center text-gray-600 mb-12 text-lg">
        Interactive visualizations to understand machine learning concepts
      </p>

      {/* ML Algorithms Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {mlAlgorithms.map((algo) => (
          <Link
            key={algo.path}
            to={algo.path}
            className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
          >
            <div className={`${algo.color} p-4`}>
              <h3 className="text-xl font-bold text-white">{algo.name}</h3>
            </div>
            <div className="p-4">
              <p className="text-gray-600">{algo.description}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Additional Algorithms Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-8 text-center">Additional Algorithms</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {additionalAlgorithms.map((category) => (
            <Link
              key={category.title}
              to={category.path}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="bg-gray-700 p-4">
                <h3 className="text-xl font-bold text-white">
                  <span className="mr-2">{category.icon}</span>
                  {category.title}
                </h3>
              </div>
              <div className="p-4">
                <p className="text-gray-600">{category.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home; 