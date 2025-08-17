// utils/nhost.js
import { NhostClient } from '@nhost/nhost-js';
import { useState, useEffect } from 'react';

// Create a single nhost client instance (do NOT recreate inside components)
export const nhost = new NhostClient({
  subdomain: process.env.REACT_APP_NHOST_SUBDOMAIN || 'local',
  region: process.env.REACT_APP_NHOST_REGION || 'eu-central-1', // Default to valid region
  autoRefreshToken: true,
  autoSignIn: true
});

// Service health check flag
let isServiceAvailable = true;

// Log Nhost configuration for debugging
console.log('Nhost Configuration:', {
  subdomain: process.env.REACT_APP_NHOST_SUBDOMAIN || 'local',
  region: process.env.REACT_APP_NHOST_REGION || 'eu-central-1',
  backendUrl: process.env.REACT_APP_BACKEND_URL || null
});

/**
 * Check if the Nhost service is available
 * @returns {Promise<boolean>} True if service is available
 */
const checkServiceAvailability = async () => {
  try {
    // Make a lightweight request to check service availability
    await fetch(`${nhost.auth.url}/healthz`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000, // 5 second timeout
    });
    isServiceAvailable = true;
    return true;
  } catch (error) {
    console.error('Nhost service availability check failed:', error);
    isServiceAvailable = false;
    return false;
  }
};

// Initial service check
checkServiceAvailability();

/**
 * Custom React hook for managing Nhost authentication state
 * @returns {Object} Authentication state
 */
export const useNhostAuth = () => {
  const [authState, setAuthState] = useState({
    isAuthenticated: nhost.auth.isAuthenticated(),
    isLoading: true,
    user: nhost.auth.getUser(),
    serviceAvailable: isServiceAvailable
  });

  useEffect(() => {
    // Set up auth state change listener
    const unsubscribe = nhost.auth.onAuthStateChanged((event, session) => {
      setAuthState({
        isAuthenticated: event === 'SIGNED_IN' && Boolean(session),
        isLoading: false,
        user: nhost.auth.getUser(),
        serviceAvailable: isServiceAvailable
      });
    });

    // Initial state update
    setAuthState(prev => ({
      ...prev,
      isLoading: false,
      serviceAvailable: isServiceAvailable
    }));

    // Periodically check service availability
    const serviceCheckInterval = setInterval(async () => {
      const available = await checkServiceAvailability();
      if (available !== authState.serviceAvailable) {
        setAuthState(prev => ({ ...prev, serviceAvailable: available }));
      }
    }, 30000); // Check every 30 seconds

    // Clean up subscription on unmount
    return () => {
      unsubscribe();
      clearInterval(serviceCheckInterval);
    };
  }, [authState.serviceAvailable]); // Add missing dependency

  return authState;
};

/**
 * Sign up with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @param {Object} options - Additional options like metadata
 * @returns {Promise<Object>} Response with success or error
 */
export const signUpWithEmailPassword = async (email, password, options = {}) => {
  try {
    // Check service availability before attempting sign up
    if (!isServiceAvailable) {
      const available = await checkServiceAvailability();
      if (!available) {
        return { 
          error: {
            message: "Authentication service is currently unavailable. Please try again later.",
            code: "service_unavailable"
          }
        };
      }
    }

    // Log the exact parameters being sent to Nhost
    console.log('Sending signup request to Nhost with params:', {
      email,
      password: '[REDACTED]',
      options
    });

    // Configure the redirectTo URL for email verification
    const redirectUrl = options.options?.redirectTo || `${window.location.origin}/verify-email`;

    const response = await nhost.auth.signUp({
      email,
      password,
      options: {
        displayName: options.displayName,
        metadata: options.metadata,
        redirectTo: redirectUrl,
        locale: options.options?.locale || 'en',
        allowedRoles: options.options?.allowedRoles || ['user'],
        defaultRole: options.options?.defaultRole || 'user',
        // Explicitly enable email verification
        emailVerification: true
      }
    });

    // Enhanced logging for email verification debugging
    console.log('Nhost signup response:', {
      success: !response.error,
      error: response.error,
      needsEmailVerification: response.session === null && response.error === null,
      hasSession: !!response.session,
      hasUser: !!response.user,
      redirectUrl: redirectUrl
    });

    if (response.error) {
      console.error('Signup error:', response.error);
      
      // Check if error is related to service unavailability
      if (response.error.message?.includes('stopped service') || 
          response.error.message?.includes('final state') ||
          response.error.status === 503) {
        isServiceAvailable = false;
        return { 
          error: {
            message: "Authentication service is currently unavailable. Please try again later.",
            code: "service_unavailable",
            originalError: response.error
          }
        };
      }
      
      return { error: response.error };
    }

    // Check if email verification is needed
    const needsEmailVerification = 
      response.session === null && 
      response.error === null;

    return {
      success: true,
      needsEmailVerification,
      session: response.session,
      user: response.user,
      email: email,
      redirectUrl: redirectUrl
    };
  } catch (error) {
    console.error('Unexpected signup error:', error);
    
    // Check if error is related to network issues or service unavailability
    if (error.message?.includes('NetworkError') || 
        error.message?.includes('Failed to fetch') ||
        error.message?.includes('stopped service')) {
      isServiceAvailable = false;
      return { 
        error: {
          message: "Unable to connect to authentication service. Please check your internet connection or try again later.",
          code: "network_error",
          originalError: error
        }
      };
    }
    
    return { error };
  }
};

/**
 * Sign in with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<Object>} Response with success or error
 */
export const signInWithEmailPassword = async (email, password) => {
  try {
    // Check service availability before attempting sign in
    if (!isServiceAvailable) {
      const available = await checkServiceAvailability();
      if (!available) {
        return { 
          error: {
            message: "Authentication service is currently unavailable. Please try again later.",
            code: "service_unavailable"
          }
        };
      }
    }

    const response = await nhost.auth.signIn({
      email,
      password
    });

    if (response.error) {
      console.error('Signin error:', response.error);
      
      // Check if error is related to service unavailability
      if (response.error.message?.includes('stopped service') || 
          response.error.message?.includes('final state') ||
          response.error.status === 503) {
        isServiceAvailable = false;
        return { 
          error: {
            message: "Authentication service is currently unavailable. Please try again later.",
            code: "service_unavailable",
            originalError: response.error
          }
        };
      }
      
      return { error: response.error };
    }

    return {
      success: true,
      session: response.session,
      user: response.user
    };
  } catch (error) {
    console.error('Unexpected signin error:', error);
    
    // Check if error is related to network issues or service unavailability
    if (error.message?.includes('NetworkError') || 
        error.message?.includes('Failed to fetch') ||
        error.message?.includes('stopped service')) {
      isServiceAvailable = false;
      return { 
        error: {
          message: "Unable to connect to authentication service. Please check your internet connection or try again later.",
          code: "network_error",
          originalError: error
        }
      };
    }
    
    return { error };
  }
};

/**
 * Sign in with OAuth provider
 * @param {string} provider - OAuth provider (google, github, etc.)
 * @returns {Promise<Object>} Response with success or error
 */
export const signInWithProvider = async (provider) => {
  try {
    // Check service availability before attempting OAuth sign in
    if (!isServiceAvailable) {
      const available = await checkServiceAvailability();
      if (!available) {
        return { 
          error: {
            message: "Authentication service is currently unavailable. Please try again later.",
            code: "service_unavailable"
          }
        };
      }
    }

    // Validate provider
    if (!['google', 'github', 'facebook', 'apple'].includes(provider)) {
      return { error: { message: `Unsupported provider: ${provider}` } };
    }

    const response = await nhost.auth.signIn({
      provider
    });

    // OAuth sign-in usually redirects, so we might not get here
    // But in case it returns (e.g., in development or test environments)
    if (response && response.error) {
      console.error(`${provider} signin error:`, response.error);
      
      // Check if error is related to service unavailability
      if (response.error.message?.includes('stopped service') || 
          response.error.message?.includes('final state') ||
          response.error.status === 503) {
        isServiceAvailable = false;
        return { 
          error: {
            message: "Authentication service is currently unavailable. Please try again later.",
            code: "service_unavailable",
            originalError: response.error
          }
        };
      }
      
      return { error: response.error };
    }

    return {
      success: true,
      // Other properties might not be available due to redirect
    };
  } catch (error) {
    console.error(`Unexpected ${provider} signin error:`, error);
    
    // Check if error is related to network issues or service unavailability
    if (error.message?.includes('NetworkError') || 
        error.message?.includes('Failed to fetch') ||
        error.message?.includes('stopped service')) {
      isServiceAvailable = false;
      return { 
        error: {
          message: "Unable to connect to authentication service. Please check your internet connection or try again later.",
          code: "network_error",
          originalError: error
        }
      };
    }
    
    return { error };
  }
};

/**
 * Resend verification email
 * @param {string} email - User's email address
 * @returns {Promise<Object>} Response with success or error
 */
export const resendVerificationEmail = async (email) => {
  try {
    // Check service availability first
    if (!isServiceAvailable) {
      const available = await checkServiceAvailability();
      if (!available) {
        return { 
          error: {
            message: "Authentication service is currently unavailable. Please try again later.",
            code: "service_unavailable"
          }
        };
      }
    }

    const response = await nhost.auth.sendVerificationEmail({
      email,
      options: {
        redirectTo: `${window.location.origin}/verify-email`
      }
    });

    if (response.error) {
      console.error('Error resending verification email:', response.error);
      return { error: response.error };
    }

    return {
      success: true,
      message: "Verification email has been resent. Please check your inbox."
    };
  } catch (error) {
    console.error('Unexpected error resending verification email:', error);
    return { error };
  }
};

/**
 * Verify email with token
 * @param {string} token - Verification token from email link
 * @returns {Promise<Object>} Response with success or error
 */
export const verifyEmail = async (token) => {
  try {
    if (!token) {
      return {
        error: {
          message: "No verification token provided",
          code: "invalid_token"
        }
      };
    }

    // The token is typically handled automatically by Nhost when the user clicks the link
    // This function can be used to handle additional post-verification logic
    const isAuthenticated = nhost.auth.isAuthenticated();
    const user = nhost.auth.getUser();

    return {
      success: true,
      isAuthenticated,
      user,
      message: "Email verification successful"
    };
  } catch (error) {
    console.error('Error verifying email:', error);
    return { error };
  }
};
