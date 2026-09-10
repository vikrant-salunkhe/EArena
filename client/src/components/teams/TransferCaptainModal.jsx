import { useState } from 'react';
import { X, Crown, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { teamService } from '../../services/teamService';

const TransferCaptainModal = ({ isOpen, onClose, team, currentUserId, onCaptainTransferred }) => {
    const [selectedMemberId, setSelectedMemberId] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen || !team) return null;

    // Filter out the current captain from eligible candidates
    const eligibleMembers = team.members.filter(
        (m) => (m._id || m).toString() !== currentUserId.toString()
    );

    const handleTransfer = async (e) => {
        e.preventDefault();
        if (!selectedMemberId) {
            toast.error('Please select a member to promote to captain');
            return;
        }

        try {
            setLoading(true);
            const res = await teamService.transferCaptain(team._id, selectedMemberId);
            toast.success('Captain role transferred successfully! 👑');
            onCaptainTransferred(res.data);
            onClose();
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to transfer captaincy';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl shadow-amber-950/40">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-850/50">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                            <Crown className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white tracking-wide">Transfer Captain Role</h2>
                            <p className="text-xs text-slate-400">Hand over squad leadership</p>
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
                <form onSubmit={handleTransfer} className="p-6 space-y-4">
                    <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-xl flex items-start text-xs text-amber-300">
                        <AlertTriangle className="w-4 h-4 mr-2 shrink-0 mt-0.5 text-amber-400" />
                        <span>
                            Once transferred, you will become a regular team member and will no longer have captain permissions (editing team, kicking members, or registering for restricted events).
                        </span>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                            Select New Captain
                        </label>
                        {eligibleMembers.length === 0 ? (
                            <p className="text-sm text-slate-400 p-4 bg-slate-800/50 rounded-xl text-center">
                                No other members in the team yet. Invite teammates first.
                            </p>
                        ) : (
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                {eligibleMembers.map((member) => {
                                    const isSelected = selectedMemberId === (member._id || member);
                                    return (
                                        <div
                                            key={member._id || member}
                                            onClick={() => setSelectedMemberId(member._id || member)}
                                            className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                                                isSelected
                                                    ? 'bg-amber-500/10 border-amber-500/50 text-white'
                                                    : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 text-slate-300'
                                            }`}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs text-white overflow-hidden">
                                                    {member.avatar ? (
                                                        <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        member.name?.charAt(0).toUpperCase() || 'P'
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold leading-tight">{member.name}</p>
                                                    <p className="text-xs text-slate-400">@{member.username}</p>
                                                </div>
                                            </div>
                                            <input
                                                type="radio"
                                                name="newCaptain"
                                                checked={isSelected}
                                                onChange={() => setSelectedMemberId(member._id || member)}
                                                className="text-amber-500 focus:ring-amber-500"
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        )}
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
                            disabled={loading || eligibleMembers.length === 0 || !selectedMemberId}
                            className="flex items-center px-5 py-2.5 text-sm font-medium text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-lg shadow-amber-400/20 font-semibold transition disabled:opacity-50"
                        >
                            {loading ? 'Transferring...' : 'Confirm Transfer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TransferCaptainModal;
