import React from 'react';
import { motion } from 'framer-motion';

const InputField = ({ label, placeholder, icon: Icon, value, onChange, ...rest }) => {
  return (
    <div className="space-y-1.5 text-sm">
      <label className="block text-xs font-medium tracking-wide text-slate-100/90">
        {label}
      </label>
      <motion.div
        whileFocus={{ scale: 1.01 }}
        className="flex items-center rounded-2xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-white shadow-inner shadow-white/10 focus-within:border-cyan-300/80 focus-within:ring-2 focus-within:ring-cyan-300/70"
      >
        {Icon && <Icon className="mr-2 h-4 w-4 text-slate-100/80" />}
        <input
          {...rest}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full bg-transparent font-sans text-sm text-white placeholder:text-white/60 outline-none"
        />
      </motion.div>
    </div>
  );
};

export default InputField;
