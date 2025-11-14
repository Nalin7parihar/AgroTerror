// React 19 compatibility shim for @react-three/fiber
if (typeof window !== 'undefined') {
  try {
    const React = require('react');
    
    // Make React available globally for @react-three/fiber
    if (!(window as any).React) {
      (window as any).React = React;
    }
    
    // React 19 compatibility - ensure ReactCurrentOwner exists
    if (React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
      const internals = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
      if (!internals.ReactCurrentOwner) {
        internals.ReactCurrentOwner = {
          current: null,
        };
      }
    }
  } catch (e) {
    console.warn('React compatibility shim failed:', e);
  }
}

