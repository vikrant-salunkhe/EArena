import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { 
    useProfile, 
    useUpdateProfile, 
    useUploadAvatar, 
    useDeleteAvatar, 
    useChangePassword 
} from '../../hooks/useUser';
import { Camera, Trash2, Save, Loader2 } from 'lucide-react';

const profileSchema = z.object({
    name: z.string().min(1, 'Name cannot be empty').optional(),
    bio: z.string().max(300, 'Bio must be at most 300 characters').optional().or(z.literal('')),
    country: z.string().max(100, 'Country must be at most 100 characters').optional().or(z.literal(''))
});

const passwordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[\W_]/, 'Password must contain at least one special character'),
    confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

const ProfilePage = () => {
    const { data: response, isLoading: isProfileLoading } = useProfile();
    const updateProfile = useUpdateProfile();
    const uploadAvatar = useUploadAvatar();
    const deleteAvatar = useDeleteAvatar();
    const changePassword = useChangePassword();
    
    const fileInputRef = useRef(null);

    const user = response?.data;

    const {
        register: registerProfile,
        handleSubmit: handleSubmitProfile,
        formState: { errors: profileErrors }
    } = useForm({
        resolver: zodResolver(profileSchema),
        values: {
            name: user?.name || '',
            bio: user?.bio || '',
            country: user?.country || ''
        }
    });

    const {
        register: registerPassword,
        handleSubmit: handleSubmitPassword,
        reset: resetPassword,
        formState: { errors: passwordErrors }
    } = useForm({
        resolver: zodResolver(passwordSchema)
    });

    const onProfileSubmit = async (data) => {
        try {
            await updateProfile.mutateAsync(data);
            toast.success('Profile updated successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        }
    };

    const onPasswordSubmit = async (data) => {
        try {
            await changePassword.mutateAsync({
                currentPassword: data.currentPassword,
                newPassword: data.newPassword
            });
            toast.success('Password changed successfully');
            resetPassword();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to change password');
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            return toast.error('File size must be less than 5MB');
        }

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            await uploadAvatar.mutateAsync(formData);
            toast.success('Avatar uploaded successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to upload avatar');
        }
        
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleDeleteAvatar = async () => {
        try {
            await deleteAvatar.mutateAsync();
            toast.success('Avatar removed successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to remove avatar');
        }
    };

    if (isProfileLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
                <p className="text-slate-400">Manage your account details and preferences.</p>
            </div>

            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <div className="p-6 sm:p-8">
                    <h2 className="text-xl font-semibold text-white mb-6">Avatar</h2>
                    <div className="flex items-center space-x-6">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-slate-700 overflow-hidden shrink-0 border-4 border-slate-600 relative group">
                            {user?.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl text-slate-400 font-bold bg-slate-700">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-2 text-white hover:text-indigo-400 transition-colors"
                                    title="Upload new avatar"
                                    disabled={uploadAvatar.isPending}
                                    type="button"
                                >
                                    {uploadAvatar.isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : <Camera className="w-6 h-6" />}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleFileChange} 
                                accept="image/jpeg,image/png,image/webp"
                                className="hidden" 
                            />
                            <div className="flex space-x-3">
                                <button 
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploadAvatar.isPending}
                                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center"
                                >
                                    <Camera className="w-4 h-4 mr-2" />
                                    Change Avatar
                                </button>
                                {user?.avatar && (
                                    <button 
                                        type="button"
                                        onClick={handleDeleteAvatar}
                                        disabled={deleteAvatar.isPending}
                                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-sm font-medium rounded-lg transition-colors flex items-center"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Remove
                                    </button>
                                )}
                            </div>
                            <p className="text-xs text-slate-400">JPG, PNG or WEBP. Max size of 5MB.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <form onSubmit={handleSubmitProfile(onProfileSubmit)} className="p-6 sm:p-8">
                    <h2 className="text-xl font-semibold text-white mb-6">Personal Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
                            <input
                                type="text"
                                value={user?.username || ''}
                                disabled
                                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-400 cursor-not-allowed opacity-70"
                            />
                            <p className="text-xs text-slate-500 mt-1">Username cannot be changed.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                            <input
                                type="email"
                                value={user?.email || ''}
                                disabled
                                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-400 cursor-not-allowed opacity-70"
                            />
                            <p className="text-xs text-slate-500 mt-1">Email cannot be changed here.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                            <input
                                {...registerProfile('name')}
                                type="text"
                                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                            />
                            {profileErrors.name && <p className="text-red-400 text-xs mt-1">{profileErrors.name.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Country</label>
                            <input
                                {...registerProfile('country')}
                                type="text"
                                placeholder="e.g. India"
                                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                            />
                            {profileErrors.country && <p className="text-red-400 text-xs mt-1">{profileErrors.country.message}</p>}
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-300 mb-2">Bio</label>
                            <textarea
                                {...registerProfile('bio')}
                                rows={4}
                                placeholder="Tell us a little bit about yourself"
                                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors resize-none"
                            ></textarea>
                            {profileErrors.bio && <p className="text-red-400 text-xs mt-1">{profileErrors.bio.message}</p>}
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end">
                        <button
                            type="submit"
                            disabled={updateProfile.isPending}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors flex items-center disabled:opacity-50"
                        >
                            {updateProfile.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="p-6 sm:p-8">
                    <h2 className="text-xl font-semibold text-white mb-6">Change Password</h2>
                    <div className="space-y-5 max-w-md">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Current Password</label>
                            <input
                                {...registerPassword('currentPassword')}
                                type="password"
                                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                            />
                            {passwordErrors.currentPassword && <p className="text-red-400 text-xs mt-1">{passwordErrors.currentPassword.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
                            <input
                                {...registerPassword('newPassword')}
                                type="password"
                                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                            />
                            {passwordErrors.newPassword && <p className="text-red-400 text-xs mt-1">{passwordErrors.newPassword.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Confirm New Password</label>
                            <input
                                {...registerPassword('confirmPassword')}
                                type="password"
                                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                            />
                            {passwordErrors.confirmPassword && <p className="text-red-400 text-xs mt-1">{passwordErrors.confirmPassword.message}</p>}
                        </div>
                    </div>
                    <div className="mt-8 flex justify-start">
                        <button
                            type="submit"
                            disabled={changePassword.isPending}
                            className="bg-slate-700 hover:bg-slate-600 text-white font-medium py-2.5 px-6 rounded-lg transition-colors flex items-center disabled:opacity-50"
                        >
                            {changePassword.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                            Update Password
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;
