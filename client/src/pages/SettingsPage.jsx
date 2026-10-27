import { Bell, CheckCircle2, Shield, User } from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const SettingsPage = () => {
  const { user, updateUserSettings } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [warningDays, setWarningDays] = useState(user?.deadlineWarningDays || 3);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      await updateUserSettings({
        name: name.trim(),
        deadlineWarningDays: Number(warningDays),
      });
      setSuccessMsg('Settings updated successfully! Your dashboard warning window is updated.');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Error updating settings');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl pb-12">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800/80">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          System & Account Settings
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Customize your academic agenda preferences and notification thresholds.
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-center space-x-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-center space-x-2 animate-fade-in">
          <span className="shrink-0">⚠️</span>
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Profile Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Student Profile</h3>
              <p className="text-xs text-slate-400">Your personal identification in Arcadia</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 bg-slate-950/50 border border-slate-800/80 rounded-xl text-sm text-slate-500 cursor-not-allowed"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Email is tied to your institutional account.
              </span>
            </div>
          </div>
        </div>

        {/* Deadline Warning Window Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Academic Warning Window</h3>
              <p className="text-xs text-slate-400">
                Configure how many days in advance assignments trigger urgent "Due Soon" warnings on
                your dashboard.
              </p>
            </div>
          </div>

          <div className="pt-2 max-w-md">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Warning Window (Days before deadline)
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="number"
                min="1"
                max="30"
                required
                value={warningDays}
                onChange={(e) => setWarningDays(e.target.value)}
                className="w-32 px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 font-bold"
              />
              <span className="text-xs text-slate-400">
                Default: <strong className="text-indigo-400">3 days</strong> (Range: 1 – 30 days)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Any assignment due within this timeframe is highlighted in the Amber "Due Soon" strip
              on your dashboard and sorted by imminent urgency.
            </p>
          </div>
        </div>

        {/* Security / System Info Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Data Isolation & Security</h3>
              <p className="text-xs text-slate-400">Security enforcement standards</p>
            </div>
          </div>

          <div className="text-xs text-slate-400 space-y-1.5 pt-1">
            <p>✓ All user queries enforce server-side verified JWT ownership tokens.</p>
            <p>✓ Passwords hashed with salted bcrypt rounds before persistence.</p>
            <p>✓ Resources (assignments, goals, ideas, doodles) strictly isolated to your user ID.</p>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            {submitting ? 'Saving Settings...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};
