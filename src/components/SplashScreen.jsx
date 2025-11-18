import React from 'react';
import { motion } from 'framer-motion';
import logo from '../assets/logo.svg';

const SplashScreen = () => {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="pointer-events-none absolute inset-0 opacity-50">
        <div className="absolute -left-20 top-10 h-56 w-56 rounded-full bg-violet-500/40 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-cyan-500/40 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative flex flex-col items-center gap-4 rounded-3xl bg-slate-950/70 px-10 py-8 shadow-2xl shadow-slate-900/70 ring-1 ring-white/10 backdrop-blur-2xl"
      >
        <motion.img
          src={logo}
          alt="ZENTRO"
          className="h-20 w-20 drop-shadow-xl"
          animate={{
            scale: [1, 1.06, 1],
            filter: ['brightness(1)', 'brightness(1.2)', 'brightness(1)'],
          }}
          transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
        />
        <motion.h1
          className="bg-gradient-to-r from-indigo-300 via-violet-200 to-cyan-300 bg-clip-text text-3xl font-semibold tracking-tight text-transparent"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          DailyForge
        </motion.h1>
        <p className="text-sm text-slate-300/90">Peer-Pressure Productivity Rooms</p>
      </motion.div>
    </div>
  );
};

export default SplashScreen;
