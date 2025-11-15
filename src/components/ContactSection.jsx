import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ContactSection = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const errors = {
    name: !form.name.trim() ? 'Name is required' : '',
    email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? 'Valid email required' : '',
    message: form.message.trim().length < 10 ? 'Tell us a little more (min 10 chars)' : '',
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true, message: true });
    if (!errors.name && !errors.email && !errors.message) {
      setSubmitted(true);
    }
  };

  return (
    <section id="contact" className="relative py-14">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
      <div className="mx-auto max-w-4xl px-4">
        <motion.div
          className="mx-auto max-w-xl text-center"
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300/90">
            CONTACT
          </p>
          <h2 className="mt-2 bg-gradient-to-r from-indigo-200 to-cyan-200 bg-clip-text text-2xl font-semibold text-transparent sm:text-3xl">
            Bring DailyForge to your team or community.
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            Want a private cluster of rooms for your cohort, startup, or community? Drop a note and well get back with options for DailyForge.
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          className="mt-8 rounded-3xl bg-slate-950/80 p-6 shadow-2xl shadow-slate-950/80 ring-1 ring-white/8 backdrop-blur-xl"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.05 }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-slate-200">Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                onBlur={handleBlur}
                className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 outline-none ring-1 ring-transparent transition focus:border-violet-400/80 focus:ring-violet-400/40"
                placeholder="What should we call you?"
              />
              {touched.name && errors.name && (
                <p className="mt-1 text-[11px] text-rose-400">{errors.name}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-slate-200">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 outline-none ring-1 ring-transparent transition focus:border-cyan-400/80 focus:ring-cyan-400/40"
                placeholder="you@example.com"
              />
              {touched.email && errors.email && (
                <p className="mt-1 text-[11px] text-rose-400">{errors.email}</p>
              )}
            </div>
          </div>
          <div className="mt-4">
            <label className="text-xs font-medium text-slate-200">Message</label>
            <textarea
              name="message"
              rows={4}
              value={form.message}
              onChange={handleChange}
              onBlur={handleBlur}
              className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 outline-none ring-1 ring-transparent transition focus:border-indigo-400/80 focus:ring-indigo-400/40"
              placeholder="Tell us about your use case, community size, and timelines."
            />
            {touched.message && errors.message && (
              <p className="mt-1 text-[11px] text-rose-400">{errors.message}</p>
            )}
          </div>
          <div className="mt-5 flex items-center justify-between gap-3">
            <button
              type="submit"
              className="rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-transform hover:scale-[1.04]"
            >
              Send Message
            </button>
            {submitted && (
              <motion.span
                className="text-xs text-emerald-300"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
              >
                Message captured locally (wire backend when ready).
              </motion.span>
            )}
          </div>
        </motion.form>
      </div>
    </section>
  );
};

export default ContactSection;
