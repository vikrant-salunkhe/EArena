import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Shield,
    Trophy,
    Calendar,
    Users,
    DollarSign,
    CheckCircle2,
    Clock,
    XCircle,
    ArrowRight,
    Search,
    AlertCircle,
    Crown,
    ExternalLink,
    Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { registrationService } from '../../services/registrationService';
import { useAuth } from '../../context/AuthContext';

const MyRegistrationsPage = () => {
    const { user } = useAuth();
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [cancellingId, setCancellingId] = useState(null);

    const fetchMyRegistrations = async () => {
        try {
            setLoading(true);
            const res = await registrationService.getMyRegistrations();
            setRegistrations(res.data || []);
        } catch (error) {
            console.error('Failed to fetch user registrations:', error);
            toast.error('Failed to load your registrations');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyRegistrations();
    }, []);

    const handleCancel = async (registrationId) => {
        if (!window.confirm('Are you sure you want to cancel this tournament registration?')) {
            return;
        }
        try {
            setCancellingId(registrationId);
            await registrationService.cancelRegistration(registrationId);
            toast.success('Registration cancelled successfully.');
            fetchMyRegistrations();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to cancel registration');
        } finally {
            setCancellingId(null);
        }
    };

    // Filter registrations
    const filteredRegistrations = registrations.filter((reg) => {
        const matchesStatus =
            statusFilter === 'all' ||
            (statusFilter === 'APPROVED' && reg.status === 'APPROVED') ||
            (statusFilter === 'PENDING' && reg.status === 'PENDING') ||
            (statusFilter === 'CANCELLED' && reg.status === 'CANCELLED') ||
            (statusFilter === 'REJECTED' && reg.status === 'REJECTED');

        const title = reg.tournament?.title?.toLowerCase() || '';
        const game = reg.tournament?.game?.toLowerCase() || '';
        const teamName = reg.team?.name?.toLowerCase() || '';
        const query = search.toLowerCase();

        const matchesSearch =
            !query || title.includes(query) || game.includes(query) || teamName.includes(query);

        return matchesStatus && matchesSearch;
    });

    const activeCount = registrations.filter((r) => r.status === 'APPROVED').length;
    const pendingCount = registrations.filter((r) => r.status === 'PENDING').length;

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight flex items-center">
                        <Trophy className="w-8 h-8 mr-3 text-indigo-500" />
                        My Tournament Registrations
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Track your squad's enrolled esports tournaments, schedules, and approval statuses.
                    </p>
                </div>

                <Link
                    to="/tournaments"
                    className="inline-flex items-center px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition self-start md:self-auto"
                >
                    <Search className="w-4 h-4 mr-2" />
                    Browse Tournaments
                </Link>
            </div>

            {/* Stats Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 shadow-lg flex items-center justify-between">
                    <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                            Total Registrations
                        </span>
                        <span className="text-2xl font-black text-white mt-1 block">
                            {registrations.length}
                        </span>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <Trophy className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 shadow-lg flex items-center justify-between">
                    <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                            Confirmed Slots
                        </span>
                        <span className="text-2xl font-black text-emerald-400 mt-1 block">
                            {activeCount}
                        </span>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 shadow-lg flex items-center justify-between">
                    <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                            Pending Reviews
                        </span>
                        <span className="text-2xl font-black text-amber-400 mt-1 block">
                            {pendingCount}
                        </span>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                        <Clock className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search by tournament name, game, or squad..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
                    />
                </div>

                <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
                    {[
                        { label: 'All', value: 'all' },
                        { label: 'Approved', value: 'APPROVED' },
                        { label: 'Pending', value: 'PENDING' },
                        { label: 'Cancelled', value: 'CANCELLED' }
                    ].map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => setStatusFilter(tab.value)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                                statusFilter === tab.value
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                                    : 'bg-slate-800/70 border border-slate-700 text-slate-400 hover:text-white'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Registrations List */}
            {loading ? (
                <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
                    <Loader2 className="w-7 h-7 animate-spin mr-3 text-indigo-500" />
                    Loading your tournament registrations...
                </div>
            ) : filteredRegistrations.length === 0 ? (
                <div className="bg-slate-800/40 border border-slate-800 rounded-3xl p-16 text-center space-y-4">
                    <Shield className="w-16 h-16 text-slate-600 mx-auto" />
                    <h3 className="text-xl font-bold text-white">No Registrations Found</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        {search || statusFilter !== 'all'
                            ? 'No registrations match your search filters.'
                            : "You haven't registered your squad for any tournaments yet."}
                    </p>
                    <Link
                        to="/tournaments"
                        className="inline-flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-indigo-600/30"
                    >
                        Explore Tournaments
                        <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredRegistrations.map((reg) => {
                        const tourney = reg.tournament || {};
                        const squad = reg.team || {};
                        const isCaptain =
                            squad.captain?._id === user?._id || squad.captain === user?._id;
                        const isDeadlinePassed =
                            tourney.registrationDeadline &&
                            new Date() > new Date(tourney.registrationDeadline);
                        const canCancel =
                            isCaptain &&
                            reg.status !== 'CANCELLED' &&
                            tourney.status === 'UPCOMING' &&
                            !isDeadlinePassed;

                        const startDateFormatted = tourney.startDate
                            ? new Date(tourney.startDate).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                              })
                            : 'TBD';

                        return (
                            <div
                                key={reg._id}
                                className="bg-slate-800/70 border border-slate-700/80 rounded-3xl overflow-hidden shadow-xl hover:border-slate-600 transition flex flex-col justify-between group"
                            >
                                <div>
                                    {/* Tournament Banner Strip */}
                                    <div className="relative h-28 w-full overflow-hidden bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950">
                                        {tourney.banner ? (
                                            <img
                                                src={tourney.banner}
                                                alt={tourney.title}
                                                className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Trophy className="w-12 h-12 text-purple-500/20" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

                                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                                            <span className="px-2.5 py-0.5 rounded-lg bg-purple-600/90 backdrop-blur-md text-white font-bold text-[10px] uppercase tracking-wider">
                                                {tourney.game || 'Esports'}
                                            </span>
                                            <span
                                                className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md ${
                                                    reg.status === 'APPROVED'
                                                        ? 'bg-emerald-500/80 text-white'
                                                        : reg.status === 'PENDING'
                                                        ? 'bg-amber-500/80 text-white'
                                                        : reg.status === 'CANCELLED'
                                                        ? 'bg-slate-700/80 text-slate-300'
                                                        : 'bg-rose-500/80 text-white'
                                                }`}
                                            >
                                                {reg.status}
                                            </span>
                                        </div>

                                        <div className="absolute bottom-2.5 left-4 right-4">
                                            <h3 className="text-base font-black text-white truncate drop-shadow">
                                                {tourney.title || 'Tournament'}
                                            </h3>
                                        </div>
                                    </div>

                                    {/* Body details */}
                                    <div className="p-5 space-y-4">
                                        {/* Registered Squad Snapshot */}
                                        <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-700/60 flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                {squad.logo ? (
                                                    <img
                                                        src={squad.logo}
                                                        alt={squad.name}
                                                        className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold shrink-0">
                                                        {squad.tag || 'SQ'}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="flex items-center space-x-1.5">
                                                        <h4 className="text-xs font-black text-white">
                                                            {squad.name}
                                                        </h4>
                                                        <span className="text-[10px] text-indigo-400 font-bold">
                                                            [{squad.tag}]
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-slate-400">
                                                        Registered Roster: {reg.players?.length || 0} Players
                                                    </p>
                                                </div>
                                            </div>
                                            {isCaptain && (
                                                <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-bold flex items-center">
                                                    <Crown className="w-3 h-3 mr-1" />
                                                    Captain
                                                </span>
                                            )}
                                        </div>

                                        {/* Info Specs */}
                                        <div className="grid grid-cols-2 gap-3 text-xs">
                                            <div className="flex items-center space-x-2 text-slate-300">
                                                <Calendar className="w-4 h-4 text-purple-400 shrink-0" />
                                                <span className="truncate">Kickoff: <strong>{startDateFormatted}</strong></span>
                                            </div>
                                            <div className="flex items-center space-x-2 text-slate-300">
                                                <DollarSign className="w-4 h-4 text-emerald-400 shrink-0" />
                                                <span>
                                                    Fee: <strong>{tourney.entryFee === 0 ? 'FREE' : `₹${tourney.entryFee}`}</strong>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className="p-4 bg-slate-900/50 border-t border-slate-700/60 flex items-center justify-between gap-3">
                                    <span className="text-[10px] text-slate-400">
                                        Enrolled on {new Date(reg.createdAt).toLocaleDateString()}
                                    </span>

                                    <div className="flex items-center space-x-2">
                                        {canCancel && (
                                            <button
                                                onClick={() => handleCancel(reg._id)}
                                                disabled={cancellingId === reg._id}
                                                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/40 border border-slate-700 text-slate-400 hover:text-rose-300 text-xs font-semibold transition"
                                            >
                                                Cancel Slot
                                            </button>
                                        )}

                                        <Link
                                            to={`/tournaments/${tourney._id}`}
                                            className="inline-flex items-center px-3.5 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600 border border-indigo-500/40 text-indigo-300 hover:text-white text-xs font-bold transition"
                                        >
                                            View Event
                                            <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MyRegistrationsPage;
