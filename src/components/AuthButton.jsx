import React from 'react';
import { motion } from 'framer-motion';

const AuthButton = ({ text, onClick, type = 'button' }) => {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      className="w-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/40 transition-colors hover:from-indigo-400 hover:to-cyan-300"
    >
      {text}
    </motion.button>
  );
};

export default AuthButton;
