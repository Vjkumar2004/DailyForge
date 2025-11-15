import React, { useState } from 'react';
import { Mail, Lock, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import AuthWrapper from '../components/AuthWrapper.jsx';
import AuthInput from '../components/AuthInput.jsx';
import AuthButton from '../components/AuthButton.jsx';
import { auth } from '../firebase.js';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const errors = {
    email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? 'Enter a valid email address' : '',
    password: !form.password ? 'Password is required' : '',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!errors.email && !errors.password) {
      // UI-only: no real submit
      setError('');
      setLoading(true);
      try {
        await signInWithEmailAndPassword(auth, form.email, form.password);
        navigate('/');
      } catch (err) {
        const message = err?.message || 'Failed to log in. Please try again.';
        setError(message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <AuthWrapper mode="login">
      <div className="space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-200/80">
            WELCOME BACK
          </p>
          <h1 className="mt-1 font-sans text-2xl font-semibold text-white">
            Welcome back to DailyForge.
          </h1>
          <p className="mt-1 text-xs text-slate-200/85">
            Pick up your streak, rejoin your rooms, and give today a clear focus.
          </p>
        </div>

        <motion.div
          className="flex items-center gap-2 rounded-2xl bg-slate-900/60 px-3 py-2 text-[11px] text-slate-200 ring-1 ring-white/15"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
          <span>
            Users who log in daily increase their focus time by ~40%.
          </span>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <AuthInput
            label="Email"
            type="email"
            placeholder="you@example.com"
            icon={Mail}
            name="email"
            value={form.email}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {touched.email && errors.email && (
            <p className="text-[11px] text-rose-200">{errors.email}</p>
          )}

          <AuthInput
            label="Password"
            type="password"
            placeholder="Enter your password"
            icon={Lock}
            name="password"
            value={form.password}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {touched.password && errors.password && (
            <p className="text-[11px] text-rose-200">{errors.password}</p>
          )}

          <div className="flex items-center justify-between pt-1 text-[11px] text-slate-200/90">
            <a href="#" className="text-slate-200 hover:text-white">
              Forgot password?
            </a>
            <Link to="/signup" className="font-medium text-cyan-200 hover:text-white">
              Create an account
            </Link>
          </div>

          <div className="pt-3 space-y-2">
            <AuthButton type="submit" text={loading ? 'Logging in...' : 'Log In'} />
            {error && (
              <p className="text-[11px] text-rose-200 text-center">{error}</p>
            )}
          </div>
        </form>
      </div>
    </AuthWrapper>
  );
};

export default Login;
