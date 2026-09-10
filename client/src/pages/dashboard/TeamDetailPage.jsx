import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    Shield,
    Users,
    Crown,
    Gamepad2,
    Calendar,
    ArrowLeft,
    Trophy,
    UserCheck,
    Mail,
    Globe
} from 'lucide-react';
import toast from 'react-hot-toast';
import { teamService } from '../../services/teamService';
import { useAuth } from '../../context/AuthContext';

const TeamDetailPage = () => {
    const { teamId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [team, setTeam] = useState(null);
    const [stats, setStats] = useState(null);
    const [myTeam, setMyTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);

    useEffect(() => {
        const loadTeamData = async () => {
            try {
                setLoading(true);
                const [teamRes, myTeamRes] = await Promise.all([
                    teamService.getTeamById(teamId),
                    teamService.getMyTeam().catch(() => ({ data: null }))
                ]);

                setTeam(teamRes.data);
                setMyTeam(myTeamRes.data || null);

                try {
                    const statsRes = await teamService.getTeamStats(teamId);
                    setStats(statsRes.data);
                } catch {
                    // ignore
                }
            } catch (error) {
                console.error('Failed to load team details:', error);
                toast.error('Failed to find team details');
            } finally {
                setLoading(false);
            }
        };

        loadTeamData();
    }, [teamId]);

    const handleJoinTeam = async () => {
        try {
            setJoining(true);
            const res = await teamService.joinTeam(team._id);
            toast.success(`Welcome to ${team.name}! 🎉`);
            setTeam(res.data);
            setMyTeam(res.data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to join team');
        } finally {
            setJoining(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse p-6">
                <div className="h-44 bg-slate-800/60 rounded-3xl" />
                <div className="h-64 bg-slate-800/60 rounded-3xl" />
            </div>
        );
    }

    if (!team) {
        return (
            <div className="text-center py-16 space-y-4">
                <h2 className="text-2xl font-bold text-white">Team Not Found</h2>
                <p className="text-slate-400 text-sm">The team you are looking for does not exist or was deleted.</p>
                <Link
                    to="/teams"
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Teams
                </Link>
            </div>
        );
    }

    const isUserInTeam = team.members?.some((m) => (m._id || m).toString() === user?._id?.toString());
    const isUserCaptain = (team.captain?._id || team.captain)?.toString() === user?._id?.toString();

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Back button */}
            <div>
                <Link
                    to="/teams"
                    className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-white transition"
                >
                    <ArrowLeft className="w-4 h-4 mr-1.5" />
                    Back to Teams
                </Link>
            </div>

            {/* Hero Header */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/20 p-8 shadow-2xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center space-x-5">
                        <div className="w-24 h-24 rounded-2xl bg-slate-800 border-2 border-indigo-500/40 overflow-hidden flex items-center justify-center font-bold text-2xl text-indigo-300 shadow-xl">
                            {team.logo ? (
                                <img src={team.logo} alt={team.name} className="w-full h-full object-cover" />
                            ) : (
                                team.tag
                            )}
                        </div>

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
                                {team.description || 'No description provided.'}
                            </p>
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex items-center space-x-3">
                        {isUserInTeam ? (
                            <Link
                                to="/my-team"
                                className="inline-flex items-center px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition"
                            >
                                <Shield className="w-4 h-4 mr-2" />
                                Open Squad Hub
                            </Link>
                        ) : !myTeam ? (
                            <button
                                onClick={handleJoinTeam}
                                disabled={joining}
                                className="inline-flex items-center px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
                            >
                                {joining ? 'Joining...' : 'Join Squad'}
                            </button>
                        ) : (
                            <span className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 text-xs font-semibold">
                                In Another Squad
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Roster Strength
                    </span>
                    <div className="flex items-baseline space-x-2">
                        <span className="text-2xl font-black text-white">{team.members?.length || 0}</span>
                        <span className="text-xs text-slate-400">Players</span>
                    </div>
                </div>

                <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Tournaments
                    </span>
                    <div className="flex items-baseline space-x-2">
                        <span className="text-2xl font-black text-white">{stats?.tournamentsPlayed || 0}</span>
                        <span className="text-xs text-slate-400">Competitions</span>
                    </div>
                </div>

                <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Win Rate
                    </span>
                    <div className="flex items-baseline space-x-2">
                        <span className="text-2xl font-black text-indigo-400">{stats?.winRate || 0}%</span>
                        <span className="text-xs text-slate-400">Victories</span>
                    </div>
                </div>
            </div>

            {/* Roster Members Table */}
            <div className="bg-slate-800/60 border border-slate-700/80 rounded-3xl overflow-hidden shadow-xl">
                <div className="px-6 py-5 border-b border-slate-700/80 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Users className="w-5 h-5 text-indigo-400" />
                        <h2 className="text-lg font-bold text-white tracking-wide">Roster Members</h2>
                    </div>
                    <span className="text-xs font-semibold text-slate-400">
                        {team.members?.length || 0} Active Players
                    </span>
                </div>

                <div className="divide-y divide-slate-700/60">
                    {team.members?.map((member) => {
                        const memberId = member._id || member;
                        const isMemberCaptain = (team.captain?._id || team.captain)?.toString() === memberId.toString();

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
                                        <p className="font-bold text-white text-sm">{member.name}</p>
                                        <p className="text-xs text-slate-400">@{member.username || 'player'}</p>
                                    </div>
                                </div>

                                <div>
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
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default TeamDetailPage;
