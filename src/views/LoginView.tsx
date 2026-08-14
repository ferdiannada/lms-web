import { useState } from '@lynx-js/react';
import { authService } from '../services/authService';
import type { User } from '../types';

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
}

export function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [showPassword, setShowPassword] = useState(false);

  const getInputValue = (e: any): string => {
    if (typeof e === 'string') return e;
    if (e?.detail?.value !== undefined) return String(e.detail.value);
    if (e?.target?.value !== undefined) return String(e.target.value);
    if (e?.currentTarget?.value !== undefined) return String(e.currentTarget.value);
    if (e?.value !== undefined) return String(e.value);
    if (e?.detail && typeof e.detail === 'string') return e.detail;
    if (e?.target && typeof e.target === 'string') return e.target;
    return '';
  };

  const getValFromDOM = (index: number): string => {
    if (typeof document === 'undefined') return '';

    const elements = Array.from(
      document.querySelectorAll('x-input, input, textarea'),
    );
    if (!elements || elements.length === 0) return '';

    const el = elements[index];
    if (!el) return '';

    if ('value' in el && (el as any).value) {
      return String((el as any).value).trim();
    }
    const attr = el.getAttribute('value');
    if (attr) return attr.trim();

    if (el.shadowRoot) {
      const inner =
        el.shadowRoot.querySelector('input') ||
        el.shadowRoot.querySelector('textarea');
      if (inner && (inner as any).value) return String((inner as any).value).trim();
    }

    const innerLight =
      el.querySelector('input') || el.querySelector('textarea');
    if (innerLight && (innerLight as any).value)
      return String((innerLight as any).value).trim();

    return '';
  };

  const handleSubmit = async (e?: any) => {
    if (e && e.preventDefault) e.preventDefault();

    let inputEmail = email.trim() || getValFromDOM(0);
    let inputPassword = password.trim() || getValFromDOM(1);

    if (!inputEmail || !inputPassword) {
      setErrorMsg('Harap isi email/NIP/NISN dan kata sandi');
      return;
    }
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await authService.login(inputEmail, inputPassword);
      onLoginSuccess(res.user);
    } catch (err: any) {
      setErrorMsg(
        err.message || 'Gagal masuk. Periksa kembali kredensial Anda.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <view className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50 flex items-center justify-center p-4">
      <view className="bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-8 md:p-10 shadow-xl max-w-md w-full space-y-6">
        {/* Header Branding */}
        <view className="text-center space-y-2">
          <view className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-3xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/25">
            <text>🎓</text>
          </view>
          <text className="text-2xl font-black text-slate-900 tracking-tight block">
            PEDIA LMS
          </text>
          <text className="text-xs text-slate-500 font-medium block">
            Portal Pembelajaran Digital SMK Al-Azhar Sempu
          </text>
        </view>

        {/* Error Alert */}
        {errorMsg ? (
          <view className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold text-center">
            <text>{errorMsg}</text>
          </view>
        ) : null}

        {/* Input Form */}
        <view className="space-y-4">
          <view className="space-y-1.5">
            <text className="text-xs font-bold text-slate-700 block">
              Email / NIP / NIK / NISN
            </text>
            <input
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 font-bold outline-none focus:border-blue-500 focus:bg-white transition-all shadow-xs"
              type="text"
              placeholder="Masukkan ID Pengguna Anda"
              bindinput={(e: any) => setEmail(getInputValue(e))}
              onInput={(e: any) => setEmail(getInputValue(e))}
              onChange={(e: any) => setEmail(getInputValue(e))}
              bindblur={(e: any) => setEmail(getInputValue(e))}
              onBlur={(e: any) => setEmail(getInputValue(e))}
            />
          </view>

          <view className="space-y-1.5">
            <text className="text-xs font-bold text-slate-700 block">
              Kata Sandi
            </text>
            <view className="relative flex items-center">
              <input
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-12 py-3 text-sm text-slate-800 font-bold outline-none focus:border-blue-500 focus:bg-white transition-all shadow-xs"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                bindinput={(e: any) => setPassword(getInputValue(e))}
                onInput={(e: any) => setPassword(getInputValue(e))}
                onChange={(e: any) => setPassword(getInputValue(e))}
                bindblur={(e: any) => setPassword(getInputValue(e))}
                onBlur={(e: any) => setPassword(getInputValue(e))}
              />
              <view
                className="absolute right-3 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer select-none text-sm"
                bindtap={() => setShowPassword(!showPassword)}
                title={
                  showPassword
                    ? 'Sembunyikan Kata Sandi'
                    : 'Tampilkan Kata Sandi'
                }
              >
                <text>{showPassword ? '🙈' : '👁️'}</text>
              </view>
            </view>
          </view>
        </view>

        {/* Action Button */}
        <view
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-sm text-center cursor-pointer shadow-lg shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700 transition-all active:scale-[0.99]"
          bindtap={handleSubmit}
        >
          <text>{loading ? 'Memproses Masuk...' : 'Masuk ke Akun ➔'}</text>
        </view>

        {/* Footer Support Info */}
        <view className="pt-4 border-t border-slate-100 text-center text-xs text-slate-400">
          <text>Mengalami kendala masuk? Hubungi Administrator Sekolah.</text>
        </view>
      </view>
    </view>
  );
}
