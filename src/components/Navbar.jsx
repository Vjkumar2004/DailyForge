import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/logo.svg';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

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
          {!isAuthPage && (
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
        </div>
      </div>
    </header>
  );
};

export default Navbar;
