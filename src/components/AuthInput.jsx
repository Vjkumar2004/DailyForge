import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const AuthInput = ({ label, type = 'text', placeholder, icon: Icon, value, onChange, ...rest }) => {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && show ? 'text' : type;

  return (
    <div className="space-y-1.5 text-sm">
      <label className="block text-xs font-medium tracking-wide text-slate-100">{label}</label>
      <div className="relative flex items-center rounded-xl border border-white/20 bg-white/20 px-3 py-2 text-sm text-white shadow-inner shadow-white/10 focus-within:border-cyan-200/80 focus-within:ring-2 focus-within:ring-cyan-300/70">
        {Icon && <Icon className="mr-2 h-4 w-4 text-slate-100/80" />}
        <input
          {...rest}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="peer w-full bg-transparent font-sans text-sm text-white placeholder:text-white/70 outline-none"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="ml-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-slate-100/90 transition hover:bg-white/20"
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  );
};

export default AuthInput;
