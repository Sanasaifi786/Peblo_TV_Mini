import React, { useState } from 'react';
import { Film, Lock, Mail, Shield, AlertCircle, Loader2 } from 'lucide-react';
import { api, setAuthSession } from '../api/client';

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('admin@peblo.tv');
  const [password, setPassword] = useState('adminpassword123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.login(email, password);
      setAuthSession(res.access_token, res.role, res.email);
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const setCredentials = (role: 'admin' | 'editor') => {
    if (role === 'admin') {
      setEmail('admin@peblo.tv');
      setPassword('adminpassword123');
    } else {
      setEmail('editor@peblo.tv');
      setPassword('editorpassword123');
    }
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#090b10] flex items-center justify-center p-4">
      {/* Glow effects */}
      <div className="absolute w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none -top-20 -left-20" />
      <div className="absolute w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none -bottom-20 -right-20" />

      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 p-8 rounded-3xl shadow-2xl shadow-black/80">
          {/* Logo Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-900/40 mb-4">
              <Film className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              PEBLO<span className="text-rose-500">TV</span> CMS
            </h1>
            <p className="text-xs text-slate-400 mt-1">Streaming Content Management & Publishing Studio</p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="editor@peblo.tv"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-rose-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-rose-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-all shadow-lg shadow-rose-950/50 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In to CMS</span>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-8 pt-6 border-t border-slate-800/80">
            <div className="text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Quick Test Profiles
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setCredentials('admin')}
                className="px-3 py-2 rounded-xl bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800 text-left transition-colors flex flex-col"
              >
                <span className="text-xs font-semibold text-purple-400 flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Admin
                </span>
                <span className="text-[10px] text-slate-500 truncate">admin@peblo.tv</span>
              </button>

              <button
                type="button"
                onClick={() => setCredentials('editor')}
                className="px-3 py-2 rounded-xl bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800 text-left transition-colors flex flex-col"
              >
                <span className="text-xs font-semibold text-sky-400">Editor</span>
                <span className="text-[10px] text-slate-500 truncate">editor@peblo.tv</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
