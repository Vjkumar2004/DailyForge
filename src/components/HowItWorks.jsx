import React from 'react';
import { motion } from 'framer-motion';
import { Users, Activity, Trophy } from 'lucide-react';

const steps = [
  {
    icon: Users,
    title: 'Create or Join a Room',
    description:
      'Start a focus room for your goal, or join an existing one with people chasing similar outcomes.',
  },
  {
    icon: Activity,
    title: 'Stay Active & Earn Points',
    description:
      'Stay on camera, check-in regularly, and keep working—ZENTRO tracks your streaks and focus time.',
  },
  {
    icon: Trophy,
    title: 'Compete on Leaderboards',
    description:
      'Climb weekly and all-time leaderboards to turn peer pressure into consistent progress.',
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="relative py-14">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />
      <div className="mx-auto max-w-5xl px-4">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300/90">
            HOW IT WORKS
          </p>
          <h2 className="mt-2 bg-gradient-to-r from-indigo-200 to-cyan-200 bg-clip-text text-2xl font-semibold text-transparent sm:text-3xl">
            Peer-pressure, but friendly.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-slate-400">
            DailyForge turns your solo grind into a shared ritual—structured focus, shared accountability, and just enough tension to keep you showing up.
          </p>
        </motion.div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                className="group rounded-2xl bg-slate-950/80 p-4 shadow-lg shadow-slate-950/70 ring-1 ring-white/8 backdrop-blur-xl"
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: 0.1 * index }}
                whileHover={{ y: -6 }}
              >
                <div className="inline-flex rounded-2xl bg-gradient-to-tr from-indigo-500/25 via-violet-500/30 to-cyan-400/25 p-[1px]">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[15px] bg-slate-950">
                    <Icon className="h-5 w-5 text-cyan-300" />
                  </div>
                </div>
                <h3 className="mt-4 text-sm font-semibold text-slate-50">
                  {index + 1}. {step.title}
                </h3>
                <p className="mt-2 text-xs text-slate-400">{step.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
