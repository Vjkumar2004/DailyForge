import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';

const statsConfig = [
  { label: 'Total Users', value: 18432 },
  { label: 'Total Rooms', value: 942 },
  { label: 'Daily Active Users', value: 3160 },
];

const Counter = ({ value, delay = 0 }) => {
  const [display, setDisplay] = useState(0);
  const controls = useAnimation();

  useEffect(() => {
    controls.start({ count: value, transition: { duration: 1.2, delay, ease: 'easeOut' } });
  }, [controls, value, delay]);

  useEffect(() => {
    const start = performance.now();
    const duration = 1200;

    const step = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(eased * value));
      if (progress < 1) requestAnimationFrame(step);
    };

    const id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [value]);

  return <span>{display.toLocaleString()}</span>;
};

const StatsSection = () => {
  return (
    <section className="relative py-10">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
      <div className="mx-auto max-w-5xl px-4">
        <motion.div
          className="rounded-3xl bg-gradient-to-r from-indigo-500/15 via-violet-500/10 to-cyan-500/15 p-[1px] shadow-xl shadow-slate-950/70"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col gap-8 rounded-[22px] bg-slate-950/80 px-6 py-6 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
            <div className="max-w-sm">
              <h2 className="bg-gradient-to-r from-indigo-200 to-cyan-200 bg-clip-text text-xl font-semibold text-transparent">
                Rooms that actually make you show up.
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                DailyForge rooms keep people coming back—ship your projects, finish your syllabus, or just protect your deep work hours.
              </p>
            </div>
            <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-3">
              {statsConfig.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="rounded-2xl bg-slate-900/80 px-4 py-3 text-center shadow-md shadow-slate-950/60 ring-1 ring-white/5"
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: 0.05 * index }}
                >
                  <p className="text-xs font-medium uppercase tracking-[0.15em] text-slate-400">
                    {stat.label}
                  </p>
                  <p className="mt-1 bg-gradient-to-r from-indigo-300 via-violet-200 to-cyan-300 bg-clip-text text-2xl font-semibold text-transparent">
                    <Counter value={stat.value} delay={0.1 * index} />
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default StatsSection;
