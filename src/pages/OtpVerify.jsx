import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, KeyRound } from 'lucide-react';
import { motion } from 'framer-motion';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase.js';
import AuthWrapper from '../components/AuthWrapper.jsx';
import { verifyOtp } from '../api/auth.js';

const OtpVerify = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const emailFromState = location.state?.email || '';
  const passwordFromState = location.state?.password || '';
  const nameFromState = location.state?.name || '';
  const fromSignup = location.state?.fromSignup || false;
  const [email] = useState(emailFromState);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      setError('Enter the 6-digit code sent to your email.');
      return;
    }

    setLoading(true);
    try {
      const res = await verifyOtp({ email, otp });
      if (res.ok) {
        // Only create the Firebase user AFTER OTP verify, and only for signup flow
        if (fromSignup && email && passwordFromState) {
          await createUserWithEmailAndPassword(auth, email, passwordFromState);
          // You could also save the name to Firestore here if desired.
        }
        navigate('/');
      } else {
        setError('Invalid or expired code. Try again.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthWrapper>
      <div className="space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-200/80 flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-cyan-300" />
            OTP VERIFY
          </p>
          <h1 className="mt-1 font-sans text-2xl font-semibold text-white">
            Enter the code to continue.
          </h1>
          <p className="mt-1 text-xs text-slate-200/80 flex items-center gap-1">
            <Mail className="h-3.5 w-3.5" />
            Weve sent a 6-digit code to
            <span className="font-medium text-white">{email || 'your email'}</span>.
          </p>
        </div>

        <motion.div
          className="rounded-2xl bg-slate-900/70 px-3 py-2 text-[11px] text-slate-200 ring-1 ring-white/10 flex items-center gap-2"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <KeyRound className="h-3.5 w-3.5 text-cyan-300" />
          <span>For demo, any 6-digit code will be treated as valid until backend is wired.</span>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5 text-sm">
            <label className="block text-xs font-medium tracking-wide text-slate-100">One-time code</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="000000"
              className="w-full rounded-2xl border border-white/15 bg-slate-950/80 px-3 py-2 text-center text-lg font-mono tracking-[0.6em] text-white placeholder:text-slate-600 outline-none focus:border-cyan-300/80 focus:ring-2 focus:ring-cyan-300/70"
            />
          </div>

          {error && <p className="text-[11px] text-rose-300">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/40 transition-transform hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Verifying...' : 'Verify & Continue'}
          </button>
        </form>

        <p className="pt-1 text-[11px] text-slate-400">
          In a real deployment, this step should call a secure backend that uses your MailSuit API
          key and secret on the server only.
        </p>
      </div>
    </AuthWrapper>
  );
};

export default OtpVerify;
