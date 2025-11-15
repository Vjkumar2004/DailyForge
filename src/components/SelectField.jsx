import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const SelectField = ({ label, options = [], icon: Icon, value, onChange }) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (option) => {
    onChange(option);
    setOpen(false);
  };

  return (
    <div className="space-y-1.5 text-sm relative">
      <label className="block text-xs font-medium tracking-wide text-slate-100/90">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-2xl border border-white/15 bg-white/10 px-3 py-2 text-left text-sm text-white shadow-inner shadow-white/10 outline-none ring-0 transition focus:border-cyan-300/80 focus:ring-2 focus:ring-cyan-300/70"
      >
        <span className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-slate-100/80" />}
          <span className={value ? 'text-white' : 'text-white/60'}>
            {value || 'Select category'}
          </span>
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4 text-slate-100/80" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="absolute z-20 mt-1 w-full overflow-hidden rounded-2xl border border-white/15 bg-slate-950/95 text-xs text-white shadow-xl shadow-slate-950/80 backdrop-blur-xl"
          >
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => handleSelect(opt)}
                className="flex w-full items-center px-3 py-2 text-left hover:bg-white/10"
              >
                <span className="ml-1">{opt}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SelectField;
