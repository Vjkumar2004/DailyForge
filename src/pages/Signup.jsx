import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Info, Mail, Lock, User } from 'lucide-react';
import AuthWrapper from '../components/AuthWrapper.jsx';
import AuthInput from '../components/AuthInput.jsx';
import AuthButton from '../components/AuthButton.jsx';
import { auth } from '../firebase.js';

const Signup = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    about: '',
  });
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

  const passwordValid = form.password.length >= 8;
  const passwordsMatch = form.password && form.password === form.confirmPassword;

  const errors = {
    name: !form.name.trim() ? 'Full name is required' : '',
    email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? 'Enter a valid email address' : '',
    password: !passwordValid ? 'At least 8 characters' : '',
    confirmPassword: !passwordsMatch ? 'Passwords must match' : '',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true, confirmPassword: true });
    if (!errors.name && !errors.email && !errors.password && !errors.confirmPassword) {
      setError('');
      setLoading(true);
      try {
        await createUserWithEmailAndPassword(auth, form.email, form.password);

        const response = await fetch('http://localhost:5000/api/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: form.name,
            email: form.email,
            password: form.password,
            about: form.about,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.token) {
            localStorage.setItem('authToken', data.token);
          }
        }

        navigate('/');
      } catch (err) {
        const message = err?.message || 'Failed to create account. Please try again.';
        setError(message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <AuthWrapper mode="signup">
      <div className="space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-200/80">
            CREATE ACCOUNT
          </p>
          <h1 className="mt-1 font-sans text-2xl font-semibold text-white">
            Join DailyForge and protect your focus.
          </h1>
          <p className="mt-1 text-xs text-slate-200/80">
            Rooms, streaks, and gentle peer pressure––so your future self can thank you.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-2xl bg-slate-900/50 px-3 py-2 text-[11px] text-slate-200 ring-1 ring-white/15">
          <Info className="h-3.5 w-3.5 text-cyan-300" />
          <span>Build your streak with ZENTRO and join thousands of focused learners.</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <AuthInput
            label="Full Name"
            type="text"
            placeholder="Your name"
            icon={User}
            name="name"
            value={form.name}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {touched.name && errors.name && (
            <p className="text-[11px] text-rose-200">{errors.name}</p>
          )}

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

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-100">Password</span>
              <span className="flex items-center gap-1 text-[10px] text-slate-200/80">
                <Lock className="h-3 w-3" />
                <span>Min 8 chars, mix letters & numbers</span>
              </span>
            </div>
            <AuthInput
              label=""
              type="password"
              placeholder="Create a strong password"
              name="password"
              value={form.password}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {touched.password && errors.password && (
              <p className="text-[11px] text-rose-200">{errors.password}</p>
            )}
          </div>

          <AuthInput
            label="Confirm Password"
            type="password"
            placeholder="Repeat your password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {touched.confirmPassword && errors.confirmPassword && (
            <p className="text-[11px] text-rose-200">{errors.confirmPassword}</p>
          )}

          <div className="space-y-1 pt-1 text-xs">
            <label className="block text-xs font-medium text-slate-100">About Me (optional)</label>
            <textarea
              name="about"
              value={form.about}
              onChange={handleChange}
              onBlur={handleBlur}
              rows={4}
              placeholder="Share a short note about your goals, study style, or what you want to focus on."
              className="mt-1 w-full rounded-2xl border border-white/15 bg-slate-950/80 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 outline-none shadow-inner shadow-slate-950/60 focus:border-cyan-400/80 focus:ring-2 focus:ring-cyan-400/60"
            />
          </div>

          <div className="pt-2 space-y-2">
            <AuthButton type="submit" text={loading ? 'Creating account...' : 'Create Account'} />
            {error && (
              <p className="text-[11px] text-rose-200 text-center">{error}</p>
            )}
          </div>
        </form>

        <div className="flex items-center justify-between pt-1 text-[11px] text-slate-200/90">
          <span>Already have an account?</span>
          <Link to="/login" className="font-medium text-cyan-200 hover:text-white">
            Log in
          </Link>
        </div>
      </div>
    </AuthWrapper>
  );
};

export default Signup;
