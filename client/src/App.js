import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import NeuralChatAuth from './pages/login-signup';
import NeuralChatLanding from './pages/landingPage';
import HomePage from './pages/homePage';
import PageTransition from './components/PageTransition';

// Wrap routes with AnimatePresence for exit animations
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <PageTransition>
            <NeuralChatLanding />
          </PageTransition>
        } />
        <Route path="/auth" element={
          <PageTransition>
            <NeuralChatAuth />
          </PageTransition>
        } />
        <Route path="/home" element={
          <PageTransition>
            <HomePage />
          </PageTransition>
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (  
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}

export default App;

