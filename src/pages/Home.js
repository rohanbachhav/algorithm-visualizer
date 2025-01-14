import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const mlAlgorithms = [
    {
      name: 'KNN Classification',
      description: 'Learn how K-Nearest Neighbors classifies data points',
      path: '/ml/knn',
      color: 'from-blue-500 to-blue-600',
      icon: '🎯'
    },
    {
      name: 'Linear Regression',
      description: 'Visualize how linear regression fits data points',
      path: '/ml/linear-regression',
      color: 'from-green-500 to-green-600',
      icon: '📈'
    },
    {
      name: 'K-Means Clustering',
      description: 'See how K-Means groups similar data points',
      path: '/ml/kmeans',
      color: 'from-purple-500 to-purple-600',
      icon: '🔮'
    }
  ];

  const additionalAlgorithms = [
    {
      title: 'Sorting Algorithms',
      description: 'Visualize different sorting techniques',
      features: ['Bubble Sort', 'Quick Sort', 'Merge Sort', 'Insertion Sort'],
      path: '/sorting',
      icon: '🔄',
      color: 'from-orange-500 to-orange-600'
    },
    {
      title: 'Pathfinding Algorithms',
      description: 'Explore shortest path algorithms',
      features: ['Dijkstra', 'A*', 'BFS', 'DFS'],
      path: '/pathfinding',
      icon: '🎯',
      color: 'from-teal-500 to-teal-600'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-3 text-gray-800">
        Algorithm Visualizer
      </h1>
      <p className="text-center text-gray-600 mb-8 text-base max-w-2xl mx-auto">
        Interactive visualizations to understand algorithms through hands-on exploration
      </p>

      {/* ML Algorithms Section */}
      <div className="mb-12">
        <h2 className="text-xl font-bold mb-6 text-center text-gray-800">
          Machine Learning Algorithms
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mlAlgorithms.map((algo) => (
            <Link
              key={algo.path}
              to={algo.path}
              className="transform hover:scale-102 transition-all duration-300"
            >
              <div className="bg-white rounded-lg shadow overflow-hidden h-full hover:shadow-md">
                <div className={`bg-gradient-to-r ${algo.color} p-4`}>
                  <span className="text-3xl">{algo.icon}</span>
                  <h3 className="text-lg font-bold text-white mt-1">{algo.name}</h3>
                </div>
                <div className="p-4">
                  <p className="text-gray-600 text-sm">{algo.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Additional Algorithms Section */}
      <div>
        <h2 className="text-xl font-bold mb-6 text-center text-gray-800">
          Additional Algorithms
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {additionalAlgorithms.map((category) => (
            <Link
              key={category.path}
              to={category.path}
              className="transform hover:scale-102 transition-all duration-300"
            >
              <div className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md">
                <div className={`bg-gradient-to-r ${category.color} p-4`}>
                  <div className="flex items-center">
                    <span className="text-3xl mr-3">{category.icon}</span>
                    <h3 className="text-lg font-bold text-white">{category.title}</h3>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-gray-600 text-sm mb-3">{category.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {category.features.map((feature, index) => (
                      <span
                        key={index}
                        className="px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home; 