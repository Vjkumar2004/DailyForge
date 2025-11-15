import React, { useState } from 'react';
import { Hash, Grid2X2, Globe, Lock, PlusCircle, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar.jsx';
import InputField from '../components/InputField.jsx';
import SelectField from '../components/SelectField.jsx';
import PrivacyCard from '../components/PrivacyCard.jsx';
import PrimaryButton from '../components/PrimaryButton.jsx';

const categories = [
  'UPSC Study',
  'DSA Practice',
  '5AM Yoga',
  'Coding',
  'Deep Work',
  'General Study',
  'Custom',
];

const CreateRoom = () => {
  const [roomName, setRoomName] = useState('');
  const [category, setCategory] = useState('');
  const [privacy, setPrivacy] = useState('public');
  const [description, setDescription] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-950 text-slate-50">
      <Navbar />
      <div className="mx-auto flex max-w-3xl flex-col items-center px-4 pb-12 pt-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full rounded-3xl border border-white/10 bg-slate-950/85 p-8 shadow-2xl shadow-slate-950/80 backdrop-blur-2xl"
        >
          <div className="mb-6 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-100/90">
              CREATE ROOM
            </p>
            <h1 className="text-2xl font-semibold text-white">
              Set up a new focus room.
            </h1>
            <p className="text-xs text-slate-100/85">
              Name your room, choose a category, and decide who can join. You can always tweak these later.
            </p>
          </div>

          <form className="space-y-5">
            <InputField
              label="Room Name"
              placeholder="Enter room name"
              icon={Hash}
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />

            <SelectField
              label="Category"
              options={categories}
              icon={Grid2X2}
              value={category}
              onChange={setCategory}
            />

            <div className="space-y-2">
              <p className="text-xs font-medium tracking-wide text-slate-100/90">Privacy Type</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <PrivacyCard
                  title="Public Room"
                  description="Anyone can join. Room can appear on the home feed."
                  icon={Globe}
                  selected={privacy === 'public'}
                  onClick={() => setPrivacy('public')}
                />
                <PrivacyCard
                  title="Private Room"
                  description="Join using a code or invite link only. Hidden from explore."
                  icon={Lock}
                  selected={privacy === 'private'}
                  onClick={() => setPrivacy('private')}
                />
              </div>
            </div>

            <div className="space-y-1.5 text-sm">
              <label className="flex items-center gap-1 text-xs font-medium tracking-wide text-slate-100/90">
                <FileText className="h-3.5 w-3.5" />
                Room Title / Description
              </label>
              <motion.textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Write a short description for your room…"
                className="min-h-[96px] w-full resize-y rounded-2xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/60 outline-none shadow-inner shadow-white/5 focus:border-cyan-300/80 focus:ring-2 focus:ring-cyan-300/70"
                whileFocus={{ scale: 1.01 }}
              />
            </div>

            <div className="pt-3">
              <PrimaryButton
                type="button"
                text="Create Room"
                icon={PlusCircle}
                onClick={() => {}}
              />
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateRoom;
