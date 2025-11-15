import React from 'react';
import { motion } from 'framer-motion';
import Navbar from './Navbar.jsx';

const floatingVariant = {
  animate: {
    y: [-8, 8, -8],
    transition: {
      duration: 10,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

const AuthWrapper = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-950 text-slate-50">
      <Navbar />
      {/* Floating shapes background */}
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-50">
        <motion.div
          className="absolute -left-10 top-10 h-40 w-40 rounded-full bg-indigo-500/30 blur-3xl"
          variants={floatingVariant}
          animate="animate"
        />
        <motion.div
          className="absolute bottom-10 right-0 h-52 w-52 rounded-full bg-cyan-400/30 blur-3xl"
          variants={floatingVariant}
          animate="animate"
          transition={{ duration: 12 }}
        />
      </div>

      <div className="mx-auto flex min-h-[70vh] max-w-md items-center justify-center px-4 pb-10">
        <div className="relative w-full">
          <div className="absolute -inset-4 -z-10 rounded-3xl bg-slate-900/80 blur-2xl" />
          <motion.div
            className="rounded-3xl border border-white/10 bg-slate-950/85 p-6 shadow-2xl shadow-slate-950/80 backdrop-blur-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AuthWrapper;
