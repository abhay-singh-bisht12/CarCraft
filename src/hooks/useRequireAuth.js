import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Custom hook to guard customer actions that require an authenticated account.
 * If authenticated, executes the desired action callback.
 * If unauthenticated, safely redirects to /login preserving current location and contextual message.
 */
export function useRequireAuth() {
  const { isAuthenticated, user, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const requireAuth = (callback, options = {}) => {
    if (isAuthenticated) {
      if (typeof callback === 'function') {
        callback();
      }
      return true;
    }

    const {
      message = 'Please sign in to your CarCraft account to continue.',
      actionData = null,
    } = options;

    navigate('/login', {
      state: {
        from: location,
        message,
        actionData,
      },
    });

    return false;
  };

  return {
    isAuthenticated,
    user,
    token,
    requireAuth,
  };
}
