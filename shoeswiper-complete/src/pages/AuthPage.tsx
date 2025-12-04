import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { FaGoogle, FaApple, FaEnvelope, FaLock, FaUser } from 'react-icons/fa';

type AuthMode = 'signin' | 'signup';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username }
          }
        });
        if (error) throw error;
        
        // Create profile
        if (data.user) {
          await supabase.from('profiles').insert({
            id: data.user.id,
            email,
            username,
          });
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
      navigate('/');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Authentication failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'apple') => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "OAuth sign-in failed";
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-black gradient-text mb-2">ShoeSwiper</h1>
        <p className="text-zinc-400">Swipe. Match. Cop.</p>
      </div>

      {/* Auth Card */}
      <div className="w-full max-w-md bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
        {/* Tabs */}
        <div className="flex mb-6 bg-zinc-800 rounded-xl p-1" role="tablist" aria-label="Authentication options">
          <button
            onClick={() => setMode('signin')}
            role="tab"
            aria-selected={mode === 'signin'}
            id="signin-tab"
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === 'signin' ? 'bg-orange-500 text-white' : 'text-zinc-400'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('signup')}
            role="tab"
            aria-selected={mode === 'signup'}
            id="signup-tab"
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === 'signup' ? 'bg-orange-500 text-white' : 'text-zinc-400'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm" role="alert">
            {error}
          </div>
        )}

        {/* OAuth Buttons */}
        <div className="space-y-3 mb-6">
          <button
            onClick={() => handleOAuth('google')}
            disabled={loading}
            aria-label="Continue with Google"
            className="w-full flex items-center justify-center gap-3 py-3 bg-white text-black rounded-xl font-medium hover:bg-zinc-100 disabled:opacity-50"
          >
            <FaGoogle aria-hidden="true" /> Continue with Google
          </button>
          <button
            onClick={() => handleOAuth('apple')}
            disabled={loading}
            aria-label="Continue with Apple"
            className="w-full flex items-center justify-center gap-3 py-3 bg-zinc-800 text-white rounded-xl font-medium hover:bg-zinc-700 disabled:opacity-50"
          >
            <FaApple aria-hidden="true" /> Continue with Apple
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-zinc-800" />
          <span className="text-zinc-500 text-sm">or</span>
          <div className="flex-1 h-px bg-zinc-800" />
        </div>

        {/* Email Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          {mode === 'signup' && (
            <div className="relative">
              <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" aria-hidden="true" />
              <label htmlFor="username" className="sr-only">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                required
                autoComplete="username"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder-zinc-500 focus:border-orange-500 outline-none"
              />
            </div>
          )}
          
          <div className="relative">
            <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" aria-hidden="true" />
            <label htmlFor="email" className="sr-only">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              autoComplete="email"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder-zinc-500 focus:border-orange-500 outline-none"
            />
          </div>

          <div className="relative">
            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" aria-hidden="true" />
            <label htmlFor="password" className="sr-only">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              minLength={6}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder-zinc-500 focus:border-orange-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 rounded-xl text-white font-bold disabled:opacity-50"
          >
            {loading ? 'Loading...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>

      {/* Skip */}
      <button
        onClick={() => navigate('/')}
        className="mt-6 text-zinc-500 hover:text-white text-sm"
      >
        Continue as guest
      </button>
    </div>
  );
};

export default AuthPage;
