import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    Trophy,
    Calendar,
    Users,
    DollarSign,
    Gamepad2,
    Shield,
    Clock,
    CheckCircle2,
    Flame,
    ArrowLeft,
    Upload,
    Play,
    CheckSquare,
    XCircle,
    Trash2,
    Edit3,
    FileText,
    AlertTriangle,
    Crown
} from 'lucide-react';
import toast from 'react-hot-toast';
import { tournamentService } from '../../services/tournamentService';
import { useAuth } from '../../context/AuthContext';

const TournamentDetailPage = () => {
    const { tournamentId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [tournament, setTournament] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [uploadingBanner, setUploadingBanner] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editData, setEditData] = useState({});

    const fetchTournament = async () => {
        try {
            setLoading(true);
            const res = await tournamentService.getTournamentById(tournamentId);
            setTournament(res.data);
            setEditData({
                title: res.data.title || '',
                game: res.data.game || '',
                format: res.data.format || 'Single Elimination',
                prizePool: res.data.prizePool || 0,
                entryFee: res.data.entryFee || 0,
                maxTeams: res.data.maxTeams || 16,
                teamSize: res.data.teamSize || 4,
                description: res.data.description || '',
                rules: res.data.rules || ''
            });
        } catch (error) {
            console.error('Failed to load tournament:', error);
            toast.error('Failed to find tournament details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTournament();
    }, [tournamentId]);

    const isOrganizer =
        tournament &&
        ((tournament.organizer?._id || tournament.organizer)?.toString() === user?._id?.toString() ||
            user?.role === 'ADMIN');

    const handlePublish = async () => {
        try {
            const res = await tournamentService.publishTournament(tournamentId);
            setTournament(res.data);
            toast.success('Tournament published! Registrations are open. 📢');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to publish tournament');
        }
    };

    const handleStart = async () => {
        if (!window.confirm('Are you ready to START the tournament? It will be marked as LIVE.')) {
            return;
        }
        try {
            const res = await tournamentService.startTournament(tournamentId);
            setTournament(res.data);
            toast.success('Tournament is now LIVE! 🔴');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to start tournament');
        }
    };

    const handleEnd = async () => {
        if (!window.confirm('Mark this tournament as COMPLETED?')) {
            return;
        }
        try {
            const res = await tournamentService.endTournament(tournamentId);
            setTournament(res.data);
            toast.success('Tournament completed! 🏆');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to complete tournament');
        }
    };

    const handleCancel = async () => {
        if (!window.confirm('Are you sure you want to CANCEL this tournament?')) {
            return;
        }
        try {
            const res = await tournamentService.cancelTournament(tournamentId);
            setTournament(res.data);
            toast.success('Tournament cancelled.');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to cancel tournament');
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(`Are you SURE you want to delete "${tournament.title}"? This cannot be undone.`)) {
            return;
        }
        try {
            await tournamentService.deleteTournament(tournamentId);
            toast.success('Tournament deleted successfully.');
            navigate('/tournaments');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete tournament');
        }
    };

    const handleBannerUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            toast.error('Banner image size must be less than 10MB');
            return;
        }

        const formData = new FormData();
        formData.append('banner', file);

        try {
            setUploadingBanner(true);
            const res = await tournamentService.uploadBanner(tournamentId, formData);
            setTournament((prev) => ({ ...prev, banner: res.data?.banner }));
            toast.success('Tournament banner updated! 🎨');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to upload banner');
        } finally {
            setUploadingBanner(false);
        }
    };

    const handleUpdateTournament = async (e) => {
        e.preventDefault();
        try {
            const res = await tournamentService.updateTournament(tournamentId, editData);
            setTournament(res.data);
            setIsEditModalOpen(false);
            toast.success('Tournament updated successfully! ✨');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update tournament');
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse p-6">
                <div className="h-64 bg-slate-800/60 rounded-3xl" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((n) => (
                        <div key={n} className="h-24 bg-slate-800/60 rounded-2xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (!tournament) {
        return (
            <div className="text-center py-16 space-y-4">
                <h2 className="text-2xl font-bold text-white">Tournament Not Found</h2>
                <p className="text-slate-400 text-sm">The tournament you are looking for does not exist or was deleted.</p>
                <Link
                    to="/tournaments"
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Tournaments
                </Link>
            </div>
        );
    }

    const startDateFormatted = new Date(tournament.startDate).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const deadlineFormatted = new Date(tournament.registrationDeadline).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Back Button */}
            <div>
                <Link
                    to="/tournaments"
                    className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-white transition"
                >
                    <ArrowLeft className="w-4 h-4 mr-1.5" />
                    Back to Tournaments
                </Link>
            </div>

            {/* Organizer Actions Bar */}
            {isOrganizer && (
                <div className="bg-slate-850 border border-purple-500/30 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
                    <div className="flex items-center space-x-2">
                        <Crown className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-bold uppercase tracking-wider text-white">
                            Organizer Control Hub ({tournament.status})
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {/* Status Change Buttons */}
                        {tournament.status === 'DRAFT' && (
                            <button
                                onClick={handlePublish}
                                className="inline-flex items-center px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition"
                            >
                                <CheckSquare className="w-3.5 h-3.5 mr-1.5" />
                                Publish & Open Registrations
                            </button>
                        )}

                        {tournament.status === 'UPCOMING' && (
                            <button
                                onClick={handleStart}
                                className="inline-flex items-center px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition"
                            >
                                <Play className="w-3.5 h-3.5 mr-1.5" />
                                Start Tournament (Go LIVE)
                            </button>
                        )}

                        {tournament.status === 'LIVE' && (
                            <button
                                onClick={handleEnd}
                                className="inline-flex items-center px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition"
                            >
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                                End Tournament
                            </button>
                        )}

                        {tournament.status !== 'COMPLETED' && tournament.status !== 'CANCELLED' && (
                            <button
                                onClick={handleCancel}
                                className="inline-flex items-center px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-red-950/40 border border-slate-700 text-slate-300 hover:text-red-300 text-xs font-semibold transition"
                            >
                                <XCircle className="w-3.5 h-3.5 mr-1" />
                                Cancel
                            </button>
                        )}

                        {/* Edit & Upload */}
                        {tournament.status !== 'LIVE' && tournament.status !== 'COMPLETED' && (
                            <button
                                onClick={() => setIsEditModalOpen(true)}
                                className="inline-flex items-center px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition"
                            >
                                <Edit3 className="w-3.5 h-3.5 mr-1 text-indigo-400" />
                                Edit
                            </button>
                        )}

                        {(tournament.status === 'DRAFT' || tournament.status === 'CANCELLED') && (
                            <button
                                onClick={handleDelete}
                                className="inline-flex items-center px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600 border border-red-500/30 text-red-300 hover:text-white text-xs font-semibold transition"
                            >
                                <Trash2 className="w-3.5 h-3.5 mr-1" />
                                Delete
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Hero Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
                <div className="relative h-64 md:h-80 w-full overflow-hidden bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950">
                    {tournament.banner ? (
                        <img
                            src={tournament.banner}
                            alt={tournament.title}
                            className="w-full h-full object-cover opacity-75"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Trophy className="w-24 h-24 text-purple-500/20" />
                        </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                    {/* Banner Change Trigger for Organizer */}
                    {isOrganizer && (
                        <label className="absolute top-4 right-4 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white text-xs font-medium cursor-pointer transition flex items-center">
                            <Upload className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
                            <span>{uploadingBanner ? 'Uploading...' : 'Change Banner'}</span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleBannerUpload}
                                disabled={uploadingBanner}
                                className="hidden"
                            />
                        </label>
                    )}

                    {/* Banner Content */}
                    <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <span className="px-2.5 py-1 rounded-lg bg-purple-600 text-white font-bold text-xs uppercase tracking-wider">
                                    {tournament.game}
                                </span>
                                <span className="px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-md text-slate-300 text-xs font-semibold">
                                    {tournament.format}
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                                {tournament.title}
                            </h1>
                            <p className="text-xs text-slate-300 flex items-center space-x-1">
                                <span>Organized by</span>
                                <strong className="text-white ml-1">{tournament.organizer?.name}</strong>
                                <span className="text-slate-400">(@{tournament.organizer?.username})</span>
                            </p>
                        </div>

                        {/* Big Prize Tag */}
                        <div className="bg-slate-900/90 border border-amber-500/40 rounded-2xl p-4 text-right backdrop-blur-md shrink-0">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                                Total Prize Pool
                            </span>
                            <span className="text-2xl md:text-3xl font-black text-amber-400">
                                ₹{tournament.prizePool?.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Max Teams (Slots)
                    </span>
                    <div className="flex items-center space-x-2">
                        <Users className="w-5 h-5 text-indigo-400" />
                        <span className="text-xl font-black text-white">{tournament.maxTeams} Squads</span>
                    </div>
                </div>

                <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Squad Size
                    </span>
                    <div className="flex items-center space-x-2">
                        <Shield className="w-5 h-5 text-cyan-400" />
                        <span className="text-xl font-black text-white">{tournament.teamSize} Players / Team</span>
                    </div>
                </div>

                <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Entry Fee
                    </span>
                    <div className="flex items-center space-x-2">
                        <DollarSign className="w-5 h-5 text-emerald-400" />
                        <span className="text-xl font-black text-white">
                            {tournament.entryFee === 0 ? 'FREE' : `₹${tournament.entryFee}`}
                        </span>
                    </div>
                </div>

                <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Starts On
                    </span>
                    <div className="flex items-center space-x-2">
                        <Calendar className="w-5 h-5 text-purple-400" />
                        <span className="text-xs font-bold text-white leading-tight">
                            {new Date(tournament.startDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                            })}
                        </span>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-slate-800 flex items-center space-x-4">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`pb-3 text-sm font-bold border-b-2 transition ${
                        activeTab === 'overview'
                            ? 'border-indigo-500 text-white'
                            : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                >
                    Overview & Rules
                </button>
                <button
                    onClick={() => setActiveTab('schedule')}
                    className={`pb-3 text-sm font-bold border-b-2 transition ${
                        activeTab === 'schedule'
                            ? 'border-indigo-500 text-white'
                            : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                >
                    Timeline & Schedule
                </button>
                <button
                    onClick={() => setActiveTab('squads')}
                    className={`pb-3 text-sm font-bold border-b-2 transition ${
                        activeTab === 'squads'
                            ? 'border-indigo-500 text-white'
                            : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                >
                    Registered Squads (Milestone 6)
                </button>
            </div>

            {/* Tab Contents */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* Description */}
                    <div className="bg-slate-800/60 border border-slate-700/80 rounded-3xl p-6 space-y-3 shadow-lg">
                        <h2 className="text-lg font-bold text-white">About the Tournament</h2>
                        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                            {tournament.description || 'No specific description provided by the organizer.'}
                        </p>
                    </div>

                    {/* Rules */}
                    <div className="bg-slate-800/60 border border-slate-700/80 rounded-3xl p-6 space-y-3 shadow-lg">
                        <h2 className="text-lg font-bold text-white flex items-center">
                            <FileText className="w-5 h-5 mr-2 text-indigo-400" />
                            Rules & Guidelines
                        </h2>
                        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                            {tournament.rules ||
                                'Standard fair play rules apply. Toxic behavior, exploiting bugs, or unapproved third-party software will lead to immediate disqualification.'}
                        </p>
                    </div>
                </div>
            )}

            {activeTab === 'schedule' && (
                <div className="bg-slate-800/60 border border-slate-700/80 rounded-3xl p-6 space-y-4 shadow-lg">
                    <h2 className="text-lg font-bold text-white">Important Dates</h2>
                    <div className="space-y-3">
                        <div className="flex items-start space-x-3 p-3.5 bg-slate-900/60 rounded-xl border border-slate-700/60">
                            <Clock className="w-5 h-5 text-amber-400 mt-0.5" />
                            <div>
                                <h3 className="text-sm font-bold text-white">Registration Deadline</h3>
                                <p className="text-xs text-slate-400">{deadlineFormatted}</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3 p-3.5 bg-slate-900/60 rounded-xl border border-slate-700/60">
                            <Play className="w-5 h-5 text-emerald-400 mt-0.5" />
                            <div>
                                <h3 className="text-sm font-bold text-white">Tournament Kickoff</h3>
                                <p className="text-xs text-slate-400">{startDateFormatted}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'squads' && (
                <div className="bg-slate-800/60 border border-slate-700/80 rounded-3xl p-10 text-center space-y-3 shadow-lg">
                    <Shield className="w-12 h-12 text-indigo-400 mx-auto" />
                    <h3 className="text-lg font-bold text-white">Squad Registrations</h3>
                    <p className="text-slate-400 text-xs max-w-md mx-auto">
                        Tournament registration with squad slot bookings will be fully operational in **Milestone 6 (Registration System)**.
                    </p>
                </div>
            )}

            {/* Edit Tournament Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
                        <h3 className="text-lg font-bold text-white">Edit Tournament Details</h3>
                        <form onSubmit={handleUpdateTournament} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={editData.title}
                                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                                    required
                                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                                        Prize Pool (₹)
                                    </label>
                                    <input
                                        type="number"
                                        value={editData.prizePool}
                                        onChange={(e) => setEditData({ ...editData, prizePool: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                                        Max Squads
                                    </label>
                                    <input
                                        type="number"
                                        value={editData.maxTeams}
                                        onChange={(e) => setEditData({ ...editData, maxTeams: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                                    Description
                                </label>
                                <textarea
                                    rows={3}
                                    value={editData.description}
                                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm resize-none"
                                />
                            </div>

                            <div className="flex items-center justify-end space-x-3 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-4 py-2 text-sm text-slate-400 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TournamentDetailPage;
