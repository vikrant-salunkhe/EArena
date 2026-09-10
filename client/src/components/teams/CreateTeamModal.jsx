import { useState } from 'react';
import { X, Users, Upload, Gamepad2, Shield, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { teamService } from '../../services/teamService';

const GAMES = [
    'BGMI',
    'Valorant',
    'CS2',
    'Free Fire',
    'Call of Duty: Mobile',
    'Apex Legends',
    'League of Legends',
    'Dota 2',
    'Other'
];

const CreateTeamModal = ({ isOpen, onClose, onTeamCreated }) => {
    const [formData, setFormData] = useState({
        name: '',
        tag: '',
        game: 'BGMI',
        description: ''
    });
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'tag') {
            setFormData((prev) => ({ ...prev, [name]: value.toUpperCase().slice(0, 5) }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Logo image size must be less than 5MB');
                return;
            }
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.tag.trim() || !formData.game) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            setLoading(true);
            const res = await teamService.createTeam(formData);
            const newTeam = res.data;

            if (logoFile && newTeam?._id) {
                const logoData = new FormData();
                logoData.append('logo', logoFile);
                try {
                    await teamService.uploadLogo(newTeam._id, logoData);
                } catch (uploadErr) {
                    console.error('Logo upload failed:', uploadErr);
                    toast.error('Team created, but logo upload failed.');
                }
            }

            toast.success(`Team "${formData.name}" created successfully! 🎉`);
            onTeamCreated(newTeam);
            onClose();
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to create team';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl shadow-indigo-950/40 transform transition-all">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-850/50">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                            <Shield className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white tracking-wide">Create New Team</h2>
                            <p className="text-xs text-slate-400">Form your squad and enter tournaments</p>
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
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Logo & Basic Info Row */}
                    <div className="flex items-center space-x-4">
                        <div className="relative group shrink-0">
                            <div className="w-20 h-20 rounded-xl bg-slate-800 border-2 border-dashed border-slate-700 hover:border-indigo-500 overflow-hidden flex flex-col items-center justify-center cursor-pointer transition">
                                {logoPreview ? (
                                    <img src={logoPreview} alt="Team Logo Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-slate-400 text-[10px]">
                                        <Upload className="w-5 h-5 mb-1 text-slate-500 group-hover:text-indigo-400 transition" />
                                        <span>Logo</span>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                            </div>
                        </div>

                        <div className="flex-1 space-y-3">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                                    Team Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g. Phoenix Esports"
                                    required
                                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                                Team Tag * (Max 5)
                            </label>
                            <input
                                type="text"
                                name="tag"
                                value={formData.tag}
                                onChange={handleChange}
                                placeholder="e.g. PHX"
                                maxLength={5}
                                required
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm uppercase placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                                Primary Game *
                            </label>
                            <select
                                name="game"
                                value={formData.game}
                                onChange={handleChange}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            >
                                {GAMES.map((g) => (
                                    <option key={g} value={g} className="bg-slate-800 text-white">
                                        {g}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                            Description
                        </label>
                        <textarea
                            name="description"
                            rows={3}
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Tell potential recruits or tournament spectators about your team..."
                            maxLength={500}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
                        />
                    </div>

                    <div className="flex items-start p-3 bg-indigo-950/30 border border-indigo-500/20 rounded-lg text-xs text-indigo-300">
                        <Info className="w-4 h-4 mr-2 shrink-0 mt-0.5 text-indigo-400" />
                        <span>You will automatically become the Captain. A unique 6-character invite code will be generated for your teammates.</span>
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
                            className="flex items-center px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
                        >
                            {loading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                    </svg>
                                    Creating Team...
                                </span>
                            ) : (
                                'Create Squad'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTeamModal;
