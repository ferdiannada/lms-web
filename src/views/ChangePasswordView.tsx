import { useState } from '@lynx-js/react';
import { authService } from '../services/authService';

interface ChangePasswordViewProps {
  onSuccess: () => void;
}

export function ChangePasswordView({ onSuccess }: ChangePasswordViewProps) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      setErrorMsg('Semua kolom wajib diisi');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Konfirmasi kata sandi baru tidak cocok');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('Kata sandi baru minimal 6 karakter');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      await authService.changePassword(oldPassword, newPassword);
      alert('Kata sandi berhasil diperbarui! Silakan melanjutkan.');
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengubah kata sandi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <view
      className="main-content"
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh',
      }}
    >
      <view
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '36px',
          borderRadius: '24px',
        }}
      >
        <view style={{ textAlign: 'center', marginBottom: '24px' }}>
          <text
            style={{
              fontSize: '1.4rem',
              fontWeight: '800',
              color: 'var(--text-main)',
            }}
          >
            🔒 Ubah Kata Sandi Pertama
          </text>
          <text
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              marginTop: '8px',
              lineHeight: '1.4',
            }}
          >
            Demi keamanan akun Anda, harap perbarui kata sandi bawaan awal
            sebelum melanjutkan.
          </text>
        </view>

        {errorMsg ? (
          <view
            style={{
              background: 'var(--accent-rose-bg)',
              border: '1px solid #fecaca',
              color: 'var(--accent-rose)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '16px',
              fontSize: '0.85rem',
              fontWeight: '600',
            }}
          >
            <text>{errorMsg}</text>
          </view>
        ) : null}

        <view className="form-group">
          <text className="form-label">Kata Sandi Lama / Awal</text>
          <input
            className="form-input"
            type="password"
            bindinput={(e: any) => setOldPassword(e.detail.value)}
          />
        </view>

        <view className="form-group">
          <text className="form-label">Kata Sandi Baru</text>
          <input
            className="form-input"
            type="password"
            bindinput={(e: any) => setNewPassword(e.detail.value)}
          />
        </view>

        <view className="form-group" style={{ marginBottom: '24px' }}>
          <text className="form-label">Konfirmasi Kata Sandi Baru</text>
          <input
            className="form-input"
            type="password"
            bindinput={(e: any) => setConfirmPassword(e.detail.value)}
          />
        </view>

        <view
          className="btn-primary"
          style={{ width: '100%' }}
          bindtap={handleSubmit}
        >
          <text style={{ color: '#ffffff', fontWeight: '700' }}>
            {loading ? 'Menyimpan...' : 'Perbarui Kata Sandi ➔'}
          </text>
        </view>
      </view>
    </view>
  );
}
