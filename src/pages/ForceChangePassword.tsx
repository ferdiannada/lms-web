import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ProfileSecurityTab } from '../components/features/profile/ProfileSecurityTab';
import { ShieldAlert } from 'lucide-react';
import { Navigate } from 'react-router-dom';

export const ForceChangePassword: React.FC = () => {
  const { user } = useAuth();

  // If somehow they land here but don't need to change password
  if (user && !user.is_initial_password) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-m3-surface-container flex items-center justify-center p-4 z-50 fixed inset-0">
      <div className="max-w-xl w-full bg-m3-surface rounded-3xl p-6 shadow-m3-elevation-3 overflow-y-auto max-h-[90vh]">
        <div className="flex flex-col items-center text-center space-y-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center">
            <ShieldAlert className="w-8 h-8 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-m3-on-surface">Pembaruan Keamanan Wajib</h1>
            <p className="text-sm font-medium text-m3-on-surface-variant mt-2">
              Akun Anda masih menggunakan kata sandi bawaan sistem. Untuk melindungi data akademik dan privasi, Anda wajib mengubah kata sandi sekarang sebelum dapat mengakses layanan LMS.
            </p>
          </div>
        </div>

        <ProfileSecurityTab user={user} />
      </div>
    </div>
  );
};
