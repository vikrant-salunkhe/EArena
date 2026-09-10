import { useState } from 'react';
import { X, KeyRound, ArrowRight, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { teamService } from '../../services/teamService';

const JoinTeamModal = ({ isOpen, onClose, onTeamJoined }) => {
    const [joinCode, setJoinCode] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        const code = joinCode.trim().toUpperCase();
        if (!code) {
            toast.error('Please enter a team join code');
            return;
        }

        try {
            setLoading(true);
            const res = await teamService.joinByCode(code);
            toast.success(`Successfully joined "${res.data?.name}"! 🚀`);
            onTeamJoined(res.data);
            onClose();
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to join team';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl shadow-cyan-950/40">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-850/50">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                            <KeyRound className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white tracking-wide">Join Team</h2>
                            <p className="text-xs text-slate-400">Enter your squad's private join code</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                            6-Character Invite Code
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                placeholder="e.g. 7A9F1B"
                                maxLength={10}
                                required
                                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono text-center tracking-widest text-lg uppercase placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                            />
                        </div>
                        <p className="text-xs text-slate-500 mt-2 text-center">
                            Ask your Team Captain for their team's unique invite code.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center px-5 py-2.5 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg shadow-lg shadow-cyan-600/30 transition disabled:opacity-50"
                        >
                            {loading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                    </svg>
                                    Joining...
                                </span>
                            ) : (
                                <>
                                    <span>Join Squad</span>
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default JoinTeamModal;
