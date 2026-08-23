import { createContext, useContext, useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const queryClient = useQueryClient();
    
    // Fetch current user on load
    const { data, isLoading, error } = useQuery({
        queryKey: ['authUser'],
        queryFn: authService.getMe,
        retry: false, // Don't retry if 401
    });

    const user = data?.data || null;
    const isAuthenticated = !!user;

    // Login Mutation
    const loginMutation = useMutation({
        mutationFn: authService.login,
        onSuccess: (res) => {
            queryClient.setQueryData(['authUser'], { data: res.data.user });
        }
    });

    // Register Mutation
    const registerMutation = useMutation({
        mutationFn: authService.register,
    });

    // Logout Mutation
    const logoutMutation = useMutation({
        mutationFn: authService.logout,
        onSuccess: () => {
            queryClient.setQueryData(['authUser'], null);
        }
    });

    const value = {
        user,
        isAuthenticated,
        isLoading,
        error,
        login: loginMutation.mutateAsync,
        isLoggingIn: loginMutation.isPending,
        register: registerMutation.mutateAsync,
        isRegistering: registerMutation.isPending,
        logout: logoutMutation.mutateAsync,
        isLoggingOut: logoutMutation.isPending
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
