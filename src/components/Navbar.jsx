import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase.js';
import logo from '../assets/logo.svg';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  const [currentUser, setCurrentUser] = useState(null);
  const [streak, setStreak] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!currentUser || !token) return;

    const fetchProfile = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/user/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) return;

        const data = await response.json();
        if (typeof data.streak === 'number') {
          setStreak(data.streak);
        }
      } catch (error) {
        // optional: handle fetch error
      }
    };

    fetchProfile();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setMenuOpen(false);
      navigate('/');
    } catch (error) {
      // optional: handle logout error
    }
  };

  const userName = currentUser?.displayName || currentUser?.email || '';
  const userInitial = userName ? userName.charAt(0).toUpperCase() : '';

  return (
    <header className="sticky top-0 z-30">
      <div className="backdrop-blur-xl bg-slate-900/60 border-b border-white/5">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <motion.button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 focus:outline-none"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <img src={logo} alt="DailyForge" className="h-9 w-9" />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-300 bg-clip-text text-lg font-semibold text-transparent">
              DailyForge
            </span>
          </motion.button>
          {!currentUser && !isAuthPage && (
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <button
                onClick={() => navigate('/login')}
                className="rounded-full border border-white/10 bg-slate-900/40 px-4 py-1.5 text-sm font-medium text-slate-100 shadow-sm transition-transform hover:scale-[1.03] hover:border-violet-400/80"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 px-4 py-1.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-transform hover:scale-[1.05]"
              >
                Sign Up
              </button>
            </motion.div>
          )}
          {currentUser && (
            <motion.div
              className="relative flex items-center gap-3"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div className="flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-500/10 px-2 py-1 text-[11px] text-amber-200">
                <span className="text-xs">🔥</span>
                <span className="font-medium">{streak}d</span>
              </div>
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="flex items-center justify-center rounded-full border border-white/10 bg-slate-900/60 p-1.5 text-sm text-slate-100 shadow-sm hover:border-violet-400/80"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-xs font-semibold text-white">
                  {userInitial}
                </span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-10 w-40 rounded-xl border border-white/10 bg-slate-950/95 py-2 text-xs text-slate-100 shadow-lg shadow-black/40">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate('/profile');
                    }}
                    className="block w-full px-3 py-2 text-left hover:bg-slate-800/80"
                  >
                    Profile
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="block w-full px-3 py-2 text-left text-rose-300 hover:bg-slate-800/80"
                  >
                    Logout
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
