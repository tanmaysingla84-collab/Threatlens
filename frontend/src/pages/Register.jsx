import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/auth.api';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  function validate() {
    const e = {};
    if (!form.name.trim() || form.name.length < 2) e.name = 'Name must be at least 2 characters';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Valid email required';
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (!/[A-Za-z]/.test(form.password)) e.password = 'Password must contain a letter';
    if (!/[0-9]/.test(form.password)) e.password = 'Password must contain a number';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError('');
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const { data } = await authApi.register({ name: form.name, email: form.email, password: form.password });
      login(data.data.user, { accessToken: data.data.accessToken, refreshToken: data.data.refreshToken });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setApiError(err.response?.data?.error?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const Field = ({ id, label, type = 'text', field, placeholder, autoComplete }) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-text-secondary mb-1.5">{label}</label>
      <input
        id={id} type={type} autoComplete={autoComplete} required
        value={form[field]}
        onChange={(e) => setForm({ ...form, [field]: e.target.value })}
        placeholder={placeholder}
        className={`input-field ${errors[field] ? 'border-threat-high/60 focus:border-threat-high' : ''}`}
      />
      {errors[field] && <p className="mt-1 text-xs text-threat-high">{errors[field]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary px-4 py-8">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-accent-purple/10 blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent-blue/10 blur-3xl animate-pulse-slow" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-primary shadow-glow-blue mb-4"
          >
            <span className="text-white font-bold text-xl">TL</span>
          </motion.div>
          <h1 className="text-2xl font-bold text-text-primary">
            Create your <span className="text-gradient">account</span>
          </h1>
          <p className="mt-2 text-sm text-text-secondary">Join the ThreatLens SOC platform</p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-5" id="register-form">
            <Field id="register-name"    label="Full Name"        field="name"            placeholder="Jane Analyst"           autoComplete="name" />
            <Field id="register-email"   label="Email address"    field="email"           placeholder="analyst@example.com"    autoComplete="email" type="email" />
            <Field id="register-password" label="Password"        field="password"        placeholder="Min. 8 chars, 1 letter, 1 number" autoComplete="new-password" type="password" />
            <Field id="register-confirm" label="Confirm Password" field="confirmPassword" placeholder="••••••••"               autoComplete="new-password" type="password" />

            {apiError && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-4 py-3 rounded-xl bg-threat-high/10 border border-threat-high/30 text-threat-high text-sm"
              >
                {apiError}
              </motion.div>
            )}

            <button id="register-submit-btn" type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-text-secondary">
            Already have an account?{' '}
            <Link to="/login" className="text-accent-indigo hover:text-accent-purple font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
