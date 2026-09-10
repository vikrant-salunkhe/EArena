import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Users,
    Search,
    Plus,
    KeyRound,
    Shield,
    Gamepad2,
    Crown,
    ArrowRight,
    UserCheck,
    Sparkles,
    Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
import { teamService } from '../../services/teamService';
import { useAuth } from '../../context/AuthContext';
import CreateTeamModal from '../../components/teams/CreateTeamModal';
import JoinTeamModal from '../../components/teams/JoinTeamModal';

const GAMES = [
    { label: 'All Games', value: 'all' },
    { label: 'BGMI', value: 'BGMI' },
    { label: 'Valorant', value: 'Valorant' },
    { label: 'CS2', value: 'CS2' },
    { label: 'Free Fire', value: 'Free Fire' },
    { label: 'COD Mobile', value: 'Call of Duty: Mobile' },
    { label: 'Apex Legends', value: 'Apex Legends' }
];

const TeamsPage = () => {
    const { user } = useAuth();
    const [teams, setTeams] = useState([]);
    const [myTeam, setMyTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedGame, setSelectedGame] = useState('all');
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 });

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isJoinOpen, setIsJoinOpen] = useState(false);

    const fetchTeams = async (page = 1, currentSearch = search, currentGame = selectedGame) => {
        try {
            setLoading(true);
            const [teamsRes, myTeamRes] = await Promise.all([
                teamService.getTeams({
                    page,
                    limit: 9,
                    search: currentSearch || undefined,
                    game: currentGame !== 'all' ? currentGame : undefined
                }),
                teamService.getMyTeam().catch(() => ({ data: null }))
            ]);

            setTeams(teamsRes.data?.items || []);
            setPagination(teamsRes.data?.pagination || { page: 1, totalPages: 1, totalItems: 0 });
            setMyTeam(myTeamRes.data || null);
        } catch (error) {
            console.error('Failed to fetch teams:', error);
            toast.error('Failed to load teams');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchTeams(1, search, selectedGame);
        }, 300);
        return () => clearTimeout(timer);
    }, [search, selectedGame]);

    const handleTeamCreated = (newTeam) => {
        setMyTeam(newTeam);
        fetchTeams(1, search, selectedGame);
    };

    const handleTeamJoined = (joinedTeam) => {
        setMyTeam(joinedTeam);
        fetchTeams(1, search, selectedGame);
    };

    const handleDirectJoin = async (teamId, teamName) => {
        try {
            const res = await teamService.joinTeam(teamId);
            toast.success(`Joined ${teamName}! 🎉`);
            setMyTeam(res.data);
            fetchTeams(pagination.page, search, selectedGame);
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to join team';
            toast.error(message);
        }
    };

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Top Banner / Hero */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-cyan-950/80 border border-slate-700/80 p-8 md:p-10 shadow-2xl">
                <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -left-10 -top-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2 max-w-xl">
                        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-300">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Esports Squad Hub</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                            Find Your Squad or <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Lead One</span>
                        </h1>
                        <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                            Create your own esports team, recruit players with your unique invite code, or join established squads to dominate competitive tournaments.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {myTeam ? (
                            <Link
                                to="/my-team"
                                className="inline-flex items-center px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition transform hover:-translate-y-0.5"
                            >
                                <Shield className="w-4 h-4 mr-2" />
                                My Squad ({myTeam.tag})
                            </Link>
                        ) : (
                            <>
                                <button
                                    onClick={() => setIsCreateOpen(true)}
                                    className="inline-flex items-center px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition transform hover:-translate-y-0.5"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Squad
                                </button>
                                <button
                                    onClick={() => setIsJoinOpen(true)}
                                    className="inline-flex items-center px-5 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-sm transition transform hover:-translate-y-0.5"
                                >
                                    <KeyRound className="w-4 h-4 mr-2 text-cyan-400" />
                                    Join with Code
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Active Membership Notice */}
            {myTeam && (
                <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-slate-300 text-sm">
                    <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                            <UserCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="font-semibold text-white">Active Squad: </span>
                            <span>You are currently competing with </span>
                            <span className="text-indigo-300 font-bold">[{myTeam.tag}] {myTeam.name}</span>
                        </div>
                    </div>
                    <Link
                        to="/my-team"
                        className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 inline-flex items-center"
                    >
                        Manage Team <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Link>
                </div>
            )}

            {/* Filters and Search Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search teams by name, tag, or game..."
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                    />
                </div>

                {/* Game Pills */}
                <div className="flex items-center space-x-2 overflow-x-auto pb-1 max-w-full scrollbar-none">
                    {GAMES.map((game) => (
                        <button
                            key={game.value}
                            onClick={() => setSelectedGame(game.value)}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                                selectedGame === game.value
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                            }`}
                        >
                            {game.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Teams Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                        <div
                            key={n}
                            className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 h-60 animate-pulse flex flex-col justify-between"
                        >
                            <div className="flex items-center space-x-4">
                                <div className="w-14 h-14 bg-slate-700 rounded-xl" />
                                <div className="space-y-2 flex-1">
                                    <div className="h-4 bg-slate-700 rounded w-3/4" />
                                    <div className="h-3 bg-slate-700/60 rounded w-1/2" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-3 bg-slate-700/40 rounded w-full" />
                                <div className="h-3 bg-slate-700/40 rounded w-4/5" />
                            </div>
                            <div className="h-9 bg-slate-700/80 rounded-xl" />
                        </div>
                    ))}
                </div>
            ) : teams.length === 0 ? (
                <div className="bg-slate-800/30 border border-slate-700/60 rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
                        <Users className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-white">No Teams Found</h3>
                    <p className="text-slate-400 text-sm">
                        {search || selectedGame !== 'all'
                            ? 'Try adjusting your search criteria or filter to find other teams.'
                            : 'Be the pioneer! Create the very first squad on EArena and recruit teammates.'}
                    </p>
                    {!myTeam && (
                        <button
                            onClick={() => setIsCreateOpen(true)}
                            className="inline-flex items-center px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Create Team Now
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teams.map((team) => {
                        const isUserMember = myTeam?._id === team._id;
                        const isCaptain = team.captain?._id === user?._id;

                        return (
                            <div
                                key={team._id}
                                className="group relative bg-slate-800/60 hover:bg-slate-800/90 border border-slate-700/70 hover:border-indigo-500/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-950/30 flex flex-col justify-between"
                            >
                                <div>
                                    {/* Top Card Row */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 border border-indigo-500/30 overflow-hidden flex items-center justify-center font-bold text-lg text-indigo-300 shadow-md group-hover:border-indigo-400/60 transition">
                                                {team.logo ? (
                                                    <img src={team.logo} alt={team.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    team.tag || 'TEAM'
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex items-center space-x-2">
                                                    <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-mono text-xs font-bold">
                                                        [{team.tag}]
                                                    </span>
                                                    <h3 className="font-bold text-white text-base leading-tight group-hover:text-indigo-300 transition">
                                                        {team.name}
                                                    </h3>
                                                </div>
                                                <p className="text-xs text-slate-400 mt-1 flex items-center">
                                                    <Gamepad2 className="w-3.5 h-3.5 mr-1 text-slate-500" />
                                                    {team.game}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <p className="text-slate-300 text-xs line-clamp-2 mb-4 h-8">
                                        {team.description || 'No description provided. Focused on competitive esports matches.'}
                                    </p>

                                    {/* Captain & Members info */}
                                    <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400 mb-4">
                                        <div className="flex items-center space-x-1.5 truncate max-w-[55%]">
                                            <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                            <span className="truncate">{team.captain?.name || 'Captain'}</span>
                                        </div>
                                        <div className="flex items-center space-x-1 font-semibold text-slate-300">
                                            <Users className="w-3.5 h-3.5 text-indigo-400" />
                                            <span>{team.members?.length || 1} {team.members?.length === 1 ? 'member' : 'members'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Card Action */}
                                <div className="flex items-center space-x-2 pt-2">
                                    <Link
                                        to={`/teams/${team._id}`}
                                        className="flex-1 text-center py-2 px-3 rounded-xl bg-slate-700/70 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                                    >
                                        View Profile
                                    </Link>

                                    {isUserMember ? (
                                        <Link
                                            to="/my-team"
                                            className="py-2 px-3 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-semibold hover:bg-indigo-600/40 transition"
                                        >
                                            My Squad
                                        </Link>
                                    ) : !myTeam ? (
                                        <button
                                            onClick={() => handleDirectJoin(team._id, team.name)}
                                            className="py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition shadow-md shadow-indigo-600/20"
                                        >
                                            Join Team
                                        </button>
                                    ) : null}
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
                        onClick={() => fetchTeams(pagination.page - 1)}
                        disabled={pagination.page <= 1}
                        className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                        Previous
                    </button>
                    <span className="text-xs font-semibold text-slate-400 px-3">
                        Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                        onClick={() => fetchTeams(pagination.page + 1)}
                        disabled={pagination.page >= pagination.totalPages}
                        className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Modals */}
            <CreateTeamModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onTeamCreated={handleTeamCreated}
            />

            <JoinTeamModal
                isOpen={isJoinOpen}
                onClose={() => setIsJoinOpen(false)}
                onTeamJoined={handleTeamJoined}
            />
        </div>
    );
};

export default TeamsPage;
