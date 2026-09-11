import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout & Guards
import ProtectedRoute from './components/layout/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Dashboard Pages
import ProfilePage from './pages/dashboard/ProfilePage';
import TeamsPage from './pages/dashboard/TeamsPage';
import MyTeamPage from './pages/dashboard/MyTeamPage';
import TeamDetailPage from './pages/dashboard/TeamDetailPage';
import TournamentsPage from './pages/dashboard/TournamentsPage';
import TournamentDetailPage from './pages/dashboard/TournamentDetailPage';
import MyTournamentsPage from './pages/dashboard/MyTournamentsPage';
import MyRegistrationsPage from './pages/dashboard/MyRegistrationsPage';

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
                    <Route element={<DashboardLayout />}>
                        <Route path="/" element={
                            <div className="text-white text-2xl font-bold flex justify-center items-center h-full">
                                EArena Dashboard
                            </div>
                        } />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/tournaments" element={<TournamentsPage />} />
                        <Route path="/tournaments/:tournamentId" element={<TournamentDetailPage />} />
                        <Route path="/my-tournaments" element={<MyTournamentsPage />} />
                        <Route path="/registrations" element={<MyRegistrationsPage />} />
                        <Route path="/teams" element={<TeamsPage />} />
                        <Route path="/teams/:teamId" element={<TeamDetailPage />} />
                        <Route path="/my-team" element={<MyTeamPage />} />
                    </Route>
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
