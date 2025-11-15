import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const popularRooms = [
  'UPSC Study Room',
  'DSA Practice Room',
  '5AM Yoga Room',
  'Deep Work Room',
  'Pomodoro Sprint Room',
  'No-Scroll Focus Pod',
];

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative flex min-h-[calc(100vh-64px)] items-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -left-20 top-10 h-56 w-56 rounded-full bg-violet-500/40 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-cyan-500/40 blur-3xl" />
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-4 pb-16 pt-10 md:flex-row md:items-center">
        <div className="md:w-1/2">
          <motion.p
            className="inline-flex items-center gap-2 rounded-full bg-slate-900/70 px-3 py-1 text-xs font-medium text-slate-300 ring-1 ring-white/10 backdrop-blur"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            Live peer rooms 
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Always-on accountability
          </motion.p>

          <motion.h1
            className="mt-4 bg-gradient-to-r from-indigo-300 via-violet-200 to-cyan-300 bg-clip-text text-4xl font-semibold tracking-tight text-transparent sm:text-5xl"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.05 }}
          >
            Stay Focused. Stay Accountable. Together.
          </motion.h1>

          <motion.p
            className="mt-4 max-w-md text-sm text-slate-300/90 sm:text-base"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.1 }}
          >
            Join live focus rooms with real people, shared goals, and a gentle dose of peer pressure that keeps you doing the work that actually matters.
          </motion.p>

          <motion.div
            className="mt-6 flex flex-wrap items-center gap-3"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.15 }}
          >
            <button
              onClick={() => navigate('/create-room')}
              className="rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-transform hover:scale-[1.04]"
            >
              Create Room
            </button>
            <button
              onClick={() => navigate('/browse-rooms')}
              className="rounded-full border border-white/15 bg-slate-900/60 px-5 py-2.5 text-sm font-medium text-slate-100 shadow-sm transition-transform hover:scale-[1.03] hover:border-violet-400/70"
            >
              Browse Rooms
            </button>
          </motion.div>

          <motion.div
            className="mt-4 flex items-center gap-3 text-xs text-slate-400"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 text-[10px] font-semibold text-white ring-2 ring-slate-950"
                >
                  +{i}k
                </div>
              ))}
            </div>
            <span>Creators, students & founders co-working every day.</span>
          </motion.div>
        </div>

        <div className="md:w-1/2">
          <motion.div
            className="relative rounded-3xl bg-slate-900/70 p-4 shadow-2xl shadow-slate-900/60 ring-1 ring-white/5 backdrop-blur-xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="pointer-events-none absolute inset-x-8 top-0 h-10 rounded-b-full bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-cyan-500/10" />
            <div className="relative h-64 overflow-hidden rounded-2xl bg-slate-950/70 p-3 ring-1 ring-white/5">
              <motion.div
                className="flex flex-col gap-3"
                animate={{ y: ['0%', '-50%'] }}
                transition={{ repeat: Infinity, duration: 16, ease: 'linear' }}
              >
                {[...popularRooms, ...popularRooms].map((room, idx) => (
                  <motion.div
                    key={idx}
                    className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-indigo-500/15 via-violet-500/15 to-cyan-500/15 px-4 py-3 text-sm text-slate-100 shadow-sm shadow-slate-900/40 ring-1 ring-white/10"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                  >
                    <div>
                      <p className="font-medium">{room}</p>
                      <p className="text-xs text-slate-400">Live focus • Cameras optional</p>
                    </div>
                    <div className="flex flex-col items-end text-xs text-slate-300">
                      <span className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        Active
                      </span>
                      <span className="text-[11px] text-slate-400">+{12 + (idx % 7)} online</span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
