import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Authentication store for managing user session and auth state
 * @typedef {Object} User
 * @property {string} id - User ID
 * @property {string} name - User full name
 * @property {string} email - User email
 * @property {'patient'|'pharmacy'|'doctor'|'admin'} role - User role
 * @property {string} [avatar] - User avatar URL
 */

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      setToken: (token) => set({ token }),
      
      login: (user, token) => set({ 
        user, 
        token, 
        isAuthenticated: true 
      }),
      
      logout: () => set({ 
        user: null, 
        token: null, 
        isAuthenticated: false 
      }),
      
      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null
      })),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      // Utility functions
      hasRole: (role) => {
        const { user } = get();
        return user?.role === role;
      },
      
      hasAnyRole: (roles) => {
        const { user } = get();
        return user && roles.includes(user.role);
      },
      
      getUser: () => get().user,
      
      getToken: () => get().token,
    }),
    {
      name: 'shifamart-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
