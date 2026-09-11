import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, LogOut, LayoutDashboard, Shield, Users, Trophy, Calendar, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const DashboardLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const handleLogout = async () => {
        try {
            await logout();
            toast.success('Logged out successfully');
        } catch (error) {
            toast.error('Failed to log out');
        }
    };

    const isOrganizerOrAdmin = user?.role === 'ORGANIZER' || user?.role === 'ADMIN';

    const navigation = [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'Tournaments', href: '/tournaments', icon: Trophy },
        ...(isOrganizerOrAdmin ? [{ name: 'My Tournaments', href: '/my-tournaments', icon: Calendar }] : []),
        { name: 'Registrations', href: '/registrations', icon: UserCheck },
        { name: 'Explore Teams', href: '/teams', icon: Users },
        { name: 'My Squad', href: '/my-team', icon: Shield },
        { name: 'Profile', href: '/profile', icon: User },
    ];



    return (
        <div className="min-h-screen bg-slate-900 flex text-white">
            {/* Sidebar (Minimal) */}
            <aside className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-indigo-500 tracking-tight">EArena</h1>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    {navigation.map((item) => {
                        const isActive = location.pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${isActive
                                        ? 'bg-indigo-600 text-white'
                                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                                    }`}
                            >
                                <Icon className="w-5 h-5 mr-3" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-700">
                    <div className="flex items-center mb-4 px-2">
                        <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden shrink-0">
                            {user?.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div className="ml-3 truncate">
                            <p className="text-sm font-medium truncate">{user?.name}</p>
                            <p className="text-xs text-slate-400 truncate">@{user?.username}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2 text-sm text-red-400 hover:bg-slate-700 hover:text-red-300 rounded-lg transition-colors"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="p-8 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
