import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authApi } from '../services/auth.api';

export default function ForgotPassword() {
  const [email, setEmail]     = useState('');
  const [sent, setSent]       = useState(false);
  const [devUrl, setDevUrl]   = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await authApi.forgotPassword(email);
      setSent(true);
      if (data.data?.devResetUrl) setDevUrl(data.data.devResetUrl);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary px-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-accent-blue/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-primary shadow-glow-blue mb-4">
            <span className="text-white font-bold text-xl">TL</span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Reset your password</h1>
          <p className="mt-2 text-sm text-text-secondary">Enter your email to receive a reset link</p>
        </div>

        <div className="glass-card p-8">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-threat-safe/15 border border-threat-safe/30 flex items-center justify-center mx-auto text-2xl">✓</div>
              <p className="text-text-primary font-medium">Check your email</p>
              <p className="text-text-secondary text-sm">If that email exists, a reset link has been sent.</p>
              {devUrl && (
                <div className="mt-4 p-3 rounded-xl bg-accent-indigo/10 border border-accent-indigo/30 text-left">
                  <p className="text-xs text-accent-indigo font-medium mb-1">DEV MODE — Reset Link:</p>
                  <a href={devUrl} className="text-xs text-text-secondary break-all hover:text-accent-indigo transition-colors">{devUrl}</a>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" id="forgot-password-form">
              <div>
                <label htmlFor="forgot-email" className="block text-sm font-medium text-text-secondary mb-1.5">Email address</label>
                <input
                  id="forgot-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@example.com"
                  className="input-field"
                />
              </div>
              {error && <p className="text-threat-high text-sm">{error}</p>}
              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? 'Sending...' : 'Send reset link'}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-text-secondary">
            <Link to="/login" className="text-accent-indigo hover:text-accent-purple transition-colors">← Back to sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
