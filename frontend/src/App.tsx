/**
 * App - Root component with React Router
 */
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import Dashboard from './pages/Dashboard';
import AssetActivity from './pages/AssetActivity';
import AssetReview from './pages/AssetReview';
import AssetLibrary from './pages/AssetLibrary';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="activity" element={<AssetActivity />} />
            <Route path="review" element={<AssetReview />} />
            <Route path="library" element={<AssetLibrary />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
