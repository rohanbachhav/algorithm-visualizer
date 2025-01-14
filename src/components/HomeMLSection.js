import React from 'react';
import { Link } from 'react-router-dom';

const MLSection = () => {
  const algorithms = [
    {
      title: 'KNN Classification',
      description: 'Learn how K-Nearest Neighbors classifies data points',
      path: '/ml/knn',
      icon: '🎯'
    },
    {
      title: 'Linear Regression',
      description: 'Visualize how linear regression fits a line to your data',
      path: '/ml/linear-regression',
      icon: '📈'
    },
    {
      title: 'Decision Tree',
      description: 'See how decision trees split data to make classifications',
      path: '/ml/decision-tree',
      icon: '🌳'
    }
    // ... other algorithms ...
  ];

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Machine Learning Algorithms
          </h2>
          <p className="mt-4 text-xl text-gray-500">
            Interactive visualizations to help you understand ML concepts
          </p>
        </div>

        <div className="mt-10">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {algorithms.map((algorithm) => (
              <Link
                key={algorithm.path}
                to={algorithm.path}
                className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <div>
                  <span className="text-4xl">{algorithm.icon}</span>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">
                    {algorithm.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {algorithm.description}
                  </p>
                </div>
                <span
                  className="absolute top-6 right-6 text-gray-300 group-hover:text-gray-400"
                  aria-hidden="true"
                >
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MLSection; 