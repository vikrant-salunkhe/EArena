import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Shield,
    Users,
    Crown,
    Copy,
    RefreshCw,
    Upload,
    LogOut,
    Trash2,
    UserMinus,
    Gamepad2,
    Check,
    Edit3,
    Plus,
    Trophy,
    Target,
    Zap,
    AlertTriangle,
    KeyRound
} from 'lucide-react';
import toast from 'react-hot-toast';
import { teamService } from '../../services/teamService';
import { useAuth } from '../../context/AuthContext';
import TransferCaptainModal from '../../components/teams/TransferCaptainModal';
import CreateTeamModal from '../../components/teams/CreateTeamModal';
import JoinTeamModal from '../../components/teams/JoinTeamModal';

const MyTeamPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [team, setTeam] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [regenerating, setRegenerating] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);

    // Modals
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editData, setEditData] = useState({ name: '', tag: '', game: '', description: '' });

    const fetchMyTeam = async () => {
        try {
            setLoading(true);
            const res = await teamService.getMyTeam();
            const currentTeam = res.data;
            setTeam(currentTeam);

            if (currentTeam?._id) {
                setEditData({
                    name: currentTeam.name || '',
                    tag: currentTeam.tag || '',
                    game: currentTeam.game || '',
                    description: currentTeam.description || ''
                });
                try {
                    const statsRes = await teamService.getTeamStats(currentTeam._id);
                    setStats(statsRes.data);
                } catch {
                    // default stats if endpoint fails
                }
            }
        } catch (error) {
            console.error('Failed to load my team:', error);
            toast.error('Failed to load team data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyTeam();
    }, []);

    const isCaptain = team && (team.captain?._id || team.captain)?.toString() === user?._id?.toString();

    const handleCopyCode = () => {
        if (!team?.joinCode) return;
        navigator.clipboard.writeText(team.joinCode);
        setCopied(true);
        toast.success('Join code copied to clipboard! 📋');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleRegenerateCode = async () => {
        if (!window.confirm('Are you sure you want to generate a new join code? The previous code will stop working.')) {
            return;
        }

        try {
            setRegenerating(true);
            const res = await teamService.regenerateJoinCode(team._id);
            setTeam((prev) => ({ ...prev, joinCode: res.data?.joinCode }));
            toast.success('New join code generated! 🔄');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to regenerate join code');
        } finally {
            setRegenerating(false);
        }
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Logo image size must be less than 5MB');
            return;
        }

        const formData = new FormData();
        formData.append('logo', file);

        try {
            setUploadingLogo(true);
            const res = await teamService.uploadLogo(team._id, formData);
            setTeam((prev) => ({ ...prev, logo: res.data?.logo }));
            toast.success('Team logo updated successfully! 🎨');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to upload logo');
        } finally {
            setUploadingLogo(false);
        }
    };

    const handleKickMember = async (memberId, memberName) => {
        if (!window.confirm(`Are you sure you want to remove ${memberName} from the team?`)) {
            return;
        }

        try {
            const res = await teamService.removeMember(team._id, memberId);
            setTeam(res.data);
            toast.success(`${memberName} was removed from the team.`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to remove member');
        }
    };

    const handleLeaveTeam = async () => {
        if (!window.confirm('Are you sure you want to leave this team?')) {
            return;
        }

        try {
            await teamService.leaveTeam(team._id);
            toast.success('You have left the team.');
            setTeam(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to leave team');
        }
    };

    const handleDeleteTeam = async () => {
        if (!window.confirm(`Are you SURE you want to disband and permanently DELETE "${team.name}"? This action cannot be undone.`)) {
            return;
        }

        try {
            await teamService.deleteTeam(team._id);
            toast.success('Team deleted successfully.');
            setTeam(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete team');
        }
    };

    const handleUpdateTeam = async (e) => {
        e.preventDefault();
        try {
            const res = await teamService.updateTeam(team._id, editData);
            setTeam(res.data);
            setIsEditModalOpen(false);
            toast.success('Team details updated! ✨');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update team details');
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse p-6">
                <div className="h-44 bg-slate-800/60 rounded-3xl" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="h-32 bg-slate-800/60 rounded-2xl" />
                    <div className="h-32 bg-slate-800/60 rounded-2xl" />
                    <div className="h-32 bg-slate-800/60 rounded-2xl" />
                </div>
                <div className="h-64 bg-slate-800/60 rounded-3xl" />
            </div>
        );
    }

    if (!team) {
        return (
            <div className="max-w-2xl mx-auto text-center py-12 space-y-6 animate-fadeIn">
                <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto shadow-xl">
                    <Shield className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-3xl font-black text-white">You don't have a Squad yet</h2>
                    <p className="text-slate-400 text-sm max-w-md mx-auto">
                        In EArena, tournaments are played in squads. Create your own team or enter an invite code to join your friends.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition transform hover:-translate-y-0.5"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Create a Team
                    </button>
                    <button
                        onClick={() => setIsJoinModalOpen(true)}
                        className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-sm transition transform hover:-translate-y-0.5"
                    >
                        <KeyRound className="w-4 h-4 mr-2 text-cyan-400" />
                        Join via Invite Code
                    </button>
                </div>

                <div className="pt-6">
                    <Link to="/teams" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
                        Or browse public teams directory →
                    </Link>
                </div>

                {/* Modals for Teamless State */}
                <CreateTeamModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onTeamCreated={(newTeam) => setTeam(newTeam)}
                />
                <JoinTeamModal
                    isOpen={isJoinModalOpen}
                    onClose={() => setIsJoinModalOpen(false)}
                    onTeamJoined={(joinedTeam) => setTeam(joinedTeam)}
                />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Header Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/20 p-8 shadow-2xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center space-x-5">
                        {/* Team Logo with upload action */}
                        <div className="relative group shrink-0">
                            <div className="w-24 h-24 rounded-2xl bg-slate-800 border-2 border-indigo-500/40 overflow-hidden flex items-center justify-center font-bold text-2xl text-indigo-300 shadow-xl group-hover:border-indigo-400 transition">
                                {team.logo ? (
                                    <img src={team.logo} alt={team.name} className="w-full h-full object-cover" />
                                ) : (
                                    team.tag
                                )}
                            </div>

                            {isCaptain && (
                                <label className="absolute inset-0 bg-black/60 rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition text-white text-[11px] font-medium backdrop-blur-xs">
                                    <Upload className="w-5 h-5 mb-1 text-indigo-400" />
                                    <span>{uploadingLogo ? 'Uploading...' : 'Change'}</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoUpload}
                                        disabled={uploadingLogo}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>

                        {/* Team Details */}
                        <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                                <span className="px-2.5 py-0.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-mono text-xs font-bold">
                                    [{team.tag}]
                                </span>
                                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                                    {team.name}
                                </h1>
                            </div>
                            <div className="flex items-center space-x-3 text-xs text-slate-300">
                                <span className="flex items-center">
                                    <Gamepad2 className="w-3.5 h-3.5 mr-1 text-indigo-400" />
                                    {team.game}
                                </span>
                                <span>•</span>
                                <span className="flex items-center">
                                    <Crown className="w-3.5 h-3.5 mr-1 text-amber-400" />
                                    Captain: <strong className="text-white ml-1">{team.captain?.name}</strong>
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 max-w-xl line-clamp-2 pt-1">
                                {team.description || 'No description provided yet.'}
                            </p>
                        </div>
                    </div>

                    {/* Captain & General Actions */}
                    <div className="flex flex-wrap items-center gap-2">
                        {isCaptain && (
                            <button
                                onClick={() => setIsEditModalOpen(true)}
                                className="inline-flex items-center px-4 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition"
                            >
                                <Edit3 className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
                                Edit Info
                            </button>
                        )}
                        <Link
                            to={`/teams/${team._id}`}
                            className="inline-flex items-center px-4 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition"
                        >
                            Public View
                        </Link>
                    </div>
                </div>
            </div>

            {/* Quick Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Join Code Card */}
                <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Squad Invite Code
                            </span>
                            <KeyRound className="w-4 h-4 text-cyan-400" />
                        </div>
                        <p className="text-xs text-slate-400 mb-4">
                            Share this code with teammates so they can instantly join your roster.
                        </p>
                    </div>

                    <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-center font-mono font-bold tracking-widest text-base text-cyan-300">
                            {team.joinCode}
                        </div>
                        <button
                            onClick={handleCopyCode}
                            className="p-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white transition shadow-md shadow-cyan-600/20"
                            title="Copy Code"
                        >
                            {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                        </button>
                        {isCaptain && (
                            <button
                                onClick={handleRegenerateCode}
                                disabled={regenerating}
                                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition disabled:opacity-50"
                                title="Regenerate Code"
                            >
                                <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Team Roster Stats */}
                <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Squad Roster
                            </span>
                            <Users className="w-4 h-4 text-indigo-400" />
                        </div>
                        <p className="text-xs text-slate-400">
                            Active competing members ready for tournament match registrations.
                        </p>
                    </div>

                    <div className="flex items-baseline space-x-2">
                        <span className="text-3xl font-black text-white">{team.members?.length || 1}</span>
                        <span className="text-xs font-semibold text-slate-400">/ 5 Standard Roster</span>
                    </div>
                </div>

                {/* Tournament Records */}
                <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Match Record
                            </span>
                            <Trophy className="w-4 h-4 text-amber-400" />
                        </div>
                        <p className="text-xs text-slate-400">
                            Overall tournament participation and victory rate.
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center pt-2">
                        <div className="bg-slate-900/60 rounded-xl p-2">
                            <span className="text-xs text-slate-400 block">Matches</span>
                            <span className="text-base font-bold text-white">{stats?.tournamentsPlayed || 0}</span>
                        </div>
                        <div className="bg-slate-900/60 rounded-xl p-2">
                            <span className="text-xs text-emerald-400 block">Wins</span>
                            <span className="text-base font-bold text-white">{stats?.wins || 0}</span>
                        </div>
                        <div className="bg-slate-900/60 rounded-xl p-2">
                            <span className="text-xs text-amber-400 block">Win %</span>
                            <span className="text-base font-bold text-white">{stats?.winRate || 0}%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Roster Management Table */}
            <div className="bg-slate-800/60 border border-slate-700/80 rounded-3xl overflow-hidden shadow-xl">
                <div className="px-6 py-5 border-b border-slate-700/80 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Users className="w-5 h-5 text-indigo-400" />
                        <h2 className="text-lg font-bold text-white tracking-wide">Roster Members</h2>
                    </div>

                    {isCaptain && (
                        <button
                            onClick={() => setIsTransferModalOpen(true)}
                            disabled={team.members.length <= 1}
                            className="inline-flex items-center px-3.5 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500/30 text-xs font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <Crown className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                            Transfer Captaincy
                        </button>
                    )}
                </div>

                <div className="divide-y divide-slate-700/60">
                    {team.members?.map((member) => {
                        const memberId = member._id || member;
                        const isMemberCaptain = (team.captain?._id || team.captain)?.toString() === memberId.toString();
                        const isCurrentUser = user?._id?.toString() === memberId.toString();

                        return (
                            <div
                                key={memberId}
                                className="px-6 py-4 flex items-center justify-between hover:bg-slate-800/40 transition"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="w-11 h-11 rounded-xl bg-slate-700/80 flex items-center justify-center font-bold text-sm text-white overflow-hidden border border-slate-600">
                                        {member.avatar ? (
                                            <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                                        ) : (
                                            member.name?.charAt(0).toUpperCase() || 'P'
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <span className="font-bold text-white text-sm">{member.name}</span>
                                            {isCurrentUser && (
                                                <span className="px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 text-[10px] font-semibold">
                                                    You
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-400">@{member.username || 'player'}</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4">
                                    {isMemberCaptain ? (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
                                            <Crown className="w-3.5 h-3.5 mr-1" />
                                            Captain
                                        </span>
                                    ) : (
                                        <span className="px-3 py-1 rounded-full bg-slate-700/60 text-slate-300 text-xs font-semibold">
                                            Member
                                        </span>
                                    )}

                                    {/* Action button */}
                                    {isCaptain && !isMemberCaptain && (
                                        <button
                                            onClick={() => handleKickMember(memberId, member.name)}
                                            className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/40 transition"
                                            title="Kick Member"
                                        >
                                            <UserMinus className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Squad Actions / Danger Zone */}
            <div className="bg-slate-900/80 border border-red-950/50 rounded-3xl p-6">
                <div className="flex items-center space-x-2 mb-2 text-red-400">
                    <AlertTriangle className="w-4 h-4" />
                    <h3 className="text-xs font-bold uppercase tracking-wider">Squad Options</h3>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                    <div>
                        <p className="text-sm font-semibold text-white">
                            {isCaptain ? 'Disband Squad' : 'Leave Squad'}
                        </p>
                        <p className="text-xs text-slate-400">
                            {isCaptain
                                ? 'Permanently delete this team and remove all associated tournament links.'
                                : 'Step down from this team. You will become a free agent.'}
                        </p>
                    </div>

                    {isCaptain ? (
                        <button
                            onClick={handleDeleteTeam}
                            className="inline-flex items-center px-4 py-2.5 rounded-xl bg-red-600/20 hover:bg-red-600 border border-red-500/30 text-red-300 hover:text-white text-xs font-semibold transition"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Team
                        </button>
                    ) : (
                        <button
                            onClick={handleLeaveTeam}
                            className="inline-flex items-center px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-red-600/30 border border-slate-700 text-slate-300 hover:text-red-200 text-xs font-semibold transition"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Leave Team
                        </button>
                    )}
                </div>
            </div>

            {/* Modals */}
            <TransferCaptainModal
                isOpen={isTransferModalOpen}
                onClose={() => setIsTransferModalOpen(false)}
                team={team}
                currentUserId={user?._id}
                onCaptainTransferred={(updatedTeam) => setTeam(updatedTeam)}
            />

            {/* Edit Info Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
                        <h3 className="text-lg font-bold text-white">Edit Team Details</h3>
                        <form onSubmit={handleUpdateTeam} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                                    Team Name
                                </label>
                                <input
                                    type="text"
                                    value={editData.name}
                                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                    required
                                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:border-indigo-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                                        Team Tag
                                    </label>
                                    <input
                                        type="text"
                                        value={editData.tag}
                                        maxLength={5}
                                        onChange={(e) => setEditData({ ...editData, tag: e.target.value.toUpperCase() })}
                                        required
                                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm uppercase focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                                        Primary Game
                                    </label>
                                    <input
                                        type="text"
                                        value={editData.game}
                                        onChange={(e) => setEditData({ ...editData, game: e.target.value })}
                                        required
                                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:border-indigo-500"
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
                                    maxLength={500}
                                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm resize-none focus:border-indigo-500"
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

export default MyTeamPage;
