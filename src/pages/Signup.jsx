import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Info, Mail, Lock, User } from 'lucide-react';
import AuthWrapper from '../components/AuthWrapper.jsx';
import AuthInput from '../components/AuthInput.jsx';
import AuthButton from '../components/AuthButton.jsx';

const Signup = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [touched, setTouched] = useState({});

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

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true, confirmPassword: true });
    if (!errors.name && !errors.email && !errors.password && !errors.confirmPassword) {
      // UI-only: no real submit
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

          <div className="pt-2">
            <AuthButton type="submit" text="Create Account" />
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
