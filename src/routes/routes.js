import KNNVisualizer from '../components/ml/classification/KNNVisualizer';
import LinearRegressionVisualizer from '../components/ml/regression/LinearRegressionVisualizer';
import KMeansVisualizer from '../components/ml/clustering/KMeansVisualizer';
import SortingVisualizer from '../components/SortingVisualizer';
import PathfindingVisualizer from '../components/PathfindingVisualizer';

const routes = [
  {
    path: '/ml/knn',
    element: <KNNVisualizer />,
    name: 'KNN Classification',
    category: 'ml'
  },
  {
    path: '/ml/linear-regression',
    element: <LinearRegressionVisualizer />,
    name: 'Linear Regression',
    category: 'ml'
  },
  {
    path: '/ml/kmeans',
    element: <KMeansVisualizer />,
    name: 'K-Means Clustering',
    category: 'ml'
  },
  {
    path: '/sorting',
    element: <SortingVisualizer />,
    name: 'Sorting Algorithms',
    category: 'sorting'
  },
  {
    path: '/pathfinding',
    element: <PathfindingVisualizer />,
    name: 'Pathfinding Algorithms',
    category: 'pathfinding'
  }
];

export default routes; 