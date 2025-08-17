// App.js
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { NhostProvider, useAuthenticationStatus } from '@nhost/react';
import { nhost } from './utils/nhost';

import NeuralChatAuth from './pages/login-signup';
import NeuralChatLanding from './pages/landingPage';
import HomePage from './pages/homePage';
import PageTransition from './components/PageTransition';

// Protect routes that require authentication
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthenticationStatus();
  const location = useLocation();

  if (isLoading) {
    return <div>Loading...</div>; // TODO: Replace with a spinner
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
};

// Animated routes
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageTransition>
              <NeuralChatLanding />
            </PageTransition>
          }
        />
        <Route
          path="/auth"
          element={
            <PageTransition>
              <NeuralChatAuth />
            </PageTransition>
          }
        />
        <Route
          path="/home"
          element={
            <PageTransition>
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            </PageTransition>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <NhostProvider nhost={nhost}>
      <Router>
        <AnimatedRoutes />
      </Router>
    </NhostProvider>
  );
}

export default App;
