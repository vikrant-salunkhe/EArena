import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout & Guards
import ProtectedRoute from './components/layout/ProtectedRoute';

// Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

const App = () => {
    return (
        <>
            <Toaster position="top-right" />
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                
                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                    {/* Placeholder Dashboard */}
                    <Route path="/" element={
                        <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-2xl font-bold">
                            EArena Dashboard
                        </div>
                    } />
                </Route>
                
                {/* 404 */}
                <Route path="*" element={
                    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-2xl font-bold">
                        404 - Not Found
                    </div>
                } />
            </Routes>
        </>
    );
};

export default App;
