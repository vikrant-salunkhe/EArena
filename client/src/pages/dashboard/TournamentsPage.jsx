import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Trophy,
    Search,
    Plus,
    Calendar,
    Gamepad2,
    Users,
    DollarSign,
    Sparkles,
    Flame,
    Clock,
    CheckCircle2,
    ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { tournamentService } from '../../services/tournamentService';
import { useAuth } from '../../context/AuthContext';
import CreateTournamentModal from '../../components/tournaments/CreateTournamentModal';

const GAMES = [
    { label: 'All Games', value: 'all' },
    { label: 'BGMI', value: 'BGMI' },
    { label: 'Valorant', value: 'Valorant' },
    { label: 'CS2', value: 'CS2' },
    { label: 'Free Fire', value: 'Free Fire' },
    { label: 'COD Mobile', value: 'Call of Duty: Mobile' },
    { label: 'Apex Legends', value: 'Apex Legends' }
];

const STATUS_TABS = [
    { label: 'All Events', value: 'all' },
    { label: 'Upcoming', value: 'UPCOMING' },
    { label: 'Live Now 🔴', value: 'LIVE' },
    { label: 'Completed', value: 'COMPLETED' }
];

const TournamentsPage = () => {
    const { user } = useAuth();
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedGame, setSelectedGame] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 });

    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const isOrganizerOrAdmin = user?.role === 'ORGANIZER' || user?.role === 'ADMIN';

    const fetchTournaments = async (
        page = 1,
        currentSearch = search,
        currentGame = selectedGame,
        currentStatus = selectedStatus
    ) => {
        try {
            setLoading(true);
            const res = await tournamentService.getTournaments({
                page,
                limit: 9,
                search: currentSearch || undefined,
                game: currentGame !== 'all' ? currentGame : undefined,
                status: currentStatus !== 'all' ? currentStatus : undefined
            });

            setTournaments(res.data?.items || []);
            setPagination(res.data?.pagination || { page: 1, totalPages: 1, totalItems: 0 });
        } catch (error) {
            console.error('Failed to fetch tournaments:', error);
            toast.error('Failed to load tournaments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchTournaments(1, search, selectedGame, selectedStatus);
        }, 300);
        return () => clearTimeout(timer);
    }, [search, selectedGame, selectedStatus]);

    const handleTournamentCreated = (newTournament) => {
        fetchTournaments(1, search, selectedGame, selectedStatus);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'LIVE':
                return (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 text-xs font-bold animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-rose-500 mr-1.5 animate-ping" />
                        LIVE NOW
                    </span>
                );
            case 'UPCOMING':
                return (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                        <Clock className="w-3.5 h-3.5 mr-1" />
                        Registration Open
                    </span>
                );
            case 'COMPLETED':
                return (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-700/60 border border-slate-600 text-slate-300 text-xs font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        Completed
                    </span>
                );
            case 'DRAFT':
                return (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
                        Draft
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-800 text-slate-400 text-xs font-semibold">
                        {status}
                    </span>
                );
        }
    };

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Hero Header */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border border-slate-700/80 p-8 md:p-10 shadow-2xl">
                <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -left-10 -top-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2 max-w-xl">
                        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-300">
                            <Flame className="w-3.5 h-3.5 text-purple-400" />
                            <span>Competitive Arena</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                            Esports <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400">Tournaments</span>
                        </h1>
                        <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                            Discover premier esports cups, compete for prize pools, and test your squad's skills in official tournaments.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {isOrganizerOrAdmin && (
                            <>
                                <button
                                    onClick={() => setIsCreateOpen(true)}
                                    className="inline-flex items-center px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-purple-600/30 transition transform hover:-translate-y-0.5"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Host Tournament
                                </button>
                                <Link
                                    to="/my-tournaments"
                                    className="inline-flex items-center px-5 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-sm transition transform hover:-translate-y-0.5"
                                >
                                    <Trophy className="w-4 h-4 mr-2 text-amber-400" />
                                    Organizer Portal
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Status Tabs */}
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 overflow-x-auto scrollbar-none">
                {STATUS_TABS.map((tab) => (
                    <button
                        key={tab.value}
                        onClick={() => setSelectedStatus(tab.value)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                            selectedStatus === tab.value
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                                : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search tournament title or game..."
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                    />
                </div>

                <div className="flex items-center space-x-2 overflow-x-auto pb-1 max-w-full scrollbar-none">
                    {GAMES.map((game) => (
                        <button
                            key={game.value}
                            onClick={() => setSelectedGame(game.value)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                                selectedGame === game.value
                                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                            }`}
                        >
                            {game.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tournaments Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                        <div
                            key={n}
                            className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden h-96 animate-pulse flex flex-col justify-between"
                        >
                            <div className="h-44 bg-slate-700/60" />
                            <div className="p-5 space-y-3 flex-1">
                                <div className="h-5 bg-slate-700 rounded w-3/4" />
                                <div className="h-3 bg-slate-700/60 rounded w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : tournaments.length === 0 ? (
                <div className="bg-slate-800/30 border border-slate-700/60 rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mx-auto">
                        <Trophy className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-white">No Tournaments Found</h3>
                    <p className="text-slate-400 text-sm">
                        {search || selectedGame !== 'all' || selectedStatus !== 'all'
                            ? 'Try clearing or changing your filters to discover more events.'
                            : 'No published tournaments currently available. Organizers can host new tournaments anytime.'}
                    </p>
                    {isOrganizerOrAdmin && (
                        <button
                            onClick={() => setIsCreateOpen(true)}
                            className="inline-flex items-center px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Host Tournament
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tournaments.map((t) => {
                        const startDateFormatted = new Date(t.startDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        });

                        return (
                            <div
                                key={t._id}
                                className="group bg-slate-800/60 hover:bg-slate-800/90 border border-slate-700/70 hover:border-purple-500/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-purple-950/20 flex flex-col justify-between"
                            >
                                <div>
                                    {/* Banner / Graphic */}
                                    <div className="relative h-44 w-full bg-gradient-to-br from-slate-900 via-purple-950/50 to-indigo-950 overflow-hidden">
                                        {t.banner ? (
                                            <img
                                                src={t.banner}
                                                alt={t.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
                                                <Trophy className="w-12 h-12 text-purple-500/40 mb-1" />
                                                <span className="text-xs font-mono tracking-wider uppercase text-purple-400/60">
                                                    {t.game}
                                                </span>
                                            </div>
                                        )}

                                        {/* Status badge floating */}
                                        <div className="absolute top-3 left-3">
                                            {getStatusBadge(t.status)}
                                        </div>

                                        {/* Game badge */}
                                        <div className="absolute top-3 right-3">
                                            <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-white text-[11px] font-bold">
                                                {t.game}
                                            </span>
                                        </div>

                                        {/* Prize Pool overlay */}
                                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                                            <span className="px-2.5 py-1 rounded-lg bg-amber-500/90 backdrop-blur-md text-slate-950 text-xs font-black shadow-lg">
                                                ₹{t.prizePool?.toLocaleString()} Prize Pool
                                            </span>
                                            <span className="px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-md text-slate-300 text-[10px] font-semibold">
                                                {t.format}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Body */}
                                    <div className="p-5 space-y-3">
                                        <h3 className="font-black text-white text-lg group-hover:text-purple-300 transition line-clamp-1">
                                            {t.title}
                                        </h3>

                                        <p className="text-xs text-slate-400 line-clamp-2">
                                            {t.description || 'Join this competitive esports tournament. Gather your squad and secure victory.'}
                                        </p>

                                        {/* Specs Row */}
                                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700/60 text-xs text-slate-300">
                                            <div className="flex items-center space-x-1.5">
                                                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                                                <span>Starts {startDateFormatted}</span>
                                            </div>
                                            <div className="flex items-center space-x-1.5 justify-end">
                                                <Users className="w-3.5 h-3.5 text-cyan-400" />
                                                <span>Max {t.maxTeams} Squads</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action button */}
                                <div className="p-5 pt-0">
                                    <Link
                                        to={`/tournaments/${t._id}`}
                                        className="w-full flex items-center justify-center py-2.5 px-4 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/30 hover:border-transparent text-indigo-300 hover:text-white text-xs font-bold transition shadow-md"
                                    >
                                        <span>View Details</span>
                                        <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 pt-6">
                    <button
                        onClick={() => fetchTournaments(pagination.page - 1)}
                        disabled={pagination.page <= 1}
                        className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                        Previous
                    </button>
                    <span className="text-xs font-semibold text-slate-400 px-3">
                        Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                        onClick={() => fetchTournaments(pagination.page + 1)}
                        disabled={pagination.page >= pagination.totalPages}
                        className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Modal */}
            <CreateTournamentModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onTournamentCreated={handleTournamentCreated}
            />
        </div>
    );
};

export default TournamentsPage;
