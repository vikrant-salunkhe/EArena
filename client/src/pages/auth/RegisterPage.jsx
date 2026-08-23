import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

const registerSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    username: z.string().min(3, 'Username must be at least 3 characters').regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    email: z.string().email('Invalid email address'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[a-z]/, 'Must contain lowercase')
        .regex(/[A-Z]/, 'Must contain uppercase')
        .regex(/[0-9]/, 'Must contain number')
        .regex(/[\W_]/, 'Must contain special character'),
    role: z.enum(['PLAYER', 'ORGANIZER']).default('PLAYER')
});

const RegisterPage = () => {
    const { register: registerUser, isRegistering } = useAuth();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            role: 'PLAYER'
        }
    });

    const onSubmit = async (data) => {
        try {
            await registerUser(data);
            toast.success('Registration successful! Please login.');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to register');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-12">
            <div className="max-w-md w-full bg-slate-800 rounded-xl shadow-xl overflow-hidden p-8 border border-slate-700">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white">Create Account</h2>
                    <p className="text-slate-400 mt-2">Join EArena today</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
                        <input
                            {...register('name')}
                            type="text"
                            className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="John Doe"
                        />
                        {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Username</label>
                        <input
                            {...register('username')}
                            type="text"
                            className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="johndoe"
                        />
                        {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                        <input
                            {...register('email')}
                            type="email"
                            className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="john@example.com"
                        />
                        {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                        <div className="relative">
                            <input
                                {...register('password')}
                                type={showPassword ? "text" : "password"}
                                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
                                placeholder="Create a strong password"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-300"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">I want to join as</label>
                        <div className="grid grid-cols-2 gap-4">
                            <label className="relative flex cursor-pointer rounded-lg border bg-slate-900 p-3 shadow-sm hover:border-indigo-400 has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-500/10">
                                <input {...register('role')} type="radio" value="PLAYER" className="sr-only" />
                                <span className="text-sm font-medium text-white">Player</span>
                            </label>
                            <label className="relative flex cursor-pointer rounded-lg border bg-slate-900 p-3 shadow-sm hover:border-indigo-400 has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-500/10">
                                <input {...register('role')} type="radio" value="ORGANIZER" className="sr-only" />
                                <span className="text-sm font-medium text-white">Organizer</span>
                            </label>
                        </div>
                        {errors.role && <p className="text-red-400 text-xs mt-1">{errors.role.message}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isRegistering}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isRegistering ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <p className="text-center text-slate-400 mt-6 text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
