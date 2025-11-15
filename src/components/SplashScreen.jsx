import React from 'react';
import { motion } from 'framer-motion';
import logo from '../assets/logo.svg';

const SplashScreen = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-500">
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="flex flex-col items-center gap-4 rounded-3xl bg-slate-950/40 px-10 py-8 shadow-2xl shadow-slate-900/60 backdrop-blur-2xl"
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
          className="bg-gradient-to-r from-indigo-100 via-violet-100 to-cyan-100 bg-clip-text text-3xl font-semibold tracking-tight text-transparent"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          DailyForge
        </motion.h1>
        <p className="text-sm text-slate-100/80">Peer-Pressure Productivity Rooms</p>
      </motion.div>
    </div>
  );
};

export default SplashScreen;
