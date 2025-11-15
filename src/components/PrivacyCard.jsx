import React from 'react';
import { motion } from 'framer-motion';

const PrivacyCard = ({ title, description, icon: Icon, selected, onClick }) => {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`flex w-full items-start gap-3 rounded-2xl border px-3 py-3 text-left text-sm transition shadow-md backdrop-blur-xl ${
        selected
          ? 'border-cyan-400/80 bg-gradient-to-r from-indigo-500/20 via-violet-500/20 to-cyan-500/20 shadow-indigo-500/40'
          : 'border-white/10 bg-slate-950/70 shadow-slate-950/60 hover:border-cyan-300/60 hover:bg-slate-900/80'
      }`}
    >
      <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-900/80">
        {Icon && <Icon className={`h-4 w-4 ${selected ? 'text-cyan-300' : 'text-slate-200'}`} />}
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-50">{title}</p>
        <p className="mt-1 text-[11px] text-slate-300">{description}</p>
      </div>
      <div className="ml-auto mt-1 h-4 w-4 rounded-full border border-white/30 bg-slate-900/80">
        {selected && <div className="h-3 w-3 rounded-full bg-cyan-400 m-[2px]" />}
      </div>
    </motion.button>
  );
};

export default PrivacyCard;
