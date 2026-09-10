import { useState } from 'react';
import { X, Trophy, Upload, Gamepad2, Calendar, DollarSign, Users, FileText, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { tournamentService } from '../../services/tournamentService';

const GAMES = [
    'BGMI',
    'Valorant',
    'CS2',
    'Free Fire',
    'Call of Duty: Mobile',
    'Apex Legends',
    'League of Legends',
    'Dota 2',
    'Rocket League',
    'Other'
];

const FORMATS = [
    'Single Elimination',
    'Double Elimination',
    'Round Robin'
];

const CreateTournamentModal = ({ isOpen, onClose, onTournamentCreated }) => {
    // Default dates: deadline in 3 days, start in 5 days
    const now = new Date();
    const defaultDeadline = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
    const defaultStart = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16);

    const [formData, setFormData] = useState({
        title: '',
        game: 'BGMI',
        format: 'Single Elimination',
        maxTeams: 16,
        teamSize: 4,
        entryFee: 0,
        prizePool: 5000,
        registrationDeadline: defaultDeadline,
        startDate: defaultStart,
        description: '',
        rules: ''
    });

    const [bannerFile, setBannerFile] = useState(null);
    const [bannerPreview, setBannerPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                toast.error('Banner image size must be less than 10MB');
                return;
            }
            setBannerFile(file);
            setBannerPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.game) {
            toast.error('Please enter a tournament title and select a game');
            return;
        }

        if (new Date(formData.registrationDeadline) > new Date(formData.startDate)) {
            toast.error('Registration deadline cannot be after tournament start date');
            return;
        }

        try {
            setLoading(true);
            const res = await tournamentService.createTournament(formData);
            const newTournament = res.data;

            if (bannerFile && newTournament?._id) {
                const bannerData = new FormData();
                bannerData.append('banner', bannerFile);
                try {
                    await tournamentService.uploadBanner(newTournament._id, bannerData);
                } catch (uploadErr) {
                    console.error('Banner upload failed:', uploadErr);
                    toast.error('Tournament created in Draft, but banner upload failed.');
                }
            }

            toast.success(`Tournament "${formData.title}" created in Draft! 🏆`);
            onTournamentCreated(newTournament);
            onClose();
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to create tournament';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn overflow-y-auto">
            <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl my-8 overflow-hidden shadow-2xl shadow-indigo-950/40">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-850/50">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                            <Trophy className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white tracking-wide">Host a Tournament</h2>
                            <p className="text-xs text-slate-400">Create competition rules, schedule dates, and set prize pool</p>
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
                <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto pr-3">
                    {/* Banner Upload Box */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                            Tournament Banner (16:9 Aspect Ratio)
                        </label>
                        <div className="relative group w-full h-40 rounded-xl bg-slate-800/80 border-2 border-dashed border-slate-700 hover:border-indigo-500 overflow-hidden flex flex-col items-center justify-center cursor-pointer transition">
                            {bannerPreview ? (
                                <img src={bannerPreview} alt="Banner Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center justify-center text-slate-400 text-xs">
                                    <Upload className="w-6 h-6 mb-2 text-indigo-400 group-hover:scale-110 transition transform" />
                                    <span className="font-semibold text-slate-300">Click to upload tournament banner</span>
                                    <span className="text-[11px] text-slate-500 mt-1">PNG, JPG or WEBP up to 10MB</span>
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

                    {/* Title & Game */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                                Tournament Title *
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g. Winter BGMI Championship"
                                required
                                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                                Game *
                            </label>
                            <select
                                name="game"
                                value={formData.game}
                                onChange={handleChange}
                                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            >
                                {GAMES.map((g) => (
                                    <option key={g} value={g} className="bg-slate-800 text-white">
                                        {g}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Format, Max Teams, Team Size */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                                Format *
                            </label>
                            <select
                                name="format"
                                value={formData.format}
                                onChange={handleChange}
                                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                            >
                                {FORMATS.map((f) => (
                                    <option key={f} value={f} className="bg-slate-800 text-white">
                                        {f}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                                Max Teams (Slots) *
                            </label>
                            <input
                                type="number"
                                name="maxTeams"
                                min={2}
                                max={128}
                                value={formData.maxTeams}
                                onChange={handleChange}
                                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                                Squad Size (Players) *
                            </label>
                            <input
                                type="number"
                                name="teamSize"
                                min={1}
                                max={10}
                                value={formData.teamSize}
                                onChange={handleChange}
                                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                    </div>

                    {/* Entry Fee & Prize Pool */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                                Entry Fee (₹ / INR)
                            </label>
                            <input
                                type="number"
                                name="entryFee"
                                min={0}
                                value={formData.entryFee}
                                onChange={handleChange}
                                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                                Prize Pool (₹ / INR)
                            </label>
                            <input
                                type="number"
                                name="prizePool"
                                min={0}
                                value={formData.prizePool}
                                onChange={handleChange}
                                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 font-bold text-amber-400"
                            />
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                                Registration Deadline *
                            </label>
                            <input
                                type="datetime-local"
                                name="registrationDeadline"
                                value={formData.registrationDeadline}
                                onChange={handleChange}
                                required
                                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                                Tournament Start Date *
                            </label>
                            <input
                                type="datetime-local"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleChange}
                                required
                                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                            Tournament Description
                        </label>
                        <textarea
                            name="description"
                            rows={3}
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Provide details about the competition, broadcast links, or prizes..."
                            maxLength={2000}
                            className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                        />
                    </div>

                    {/* Rules */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                            Rules & Guidelines
                        </label>
                        <textarea
                            name="rules"
                            rows={3}
                            value={formData.rules}
                            onChange={handleChange}
                            placeholder="Specify tournament game rules, banned items, conduct policies..."
                            maxLength={3000}
                            className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                        />
                    </div>

                    <div className="flex items-start p-3.5 bg-indigo-950/30 border border-indigo-500/20 rounded-xl text-xs text-indigo-300">
                        <Info className="w-4 h-4 mr-2.5 shrink-0 mt-0.5 text-indigo-400" />
                        <span>The tournament will be saved as a **Draft**. You can review and publish it whenever you are ready to open registrations to squads.</span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800 sticky bottom-0 bg-slate-900 pb-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
                        >
                            {loading ? 'Creating Tournament...' : 'Save as Draft'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTournamentModal;
