import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const useUserRole = () => {
  const [role, setRole] = useState('user');
  const [isLoading, setIsLoading] = useState(true);
  const { getToken, isSignedIn } = useAuth();

  useEffect(() => {
    if (!isSignedIn) {
      setRole('user');
      setIsLoading(false);
      return;
    }

    const fetchRole = async () => {
      setIsLoading(true);
      try {
        const token = await getToken();
        const response = await fetch(`${API_BASE_URL}/users/role`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user role');
        }

        const data = await response.json();
        setRole(data.role);
      } catch (error) {
        console.error(error);
        setRole('user'); // Default to 'user' on error for security
      } finally {
        setIsLoading(false);
      }
    };

    fetchRole();
  }, [getToken, isSignedIn]);

  // Return the role, a boolean for convenience, and loading state
  return { role, isAdmin: role === 'admin', isLoading };
};