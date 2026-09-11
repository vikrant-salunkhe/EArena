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
    Crown,
    UserCheck,
    AlertCircle,
    UserX,
    Filter,
    Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { tournamentService } from '../../services/tournamentService';
import { registrationService } from '../../services/registrationService';
import { useAuth } from '../../context/AuthContext';
import RegisterSquadModal from '../../components/tournaments/RegisterSquadModal';

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

    // Milestone 6: Registration States
    const [registrations, setRegistrations] = useState([]);
    const [loadingRegistrations, setLoadingRegistrations] = useState(false);
    const [userRegistration, setUserRegistration] = useState(null);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [updatingStatusId, setUpdatingStatusId] = useState(null);

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

    const fetchRegistrations = async () => {
        try {
            setLoadingRegistrations(true);
            const res = await registrationService.getRegistrations({ tournamentId });
            setRegistrations(res.data?.items || []);
        } catch (error) {
            console.error('Failed to fetch registrations:', error);
        } finally {
            setLoadingRegistrations(false);
        }
    };

    const checkUserRegistration = async () => {
        if (!user) return;
        try {
            const res = await registrationService.checkRegistrationStatus(tournamentId);
            setUserRegistration(res.data?.registration || null);
        } catch (error) {
            console.error('Failed to check user registration status:', error);
        }
    };

    useEffect(() => {
        fetchTournament();
        fetchRegistrations();
        checkUserRegistration();
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

    // Milestone 6: Registration Action Handlers
    const handleRegisteredSuccess = () => {
        fetchRegistrations();
        checkUserRegistration();
        setActiveTab('squads');
    };

    const handleUpdateRegistrationStatus = async (registrationId, newStatus) => {
        try {
            setUpdatingStatusId(registrationId);
            await registrationService.updateRegistrationStatus(registrationId, { status: newStatus });
            toast.success(`Registration status set to ${newStatus}`);
            fetchRegistrations();
            checkUserRegistration();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update registration status');
        } finally {
            setUpdatingStatusId(null);
        }
    };

    const handleCancelRegistration = async (registrationId) => {
        if (!window.confirm('Are you sure you want to cancel this registration?')) {
            return;
        }
        try {
            setUpdatingStatusId(registrationId);
            await registrationService.cancelRegistration(registrationId);
            toast.success('Registration cancelled successfully.');
            fetchRegistrations();
            checkUserRegistration();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to cancel registration');
        } finally {
            setUpdatingStatusId(null);
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

    const isDeadlinePassed = new Date() > new Date(tournament.registrationDeadline);
    const approvedRegistrations = registrations.filter((r) => r.status === 'APPROVED');
    const isSlotsFull = approvedRegistrations.length >= tournament.maxTeams;
    const canRegister = tournament.status === 'UPCOMING' && !isDeadlinePassed && !isSlotsFull;

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
                <div className="relative min-h-72 md:min-h-88 w-full overflow-hidden bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950">
                    {tournament.banner ? (
                        <img
                            src={tournament.banner}
                            alt={tournament.title}
                            className="w-full h-full object-cover opacity-75 absolute inset-0"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center absolute inset-0">
                            <Trophy className="w-24 h-24 text-purple-500/20" />
                        </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

                    {/* Banner Change Trigger for Organizer */}
                    {isOrganizer && (
                        <label className="absolute top-4 right-4 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white text-xs font-medium cursor-pointer transition flex items-center z-10">
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
                    <div className="relative z-10 p-6 md:p-8 flex flex-col justify-between h-full space-y-6 pt-12 md:pt-16">
                        <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="px-2.5 py-1 rounded-lg bg-purple-600 text-white font-bold text-xs uppercase tracking-wider shadow-md">
                                    {tournament.game}
                                </span>
                                <span className="px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-md text-slate-300 text-xs font-semibold border border-white/10">
                                    {tournament.format}
                                </span>
                                <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
                                    {tournament.status}
                                </span>
                            </div>

                            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-md">
                                {tournament.title}
                            </h1>

                            <p className="text-xs text-slate-300 flex items-center space-x-1">
                                <span>Organized by</span>
                                <strong className="text-white ml-1">{tournament.organizer?.name}</strong>
                                <span className="text-slate-400">(@{tournament.organizer?.username})</span>
                            </p>
                        </div>

                        {/* Banner Bottom Row: Prize & Registration CTA */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-slate-700/50">
                            <div className="flex items-center space-x-4">
                                <div className="bg-slate-900/90 border border-amber-500/40 rounded-2xl px-4 py-2.5 backdrop-blur-md">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                        Total Prize Pool
                                    </span>
                                    <span className="text-xl md:text-2xl font-black text-amber-400">
                                        ₹{tournament.prizePool?.toLocaleString()}
                                    </span>
                                </div>

                                <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl px-4 py-2.5 backdrop-blur-md">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                        Slots Filled
                                    </span>
                                    <span className="text-xl md:text-2xl font-black text-white">
                                        {approvedRegistrations.length} / {tournament.maxTeams}
                                    </span>
                                </div>
                            </div>

                            {/* Dynamic Registration CTA Button */}
                            <div className="w-full sm:w-auto">
                                {userRegistration ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="px-4 py-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center">
                                            <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-400" />
                                            <span>Registered: [{userRegistration.team?.tag}] {userRegistration.status}</span>
                                        </div>
                                        {tournament.status === 'UPCOMING' && !isDeadlinePassed && (
                                            <button
                                                onClick={() => handleCancelRegistration(userRegistration._id)}
                                                disabled={updatingStatusId === userRegistration._id}
                                                className="px-3 py-2.5 rounded-2xl bg-slate-800 hover:bg-rose-950/40 border border-slate-700 text-slate-300 hover:text-rose-300 text-xs font-semibold transition"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                ) : canRegister ? (
                                    <button
                                        onClick={() => setIsRegisterModalOpen(true)}
                                        className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-sm shadow-xl shadow-indigo-600/30 transition transform hover:-translate-y-0.5"
                                    >
                                        <UserCheck className="w-4 h-4 mr-2" />
                                        Register Your Squad
                                    </button>
                                ) : isSlotsFull ? (
                                    <div className="px-4 py-2.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center">
                                        <AlertTriangle className="w-4 h-4 mr-2" />
                                        Registration Full ({tournament.maxTeams}/{tournament.maxTeams} Slots)
                                    </div>
                                ) : isDeadlinePassed ? (
                                    <div className="px-4 py-2.5 rounded-2xl bg-slate-800 border border-slate-700 text-slate-400 text-xs font-bold flex items-center">
                                        <Clock className="w-4 h-4 mr-2" />
                                        Registration Deadline Passed
                                    </div>
                                ) : (
                                    <div className="px-4 py-2.5 rounded-2xl bg-slate-800 border border-slate-700 text-slate-400 text-xs font-bold flex items-center">
                                        <Clock className="w-4 h-4 mr-2" />
                                        Registration Status: {tournament.status}
                                    </div>
                                )}
                            </div>
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
                    className={`pb-3 text-sm font-bold border-b-2 transition flex items-center space-x-2 ${
                        activeTab === 'squads'
                            ? 'border-indigo-500 text-white'
                            : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                >
                    <span>Registered Squads</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[11px] text-indigo-400 font-extrabold">
                        {registrations.length}
                    </span>
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

            {/* Milestone 6: Registered Squads Tab */}
            {activeTab === 'squads' && (
                <div className="space-y-6">
                    {/* Capacity Tracker Card */}
                    <div className="bg-slate-800/60 border border-slate-700/80 rounded-3xl p-6 shadow-lg space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                                <h3 className="text-base font-bold text-white flex items-center">
                                    <Users className="w-5 h-5 mr-2 text-indigo-400" />
                                    Tournament Squad Slots
                                </h3>
                                <p className="text-xs text-slate-400">
                                    {approvedRegistrations.length} of {tournament.maxTeams} slots confirmed
                                </p>
                            </div>
                            <div className="text-right">
                                <span className="text-xs font-black text-indigo-400">
                                    {Math.round((approvedRegistrations.length / tournament.maxTeams) * 100)}% Full
                                </span>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-700/60">
                            <div
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                                style={{
                                    width: `${Math.min(
                                        100,
                                        (approvedRegistrations.length / tournament.maxTeams) * 100
                                    )}%`
                                }}
                            />
                        </div>
                    </div>

                    {/* Squads List */}
                    {loadingRegistrations ? (
                        <div className="flex items-center justify-center py-12 text-slate-400 text-sm">
                            <Loader2 className="w-6 h-6 animate-spin mr-2 text-indigo-500" />
                            Loading registered squads...
                        </div>
                    ) : registrations.length === 0 ? (
                        <div className="bg-slate-800/40 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
                            <Shield className="w-14 h-14 text-slate-600 mx-auto" />
                            <h3 className="text-lg font-bold text-white">No Squads Registered Yet</h3>
                            <p className="text-xs text-slate-400 max-w-sm mx-auto">
                                Be the first team to register and claim your spot on the battleground!
                            </p>
                            {canRegister && (
                                <button
                                    onClick={() => setIsRegisterModalOpen(true)}
                                    className="inline-flex items-center px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg transition"
                                >
                                    <UserCheck className="w-4 h-4 mr-2" />
                                    Register First Squad
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {registrations.map((reg) => {
                                const teamObj = reg.team || {};
                                const isUserTeam =
                                    userRegistration && userRegistration._id === reg._id;
                                const canManageThis = isOrganizer;
                                const canCaptainCancel =
                                    isUserTeam && tournament.status === 'UPCOMING' && !isDeadlinePassed;

                                return (
                                    <div
                                        key={reg._id}
                                        className={`bg-slate-800/70 border rounded-2xl p-5 space-y-4 transition ${
                                            isUserTeam
                                                ? 'border-indigo-500/50 shadow-indigo-500/10 shadow-lg'
                                                : 'border-slate-700/80 hover:border-slate-600'
                                        }`}
                                    >
                                        {/* Squad Header */}
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center space-x-3">
                                                {teamObj.logo ? (
                                                    <img
                                                        src={teamObj.logo}
                                                        alt={teamObj.name}
                                                        className="w-12 h-12 rounded-2xl object-cover border border-slate-700 shrink-0"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold shrink-0">
                                                        {teamObj.tag || 'SQ'}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="flex items-center space-x-2">
                                                        <h4 className="text-sm font-black text-white">
                                                            {teamObj.name || 'Unknown Squad'}
                                                        </h4>
                                                        <span className="px-2 py-0.5 rounded bg-slate-700 text-[10px] font-bold text-indigo-300">
                                                            [{teamObj.tag}]
                                                        </span>
                                                        {isUserTeam && (
                                                            <span className="px-2 py-0.5 rounded bg-indigo-600/30 text-indigo-300 text-[10px] font-extrabold border border-indigo-500/40">
                                                                YOUR SQUAD
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-slate-400">
                                                        Captain: <span className="text-slate-300">{teamObj.captain?.name || 'N/A'}</span>
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Status Badge */}
                                            <span
                                                className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider shrink-0 ${
                                                    reg.status === 'APPROVED'
                                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                                        : reg.status === 'PENDING'
                                                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                                        : reg.status === 'REJECTED'
                                                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                                        : 'bg-slate-700 text-slate-400'
                                                }`}
                                            >
                                                {reg.status}
                                            </span>
                                        </div>

                                        {/* Player Roster Snapshot */}
                                        <div className="space-y-1.5 pt-2 border-t border-slate-700/50">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                                Registered Roster ({reg.players?.length || 0} Players)
                                            </span>
                                            <div className="flex flex-wrap gap-1.5">
                                                {(reg.players || []).map((p, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="inline-flex items-center px-2 py-1 rounded-lg bg-slate-900/80 border border-slate-700/60 text-[11px] text-slate-300"
                                                    >
                                                        {p.role === 'CAPTAIN' && (
                                                            <Crown className="w-3 h-3 text-amber-400 mr-1" />
                                                        )}
                                                        {p.user?.name || 'Player'}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Registered Time & Notes */}
                                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                                            <span>
                                                Registered:{' '}
                                                {new Date(reg.createdAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </span>

                                            {/* Action Buttons for Organizer or Captain */}
                                            <div className="flex items-center space-x-2">
                                                {canManageThis && reg.status !== 'APPROVED' && (
                                                    <button
                                                        onClick={() =>
                                                            handleUpdateRegistrationStatus(reg._id, 'APPROVED')
                                                        }
                                                        disabled={updatingStatusId === reg._id}
                                                        className="px-2.5 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white text-[11px] font-bold transition border border-emerald-500/40"
                                                    >
                                                        Approve
                                                    </button>
                                                )}

                                                {canManageThis && reg.status !== 'REJECTED' && (
                                                    <button
                                                        onClick={() =>
                                                            handleUpdateRegistrationStatus(reg._id, 'REJECTED')
                                                        }
                                                        disabled={updatingStatusId === reg._id}
                                                        className="px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white text-[11px] font-bold transition border border-rose-500/40"
                                                    >
                                                        Reject
                                                    </button>
                                                )}

                                                {canCaptainCancel && (
                                                    <button
                                                        onClick={() => handleCancelRegistration(reg._id)}
                                                        disabled={updatingStatusId === reg._id}
                                                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 text-[11px] font-semibold transition border border-slate-700"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Register Squad Modal */}
            <RegisterSquadModal
                isOpen={isRegisterModalOpen}
                onClose={() => setIsRegisterModalOpen(false)}
                tournament={tournament}
                onRegistered={handleRegisteredSuccess}
            />

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
