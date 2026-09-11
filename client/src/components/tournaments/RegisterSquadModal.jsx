import { useState, useEffect } from 'react';
import {
    X,
    Shield,
    Users,
    AlertCircle,
    CheckCircle2,
    DollarSign,
    Gamepad2,
    Info,
    ArrowRight,
    UserCheck,
    Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { teamService } from '../../services/teamService';
import { registrationService } from '../../services/registrationService';
import { useAuth } from '../../context/AuthContext';

const RegisterSquadModal = ({ isOpen, onClose, tournament, onRegistered }) => {
    const { user } = useAuth();
    const [team, setTeam] = useState(null);
    const [loadingTeam, setLoadingTeam] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (!isOpen) return;

        const loadMyTeam = async () => {
            try {
                setLoadingTeam(true);
                const res = await teamService.getMyTeam();
                setTeam(res.data);
            } catch (err) {
                console.error('Failed to load user team:', err);
                setTeam(null);
            } finally {
                setLoadingTeam(false);
            }
        };

        loadMyTeam();
    }, [isOpen]);

    if (!isOpen) return null;

    const isCaptain = team && (team.captain?._id || team.captain) === user?._id;
    const rosterCount = team ? 1 + (team.members?.length || 0) : 0;
    const isRosterSufficient = team && rosterCount >= (tournament?.teamSize || 1);
    const canRegister = team && isCaptain && isRosterSufficient;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!canRegister) return;

        try {
            setSubmitting(true);
            const res = await registrationService.registerTeam({
                tournamentId: tournament._id,
                teamId: team._id,
                notes
            });

            toast.success(res.message || 'Squad registered successfully! 🎉');
            if (onRegistered) {
                onRegistered(res.data);
            }
            onClose();
        } catch (error) {
            console.error('Registration failed:', error);
            toast.error(error.response?.data?.message || 'Failed to register squad');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
            <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                            <Shield className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white tracking-tight">Register Squad</h3>
                            <p className="text-xs text-slate-400">Lock in your squad's slot for the tournament</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-6 overflow-y-auto space-y-6">
                    {/* Tournament Info Banner */}
                    <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="px-2.5 py-0.5 rounded-lg bg-purple-600/30 border border-purple-500/40 text-purple-300 text-xs font-bold uppercase tracking-wider">
                                {tournament?.game}
                            </span>
                            <span className="text-xs font-semibold text-emerald-400 flex items-center">
                                <DollarSign className="w-3.5 h-3.5 mr-0.5" />
                                {tournament?.entryFee === 0 ? 'FREE ENTRY' : `₹${tournament?.entryFee} Entry`}
                            </span>
                        </div>
                        <h4 className="text-base font-bold text-white leading-snug">{tournament?.title}</h4>
                        <div className="flex items-center text-xs text-slate-400 space-x-4 pt-1">
                            <span className="flex items-center">
                                <Users className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
                                Required Squad: <strong>{tournament?.teamSize} Players</strong>
                            </span>
                            <span className="flex items-center">
                                <Shield className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
                                Max Slots: <strong>{tournament?.maxTeams} Teams</strong>
                            </span>
                        </div>
                    </div>

                    {/* Squad Verification Section */}
                    {loadingTeam ? (
                        <div className="flex items-center justify-center py-10 text-slate-400 text-sm">
                            <Loader2 className="w-6 h-6 animate-spin mr-2 text-indigo-500" />
                            Checking your squad eligibility...
                        </div>
                    ) : !team ? (
                        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-3">
                            <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
                            <h4 className="text-sm font-bold text-white">No Squad Found</h4>
                            <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                                You need to be the captain of a team to register for tournaments. Create or join a squad to participate.
                            </p>
                            <Link
                                to="/my-team"
                                onClick={onClose}
                                className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-indigo-600/30"
                            >
                                Go to My Squad
                                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Team Card */}
                            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        {team.logo ? (
                                            <img
                                                src={team.logo}
                                                alt={team.name}
                                                className="w-12 h-12 rounded-2xl object-cover border border-slate-700"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
                                                {team.tag || 'SQ'}
                                            </div>
                                        )}
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <h4 className="text-sm font-black text-white">{team.name}</h4>
                                                <span className="px-2 py-0.5 rounded bg-slate-700 text-[10px] font-bold text-indigo-300">
                                                    [{team.tag}]
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-400">{team.game}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[11px] font-semibold text-slate-400 block">Roster Size</span>
                                        <span
                                            className={`text-sm font-black ${
                                                isRosterSufficient ? 'text-emerald-400' : 'text-amber-400'
                                            }`}
                                        >
                                            {rosterCount} / {tournament?.teamSize} Players
                                        </span>
                                    </div>
                                </div>

                                {/* Validation alerts */}
                                {!isCaptain && (
                                    <div className="flex items-center p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                                        <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
                                        <span>
                                            Only the squad captain (<strong>{team.captain?.name}</strong>) is allowed to register this team.
                                        </span>
                                    </div>
                                )}

                                {isCaptain && !isRosterSufficient && (
                                    <div className="flex items-center p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                                        <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
                                        <span>
                                            Your squad needs at least <strong>{tournament?.teamSize} players</strong>. Currently you have {rosterCount}.
                                        </span>
                                    </div>
                                )}

                                {canRegister && (
                                    <div className="flex items-center p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
                                        <CheckCircle2 className="w-4 h-4 mr-2 shrink-0" />
                                        <span>Squad roster satisfies all tournament entry conditions.</span>
                                    </div>
                                )}
                            </div>

                            {/* Optional Notes */}
                            {canRegister && (
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                                        Notes for Organizer (Optional)
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Any specific requests or squad contact handles..."
                                        className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition resize-none"
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex items-center justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
                    >
                        Cancel
                    </button>

                    {canRegister && (
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="inline-flex items-center px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Registering...
                                </>
                            ) : (
                                <>
                                    <UserCheck className="w-4 h-4 mr-2" />
                                    Confirm Registration
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RegisterSquadModal;
