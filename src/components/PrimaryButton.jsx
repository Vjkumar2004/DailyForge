import React from 'react';
import { motion } from 'framer-motion';

const PrimaryButton = ({ text, icon: Icon, onClick, type = 'button' }) => {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/40 transition-colors hover:from-indigo-400 hover:to-cyan-300"
    >
      {Icon && <Icon className="h-4 w-4" />}
      <span>{text}</span>
    </motion.button>
  );
};

export default PrimaryButton;
