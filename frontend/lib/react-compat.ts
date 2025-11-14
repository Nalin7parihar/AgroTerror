// React 19 compatibility shim for @react-three/fiber
// This must run before any @react-three/fiber code is executed
import React from 'react';

try {
  // Make React available globally for @react-three/fiber
  if (typeof window !== 'undefined' && !(window as any).React) {
    (window as any).React = React;
  }
  
  // Additional safety: ensure the reconciler can access React
  if (typeof global !== 'undefined' && !(global as any).React) {
    (global as any).React = React;
  }
  
  // React 19 compatibility - ensure all required internals exist
  const internals = (React as any).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
  
  if (internals) {
    // Ensure ReactCurrentOwner exists
    if (!internals.ReactCurrentOwner) {
      internals.ReactCurrentOwner = {
        current: null,
      };
    }
    
    // Ensure ReactCurrentDispatcher exists
    if (!internals.ReactCurrentDispatcher) {
      internals.ReactCurrentDispatcher = {
        current: null,
      };
    }
    
    // React 19 transition API compatibility
    // The reconciler expects a transition property on the dispatcher
    if (internals.ReactCurrentDispatcher && !internals.ReactCurrentDispatcher.current) {
      internals.ReactCurrentDispatcher.current = {
        transition: null,
      };
    }
    
    // Ensure ReactCurrentBatchConfig exists (used by reconciler)
    if (!internals.ReactCurrentBatchConfig) {
      internals.ReactCurrentBatchConfig = {
        transition: null,
      };
    }
    
    // Ensure ReactCurrentActQueue exists
    if (!internals.ReactCurrentActQueue) {
      internals.ReactCurrentActQueue = {
        current: null,
      };
    }
  } else {
    // Fallback: create a complete structure if internals don't exist
    (React as any).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = {
      ReactCurrentOwner: {
        current: null,
      },
      ReactCurrentDispatcher: {
        current: {
          transition: null,
        },
      },
      ReactCurrentBatchConfig: {
        transition: null,
      },
      ReactCurrentActQueue: {
        current: null,
      },
    };
  }
  
  // Patch the reconciler's requestCurrentTransition function if it exists
  // This prevents errors when the reconciler tries to access transition
  if (typeof window !== 'undefined') {
    const originalRequestCurrentTransition = (window as any).__REACT_RECONCILER_REQUEST_CURRENT_TRANSITION;
    if (!originalRequestCurrentTransition) {
      (window as any).__REACT_RECONCILER_REQUEST_CURRENT_TRANSITION = () => null;
    }
  }
} catch (e) {
  console.warn('React compatibility shim failed:', e);
}

