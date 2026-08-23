import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/userService';

export const useProfile = () => {
    return useQuery({
        queryKey: ['userProfile'],
        queryFn: userService.getProfile
    });
};

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: userService.updateProfile,
        onSuccess: (data) => {
            queryClient.setQueryData(['userProfile'], data);
            queryClient.invalidateQueries({ queryKey: ['authUser'] });
        }
    });
};

export const useUploadAvatar = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: userService.uploadAvatar,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
            queryClient.invalidateQueries({ queryKey: ['authUser'] });
        }
    });
};

export const useDeleteAvatar = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: userService.deleteAvatar,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
            queryClient.invalidateQueries({ queryKey: ['authUser'] });
        }
    });
};

export const useChangePassword = () => {
    return useMutation({
        mutationFn: userService.changePassword
    });
};
