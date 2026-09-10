import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Trophy,
    Plus,
    Calendar,
    Gamepad2,
    Users,
    Play,
    CheckSquare,
    CheckCircle2,
    Clock,
    XCircle,
    Trash2,
    ArrowRight,
    Edit3
} from 'lucide-react';
import toast from 'react-hot-toast';
import { tournamentService } from '../../services/tournamentService';
import { useAuth } from '../../context/AuthContext';
import CreateTournamentModal from '../../components/tournaments/CreateTournamentModal';

const STATUS_FILTERS = [
    { label: 'All My Tournaments', value: 'all' },
    { label: 'Drafts', value: 'DRAFT' },
    { label: 'Upcoming', value: 'UPCOMING' },
    { label: 'Live Now', value: 'LIVE' },
    { label: 'Completed', value: 'COMPLETED' }
];

const MyTournamentsPage = () => {
    const { user } = useAuth();
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const fetchMyTournaments = async () => {
        try {
            setLoading(true);
            const res = await tournamentService.getMyTournaments();
            setTournaments(res.data || []);
        } catch (error) {
            console.error('Failed to load my tournaments:', error);
            toast.error('Failed to load your tournaments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyTournaments();
    }, []);

    const handlePublish = async (id, title) => {
        try {
            await tournamentService.publishTournament(id);
            toast.success(`"${title}" is now published! 📢`);
            fetchMyTournaments();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to publish');
        }
    };

    const handleStart = async (id, title) => {
        if (!window.confirm(`Start "${title}"? It will go LIVE.`)) return;
        try {
            await tournamentService.startTournament(id);
            toast.success(`"${title}" is LIVE! 🔴`);
            fetchMyTournaments();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to start');
        }
    };

    const handleEnd = async (id, title) => {
        if (!window.confirm(`End "${title}" and mark as completed?`)) return;
        try {
            await tournamentService.endTournament(id);
            toast.success(`"${title}" marked completed! 🏆`);
            fetchMyTournaments();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to complete tournament');
        }
    };

    const handleDelete = async (id, title) => {
        if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
        try {
            await tournamentService.deleteTournament(id);
            toast.success('Tournament deleted.');
            fetchMyTournaments();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete tournament');
        }
    };

    const filtered = selectedFilter === 'all'
        ? tournaments
        : tournaments.filter((t) => t.status === selectedFilter);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'LIVE':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 text-xs font-bold animate-pulse">
                        LIVE NOW
                    </span>
                );
            case 'UPCOMING':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                        Upcoming
                    </span>
                );
            case 'COMPLETED':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-700/60 border border-slate-600 text-slate-300 text-xs font-semibold">
                        Completed
                    </span>
                );
            case 'DRAFT':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
                        Draft
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 text-xs font-semibold">
                        {status}
                    </span>
                );
        }
    };

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                        Organizer Portal
                    </h1>
                    <p className="text-slate-400 text-xs md:text-sm">
                        Manage your hosted esports events, open registrations, and oversee match stages.
                    </p>
                </div>

                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="inline-flex items-center px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition self-start md:self-auto"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Host New Tournament
                </button>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 overflow-x-auto scrollbar-none">
                {STATUS_FILTERS.map((f) => (
                    <button
                        key={f.value}
                        onClick={() => setSelectedFilter(f.value)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                            selectedFilter === f.value
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                                : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Tournaments List */}
            {loading ? (
                <div className="space-y-4 animate-pulse">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="h-32 bg-slate-800/60 rounded-2xl" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-slate-800/30 border border-slate-700/60 rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4">
                    <Trophy className="w-12 h-12 text-slate-600 mx-auto" />
                    <h3 className="text-lg font-bold text-white">No Tournaments in this category</h3>
                    <p className="text-slate-400 text-xs">
                        Create a tournament draft or start publishing your competitions.
                    </p>
                    <button
                        onClick={() => setIsCreateOpen(true)}
                        className="inline-flex items-center px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Host Tournament
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map((t) => (
                        <div
                            key={t._id}
                            className="bg-slate-800/60 hover:bg-slate-800 border border-slate-700/70 rounded-2xl p-5 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                            <div className="flex items-start space-x-4">
                                <div className="w-16 h-16 rounded-xl bg-purple-950/60 border border-purple-500/30 overflow-hidden flex items-center justify-center font-bold text-xs text-purple-300 shrink-0">
                                    {t.banner ? (
                                        <img src={t.banner} alt={t.title} className="w-full h-full object-cover" />
                                    ) : (
                                        t.game
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center space-x-2">
                                        {getStatusBadge(t.status)}
                                        <span className="text-xs font-mono font-bold text-purple-400">
                                            [{t.game}]
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-white text-base leading-tight">
                                        {t.title}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                                        <span>Prize: <strong className="text-amber-400">₹{t.prizePool?.toLocaleString()}</strong></span>
                                        <span>•</span>
                                        <span>Slots: <strong>{t.maxTeams} Squads</strong></span>
                                        <span>•</span>
                                        <span>Starts: {new Date(t.startDate).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-wrap items-center gap-2 self-end md:self-center">
                                {t.status === 'DRAFT' && (
                                    <button
                                        onClick={() => handlePublish(t._id, t.title)}
                                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md shadow-emerald-600/20"
                                    >
                                        Publish
                                    </button>
                                )}

                                {t.status === 'UPCOMING' && (
                                    <button
                                        onClick={() => handleStart(t._id, t.title)}
                                        className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-md shadow-rose-600/20"
                                    >
                                        Go LIVE
                                    </button>
                                )}

                                {t.status === 'LIVE' && (
                                    <button
                                        onClick={() => handleEnd(t._id, t.title)}
                                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md"
                                    >
                                        End
                                    </button>
                                )}

                                {(t.status === 'DRAFT' || t.status === 'CANCELLED') && (
                                    <button
                                        onClick={() => handleDelete(t._id, t.title)}
                                        className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}

                                <Link
                                    to={`/tournaments/${t._id}`}
                                    className="px-3.5 py-1.5 rounded-xl bg-slate-700/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                                >
                                    Manage
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            <CreateTournamentModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onTournamentCreated={() => fetchMyTournaments()}
            />
        </div>
    );
};

export default MyTournamentsPage;
