import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';

const forgotPasswordSchema = z.object({
    email: z.string().email('Invalid email address')
});

const ForgotPasswordPage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(forgotPasswordSchema)
    });

    const onSubmit = async (data) => {
        try {
            setIsLoading(true);
            await authService.forgotPassword(data.email);
            setIsSent(true);
            toast.success('Password reset link sent to your email');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to process request');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
            <div className="max-w-md w-full bg-slate-800 rounded-xl shadow-xl overflow-hidden p-8 border border-slate-700">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white">Reset Password</h2>
                    <p className="text-slate-400 mt-2">Enter your email to receive a reset link</p>
                </div>

                {isSent ? (
                    <div className="text-center">
                        <div className="bg-emerald-500/10 text-emerald-400 p-4 rounded-lg mb-6 border border-emerald-500/20">
                            Check your email for the reset link! (In dev mode, check the backend console log).
                        </div>
                        <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium block mt-4">
                            Return to Login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                            <input
                                {...register('email')}
                                type="email"
                                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Enter your email"
                            />
                            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Sending...' : 'Send Reset Link'}
                        </button>

                        <p className="text-center text-slate-400 mt-4 text-sm">
                            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
                                Back to login
                            </Link>
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
