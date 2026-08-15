import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, KeyRound, Sliders, ShieldCheck } from 'lucide-react';
import { ProfileHero } from '../components/features/profile/ProfileHero';
import { ProfileBioTab } from '../components/features/profile/ProfileBioTab';
import { ProfileSecurityTab } from '../components/features/profile/ProfileSecurityTab';
import { ProfilePreferencesTab } from '../components/features/profile/ProfilePreferencesTab';
import { ProfileActivityTab } from '../components/features/profile/ProfileActivityTab';

export const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'bio' | 'security' | 'preferences' | 'activity'>('bio');

  const isTeacher = user?.role === 'guru' || user?.role === 'admin';

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in pb-16">
      {/* 1. Sleek Hero Header */}
      <ProfileHero user={user} isTeacher={isTeacher} />

      {/* 2. Interactive Tab Navigation */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-1.5 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('bio')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === 'bio'
              ? 'bg-[#1e1b4b] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Biodata & Dapodik</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === 'security'
              ? 'bg-[#1e1b4b] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Keamanan & Sandi</span>
          {user?.is_initial_password && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('preferences')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === 'preferences'
              ? 'bg-[#1e1b4b] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Preferensi & Audio</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('activity')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === 'activity'
              ? 'bg-[#1e1b4b] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Sesi & Sistem</span>
        </button>
      </div>

      {/* 3. Active Tab Content */}
      <div className="transition-all">
        {activeTab === 'bio' && (
          <ProfileBioTab
            user={user}
            isTeacher={isTeacher}
            onUserUpdated={(updatedUser) => {
              if (updateUser) {
                updateUser(updatedUser);
              }
            }}
          />
        )}

        {activeTab === 'security' && <ProfileSecurityTab user={user} />}

        {activeTab === 'preferences' && <ProfilePreferencesTab />}

        {activeTab === 'activity' && <ProfileActivityTab user={user} />}
      </div>
    </div>
  );
};
