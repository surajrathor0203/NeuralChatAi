import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/login-signup.css';

const LoginSignup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('login');
  const [formData, setFormData] = useState({
    login: {
      email: '',
      password: '',
      rememberMe: false
    },
    signup: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });
  const [errors, setErrors] = useState({
    login: {},
    signup: {}
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Particle animation state
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Generate random particles for background
    const newParticles = [];
    for (let i = 0; i < 50; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 5 + 1,
        speedX: (Math.random() - 0.5) * 2,
        speedY: (Math.random() - 0.5) * 2,
        opacity: Math.random() * 0.5 + 0.1
      });
    }
    setParticles(newParticles);

    // Animation loop for particles
    const animateParticles = () => {
      setParticles(prevParticles => {
        return prevParticles.map(p => ({
          ...p,
          x: (p.x + p.speedX + window.innerWidth) % window.innerWidth,
          y: (p.y + p.speedY + window.innerHeight) % window.innerHeight
        }));
      });
      requestAnimationFrame(animateParticles);
    };
    
    const animationId = requestAnimationFrame(animateParticles);
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'signup') {
      setActiveTab('signup');
    }
  }, [location]);

  const handleChange = (e, formType) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [formType]: {
        ...prev[formType],
        [name]: fieldValue
      }
    }));
    
    // Clear error when field is edited
    if (errors[formType][name]) {
      setErrors(prev => ({
        ...prev,
        [formType]: {
          ...prev[formType],
          [name]: null
        }
      }));
    }
  };

  const validateForm = (formType) => {
    const data = formData[formType];
    const newErrors = {};
    
    // Email validation
    if (!data.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Password validation
    if (!data.password) {
      newErrors.password = 'Password is required';
    } else if (data.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    // Additional validation for signup
    if (formType === 'signup') {
      if (!data.name) {
        newErrors.name = 'Name is required';
      }
      
      if (!data.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (data.password !== data.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setErrors(prev => ({
      ...prev,
      [formType]: newErrors
    }));
    
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e, formType) => {
    e.preventDefault();
    
    if (validateForm(formType)) {
      setIsSubmitting(true);
      
      // Simulate API call
      setTimeout(() => {
        console.log(`${formType} form submitted:`, formData[formType]);
        setIsSubmitting(false);
        
        // Clear form after successful submission (optional)
        // setFormData(prev => ({
        //   ...prev,
        //   [formType]: {
        //     email: '',
        //     password: '',
        //     ...(formType === 'signup' ? { name: '', confirmPassword: '' } : {})
        //   }
        // }));
        
        // You would typically redirect the user or show a success message here
      }, 1500);
    }
  };

  const renderLoginForm = () => (
    <form onSubmit={(e) => handleSubmit(e, 'login')} className="auth-form">
      <div className="form-group">
        <label htmlFor="login-email">Email</label>
        <div className="input-container">
          <input
            id="login-email"
            type="email"
            name="email"
            value={formData.login.email}
            onChange={(e) => handleChange(e, 'login')}
            placeholder="your@email.com"
            className={errors.login.email ? 'error' : ''}
          />
          <div className="input-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        {errors.login.email && <div className="error-message">{errors.login.email}</div>}
      </div>
      
      <div className="form-group">
        <label htmlFor="login-password">Password</label>
        <div className="input-container">
          <input
            id="login-password"
            type="password"
            name="password"
            value={formData.login.password}
            onChange={(e) => handleChange(e, 'login')}
            placeholder="••••••••"
            className={errors.login.password ? 'error' : ''}
          />
          <div className="input-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        {errors.login.password && <div className="error-message">{errors.login.password}</div>}
      </div>
      
      <div className="form-options">
        <div className="remember-me">
          <input 
            type="checkbox" 
            id="remember-me" 
            name="rememberMe"
            checked={formData.login.rememberMe}
            onChange={(e) => handleChange(e, 'login')}
          />
          <label htmlFor="remember-me">Remember me</label>
        </div>
        <a href="#" className="forgot-password">Forgot password?</a>
      </div>
      
      <button 
        type="submit" 
        className="btn btn-primary btn-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <div className="spinner"></div>
        ) : (
          'Sign In'
        )}
      </button>
      
      <div className="social-login">
        <div className="divider">
          <span>Or continue with</span>
        </div>
        <div className="social-buttons">
          <button type="button" className="social-button google">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#DB4437" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M17.4 10.4H7.6" stroke="#DB4437" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10.4 7.6V17.4" stroke="#DB4437" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Google
          </button>
          <button type="button" className="social-button github">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 19C4 20.5 4 16.5 2 16M16 22V18.13C16.0375 17.6532 15.9731 17.1738 15.811 16.7238C15.6489 16.2738 15.3929 15.8634 15.06 15.52C18.2 15.17 21.5 13.98 21.5 8.52C21.4997 7.12383 20.9627 5.7812 20 4.77C20.4559 3.54851 20.4236 2.19835 19.91 1C19.91 1 18.73 0.650001 16 2.48C13.708 1.85882 11.292 1.85882 9 2.48C6.27 0.650001 5.09 1 5.09 1C4.57638 2.19835 4.54414 3.54851 5 4.77C4.03013 5.7887 3.49252 7.14346 3.5 8.55C3.5 13.97 6.8 15.16 9.94 15.55C9.611 15.89 9.35726 16.2954 9.19531 16.7399C9.03335 17.1844 8.96681 17.6581 9 18.13V22" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            GitHub
          </button>
        </div>
      </div>
    </form>
  );

  const renderSignupForm = () => (
    <form onSubmit={(e) => handleSubmit(e, 'signup')} className="auth-form">
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="signup-name">Full Name</label>
          <div className="input-container">
            <input
              id="signup-name"
              type="text"
              name="name"
              value={formData.signup.name}
              onChange={(e) => handleChange(e, 'signup')}
              placeholder="John Doe"
              className={errors.signup.name ? 'error' : ''}
            />
            <div className="input-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          {errors.signup.name && <div className="error-message">{errors.signup.name}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="signup-email">Email</label>
          <div className="input-container">
            <input
              id="signup-email"
              type="email"
              name="email"
              value={formData.signup.email}
              onChange={(e) => handleChange(e, 'signup')}
              placeholder="your@email.com"
              className={errors.signup.email ? 'error' : ''}
            />
            <div className="input-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          {errors.signup.email && <div className="error-message">{errors.signup.email}</div>}
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="signup-password">Password</label>
          <div className="input-container">
            <input
              id="signup-password"
              type="password"
              name="password"
              value={formData.signup.password}
              onChange={(e) => handleChange(e, 'signup')}
              placeholder="••••••••"
              className={errors.signup.password ? 'error' : ''}
            />
            <div className="input-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          {errors.signup.password && <div className="error-message">{errors.signup.password}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="signup-confirm-password">Confirm Password</label>
          <div className="input-container">
            <input
              id="signup-confirm-password"
              type="password"
              name="confirmPassword"
              value={formData.signup.confirmPassword}
              onChange={(e) => handleChange(e, 'signup')}
              placeholder="••••••••"
              className={errors.signup.confirmPassword ? 'error' : ''}
            />
            <div className="input-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          {errors.signup.confirmPassword && <div className="error-message">{errors.signup.confirmPassword}</div>}
        </div>
      </div>
      
      <button 
        type="submit" 
        className="btn btn-primary btn-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <div className="spinner"></div>
        ) : (
          'Create Account'
        )}
      </button>
      
      <div className="social-login">
        <div className="divider">
          <span>Or sign up with</span>
        </div>
        <div className="social-buttons">
          <button type="button" className="social-button google">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#DB4437" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M17.4 10.4H7.6" stroke="#DB4437" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10.4 7.6V17.4" stroke="#DB4437" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Google
          </button>
          <button type="button" className="social-button github">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 19C4 20.5 4 16.5 2 16M16 22V18.13C16.0375 17.6532 15.9731 17.1738 15.811 16.7238C15.6489 16.2738 15.3929 15.8634 15.06 15.52C18.2 15.17 21.5 13.98 21.5 8.52C21.4997 7.12383 20.9627 5.7812 20 4.77C20.4559 3.54851 20.4236 2.19835 19.91 1C19.91 1 18.73 0.650001 16 2.48C13.708 1.85882 11.292 1.85882 9 2.48C6.27 0.650001 5.09 1 5.09 1C4.57638 2.19835 4.54414 3.54851 5 4.77C4.03013 5.7887 3.49252 7.14346 3.5 8.55C3.5 13.97 6.8 15.16 9.94 15.55C9.611 15.89 9.35726 16.2954 9.19531 16.7399C9.03335 17.1844 8.96681 17.6581 9 18.13V22" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            GitHub
          </button>
        </div>
      </div>
    </form>
  );

  // Add smooth navigation transition when returning to home
  const handleNavigateHome = (e) => {
    e.preventDefault();
    navigate('/');
  };

  return (
    <div className="auth-page">
      {/* Animated particles background */}
      <div className="particles-background">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="particle"
            style={{
              left: `${particle.x}px`,
              top: `${particle.y}px`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: particle.opacity
            }}
          />
        ))}
      </div>
      
      <div className="auth-split-container">
        {/* Left side - Information */}
        <div className="auth-info-section">
          <div className="info-content">
            <div 
              className="logo" 
              onClick={handleNavigateHome} 
              style={{ cursor: 'pointer' }}
            >
              <span className="gradient-text">NeuralChat</span>
              <span className="ai-badge">AI</span>
            </div>
            
            <h1 className="info-title">Experience the Future of AI Conversation</h1>
            
            <p className="info-description">
              Join thousands of users leveraging our advanced neural network technology to transform 
              customer interactions and streamline business communication.
            </p>
            
            <div className="info-features">
              <div className="info-feature-item">
                <div className="feature-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 11.0801V12.0001C21.9988 14.1565 21.3005 16.2548 20.0093 17.9819C18.7182 19.7091 16.9033 20.9726 14.8354 21.5839C12.7674 22.1952 10.5573 22.1218 8.53447 21.3747C6.51168 20.6276 4.78465 19.2488 3.61096 17.4373C2.43727 15.6257 1.87979 13.4869 2.02168 11.3363C2.16356 9.18563 2.99721 7.13817 4.39828 5.49707C5.79935 3.85598 7.69279 2.71856 9.79619 2.24691C11.8996 1.77527 14.1003 1.98837 16.07 2.86011" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="feature-text">
                  <h3>Natural Language Processing</h3>
                  <p>Advanced algorithms that understand context and nuance in conversation</p>
                </div>
              </div>
              
              <div className="info-feature-item">
                <div className="feature-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.258 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.0113 9.77251C4.28059 9.5799 4.48572 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="feature-text">
                  <h3>Customizable Experience</h3>
                  <p>Tailor the AI to your specific industry needs and communication style</p>
                </div>
              </div>
              
              <div className="info-feature-item">
                <div className="feature-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22C9.49872 19.2616 8.07725 15.708 8 12C8.07725 8.29203 9.49872 4.73835 12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="feature-text">
                  <h3>Global Support</h3>
                  <p>Multilingual capabilities supporting over 50 languages worldwide</p>
                </div>
              </div>
            </div>
            
            <div className="info-stats">
              <div className="stat">
                <h4>1M+</h4>
                <p>Active Users</p>
              </div>
              <div className="stat">
                <h4>50M+</h4>
                <p>Messages Processed</p>
              </div>
              <div className="stat">
                <h4>5K+</h4>
                <p>Enterprise Clients</p>
              </div>
            </div>

            <div className="brain-graphic-container">
              <div className="brain-pulse"></div>
              <div className="brain-connections"></div>
            </div>
          </div>
        </div>
        
        {/* Right side - Auth Forms */}
        <div className="auth-form-section">
          <div className="auth-card">
            <div className="auth-header">
              <h2>Welcome to NeuralChat AI</h2>
              <p>The future of conversation starts here</p>
            </div>
            
            <div className="auth-tabs">
              <button 
                className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
                onClick={() => setActiveTab('login')}
              >
                Sign In
              </button>
              <button 
                className={`auth-tab ${activeTab === 'signup' ? 'active' : ''}`}
                onClick={() => setActiveTab('signup')}
              >
                Sign Up
              </button>
              <div className={`tab-indicator ${activeTab === 'signup' ? 'right' : 'left'}`} />
            </div>
            
            <div className="auth-content">
              {activeTab === 'login' ? renderLoginForm() : renderSignupForm()}
            </div>
          </div>
          
          <div className="auth-footer">
            <p>
              By using our service, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
            </p>
            <p style={{ marginTop: '10px' }}>
              <a href="#" onClick={handleNavigateHome}>Back to Home</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;
