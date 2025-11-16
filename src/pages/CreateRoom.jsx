import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Hash,
  Globe,
  Lock,
  Grid2X2,
  Settings,
  Users,
  Activity,
  Coins,
  ChevronDown,
  CheckCircle2,
  Sparkles,
  FileText,
} from 'lucide-react';
import Navbar from '../components/Navbar.jsx';

const categories = [
  'Productivity',
  'Coding',
  'Business',
  'Study',
  'Fitness',
  'Trading',
  'Creative',
  'Exam Prep',
  'Others',
];

const SidebarItem = ({ label, icon: Icon, active }) => (
  <button
    type="button"
    className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-medium transition-colors $${
      active
        ? 'bg-slate-900/80 text-slate-50 shadow-lg shadow-slate-900/70 border border-cyan-400/40'
        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
    }`}
  >
    <span className="flex h-6 w-6 items-center justify-center rounded-xl bg-slate-900/70 text-[11px] text-cyan-300">
      <Icon className="h-3.5 w-3.5" />
    </span>
    <span>{label}</span>
  </button>
);

const FeatureCheckbox = ({ label, description, checked, onChange }) => (
  <label className="flex cursor-pointer items-start gap-2 rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-xs text-slate-100 shadow-inner shadow-slate-950/70 transition hover:border-cyan-400/60">
    <input
      type="checkbox"
      className="mt-[3px] h-3 w-3 rounded border-slate-600 bg-slate-900 text-cyan-400 focus:ring-cyan-400"
      checked={checked}
      onChange={onChange}
    />
    <span className="flex flex-col">
      <span className="font-medium">{label}</span>
      {checked && description && (
        <span className="mt-0.5 text-[11px] text-slate-400">{description}</span>
      )}
    </span>
  </label>
);

const SliderField = ({ label, min, max, step, value, onChange, suffix }) => (
  <div className="space-y-1 text-xs">
    <div className="flex items-center justify-between">
      <span className="font-medium text-slate-100">{label}</span>
      <span className="text-cyan-300 font-semibold">
        {value}
        {suffix}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full accent-cyan-400"
    />
  </div>
);

const ToggleSwitch = ({ label, checked, onChange }) => (
  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 text-xs text-slate-100 shadow-inner shadow-slate-950/70">
    <span>{label}</span>
    <button
      type="button"
      onClick={onChange}
      className={`flex h-5 w-9 items-center rounded-full border transition $${
        checked ? 'border-cyan-400 bg-cyan-500/80 justify-end' : 'border-slate-600 bg-slate-800/80 justify-start'
      }`}
    >
      <span className="h-4 w-4 rounded-full bg-slate-950 shadow" />
    </button>
  </div>
);

const AccordionSection = ({ title, tooltip, children, open, onToggle }) => (
  <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-3 text-xs text-slate-100 shadow-inner shadow-slate-950/70">
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between gap-2"
    >
      <div className="flex flex-col items-start">
        <span className="font-medium">{title}</span>
        {tooltip && <span className="mt-0.5 text-[11px] text-slate-400">{tooltip}</span>}
      </div>
      <motion.span animate={{ rotate: open ? 180 : 0 }} className="text-slate-400">
        <ChevronDown className="h-3.5 w-3.5" />
      </motion.span>
    </button>
    {open && <div className="mt-3 space-y-2">{children}</div>}
  </div>
);

const CreateRoom = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [category, setCategory] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [privacy, setPrivacy] = useState('public');
  const [emailVerified] = useState(false); // mock flag
  const [description, setDescription] = useState('');
  const [roomSection, setRoomSection] = useState('Home Page');

  const [features, setFeatures] = useState({
    linkTasks: true,
    videoTasks: false,
    readingTasks: false,
    pomodoro: true,
    mcq: false,
  });

  const [verificationMethod, setVerificationMethod] = useState('time');

  const [taskPoints, setTaskPoints] = useState(15);
  const [dailyBonus, setDailyBonus] = useState(60);
  const [streakMultiplier, setStreakMultiplier] = useState(2);

  const [allowCoAdmins, setAllowCoAdmins] = useState(false);
  const [coAdminInput, setCoAdminInput] = useState('');
  const [allowSuggestTasks, setAllowSuggestTasks] = useState(true);
  const [allowVoteTasks, setAllowVoteTasks] = useState(true);

  const [advancedSectionOpen, setAdvancedSectionOpen] = useState({
    placement: false,
    monetization: false,
  });

  const [monetization, setMonetization] = useState({
    premiumTasks: false,
    adminFee: false,
    sponsorTasks: false,
    feeAmount: 49,
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [limitError, setLimitError] = useState(false);

  const maxNameLength = 40;
  const maxDescriptionLength = 400;

  const filteredCategories = categories.filter((cat) =>
    cat.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const isPrivateDisabled = !emailVerified;
  const isFormValid = roomName.trim().length > 0 && category.trim().length > 0;

  const handleCreateRoom = async () => {
    if (!isFormValid) return;

    const token = localStorage.getItem('authToken');
    if (!token) {
      // User must be logged in (and synced with backend) to create rooms in MongoDB
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/rooms/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: roomName,
          category,
          privacy,
          title: description || roomName,
          taskLinks: [],
          taskPoints,
          dailyBonusPoints: dailyBonus,
          streakMultiplier,
        }),
      });

      if (!response.ok) {
        if (response.status === 400) {
          const data = await response.json().catch(() => null);
          if (data && typeof data.message === 'string' && data.message.includes('2 rooms')) {
            setLimitError(true);
          }
        }
        return;
      }

      setShowSuccess(true);
    } catch (error) {
      // optional: handle create room error
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f17] via-[#101321] to-[#181f34] text-slate-50">
      <Navbar />
      <main className="mx-auto flex max-w-6xl gap-4 px-4 pb-10 pt-6">
        {/* Sidebar */}
        <aside
          className={`relative mt-2 flex flex-col gap-3 rounded-3xl border border-white/10 bg-slate-950/70 p-3 shadow-xl shadow-slate-950/80 backdrop-blur-xl transition-all $${
            sidebarCollapsed ? 'w-14' : 'w-48'
          }`}
        >
          <button
            type="button"
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            className="absolute -right-3 top-4 flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-slate-950/90 text-[10px] text-slate-300 shadow"
          >
            <ChevronDown
              className={`h-3 w-3 transition-transform $${sidebarCollapsed ? '-rotate-90' : 'rotate-90'}`}
            />
          </button>

          {!sidebarCollapsed && (
            <>
              <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Overview
              </p>
              <SidebarItem label="Overview" icon={Activity} active />
              <SidebarItem label="Tasks" icon={Settings} />
              <SidebarItem label="Members" icon={Users} />
              <SidebarItem label="Analytics" icon={Activity} />
              <SidebarItem label="Monetization" icon={Coins} />
              <SidebarItem label="Settings" icon={Settings} />
            </>
          )}
        </aside>

        {/* Main Panel */}
        <section className="mt-2 flex flex-1 flex-col gap-4">
          {/* Header */}
          <div className="flex flex-col justify-between gap-3 rounded-3xl border border-white/10 bg-gradient-to-r from-slate-950/90 via-slate-950/90 to-slate-900/80 px-5 py-4 shadow-xl shadow-slate-950/80 backdrop-blur-xl md:flex-row md:items-center">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-300">
                CREATE ROOM
              </p>
              <h1 className="mt-1 text-xl font-semibold text-slate-50">Set up a new focus room</h1>
              <p className="mt-1 text-[11px] text-slate-400">
                Design how your room behaves – tasks, rewards, privacy, and more. You can always tweak these
                later.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-300">
              <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
              <span>Rooms with clear rules see 2.4× higher completion rates.</span>
            </div>
          </div>

          {/* Two-column layout inside main */}
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1.6fr)]">
            {/* Left column: core details */}
            <div className="space-y-4">
              {/* Room Name */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="rounded-3xl border border-white/10 bg-slate-950/80 p-4 shadow-lg shadow-slate-950/70 backdrop-blur-xl"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Room Name
                </p>
                <div className="mt-2 flex items-center gap-2 rounded-2xl border border-white/15 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 shadow-inner shadow-slate-950/70 focus-within:border-cyan-400/80 focus-within:ring-2 focus-within:ring-cyan-400/60">
                  <Hash className="h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={roomName}
                    onChange={(e) =>
                      setRoomName(e.target.value.slice(0, maxNameLength))
                    }
                    placeholder="Enter room name"
                    className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 outline-none"
                  />
                </div>
                <div className="mt-1 flex justify-between text-[10px] text-slate-500">
                  <span>Give your room a clear, motivating name.</span>
                  <span>
                    {roomName.length}/{maxNameLength}
                  </span>
                </div>
              </motion.div>

              {/* Category Selector */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 }}
                className="space-y-2 rounded-3xl border border-white/10 bg-slate-950/80 p-4 shadow-lg shadow-slate-950/70 backdrop-blur-xl"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Category
                </p>
                <div className="flex flex-col gap-2 text-xs">
                  <div className="flex items-center gap-2 rounded-2xl border border-white/15 bg-slate-950/90 px-3 py-2">
                    <Grid2X2 className="h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      placeholder="Search categories…"
                      className="w-full bg-transparent text-xs text-slate-100 placeholder:text-slate-500 outline-none"
                    />
                    <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
                  </div>
                  <div className="max-h-32 space-y-1 overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/90 p-2 text-xs">
                    {filteredCategories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`flex w-full items-center justify-between rounded-xl px-2 py-1 text-left transition $${
                          category === cat
                            ? 'bg-cyan-500/15 text-cyan-200 border border-cyan-400/60'
                            : 'text-slate-200 hover:bg-slate-900/70'
                        }`}
                      >
                        <span>{cat}</span>
                        {category === cat && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-cyan-300" />
                        )}
                      </button>
                    ))}
                    {filteredCategories.length === 0 && (
                      <p className="px-1 py-1 text-[11px] text-slate-500">
                        No category found. Try a different keyword.
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Privacy Type */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="space-y-2 rounded-3xl border border-white/10 bg-slate-950/80 p-4 shadow-lg shadow-slate-950/70 backdrop-blur-xl"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Privacy Type
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <motion.button
                    type="button"
                    onClick={() => setPrivacy('public')}
                    animate={privacy === 'public' ? { y: -2, scale: 1.01 } : { y: 0, scale: 1 }}
                    className={`flex flex-col items-start gap-1 rounded-2xl border px-3 py-3 text-left text-xs transition $${
                      privacy === 'public'
                        ? 'border-cyan-400/70 bg-cyan-500/15 shadow-md shadow-cyan-500/40'
                        : 'border-white/10 bg-slate-950/80 hover:border-cyan-400/50'
                    }`}
                  >
                    <span className="flex items-center gap-2 text-slate-100">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-300">
                        <Globe className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-xs font-semibold">Public Room</span>
                    </span>
                    <span className="mt-1 text-[11px] text-slate-400">
                      Anyone can join. Room appears in Browse Rooms.
                    </span>
                  </motion.button>

                  <motion.button
                    type="button"
                    onClick={() => {
                      if (!isPrivateDisabled) setPrivacy('private');
                    }}
                    animate={privacy === 'private' ? { y: -2, scale: 1.01 } : { y: 0, scale: 1 }}
                    className={`flex flex-col items-start gap-1 rounded-2xl border px-3 py-3 text-left text-xs transition $${
                      privacy === 'private'
                        ? 'border-violet-400/70 bg-violet-500/15 shadow-md shadow-violet-500/40'
                        : 'border-white/10 bg-slate-950/80 hover:border-violet-400/50'
                    } ${isPrivateDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span className="flex items-center gap-2 text-slate-100">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-500/20 text-violet-300">
                        <Lock className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-xs font-semibold">Private Room</span>
                    </span>
                    <span className="mt-1 text-[11px] text-slate-400">
                      Join using invite link only. Hidden from explore.
                    </span>
                    {isPrivateDisabled && (
                      <span className="mt-1 text-[10px] text-amber-300">
                        Verify your email to enable private rooms (mock state).
                      </span>
                    )}
                  </motion.button>
                </div>
              </motion.div>

              {/* Room Description */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="rounded-3xl border border-white/10 bg-slate-950/80 p-4 shadow-lg shadow-slate-950/70 backdrop-blur-xl"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Room Description
                </p>
                <div className="mt-2 flex items-start gap-2 rounded-2xl border border-white/15 bg-slate-950/90 px-3 py-2 text-xs text-slate-100 shadow-inner shadow-slate-950/70 focus-within:border-cyan-400/80 focus-within:ring-2 focus-within:ring-cyan-400/60">
                  <FileText className="mt-1 h-3.5 w-3.5 text-slate-500" />
                  <textarea
                    value={description}
                    onChange={(e) =>
                      setDescription(e.target.value.slice(0, maxDescriptionLength))
                    }
                    rows={4}
                    placeholder="Write a short description for your room…"
                    className="min-h-[96px] w-full resize-y bg-transparent text-xs text-slate-100 placeholder:text-slate-500 outline-none"
                  />
                </div>
                <div className="mt-1 flex justify-between text-[10px] text-slate-500">
                  <span>Share what this room is about and who it is for.</span>
                  <span>
                    {description.length}/{maxDescriptionLength}
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Right column: features / rewards / admin / advanced */}
            <div className="space-y-4">
              {/* Room Features & Task Options */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 }}
                className="space-y-3 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950/90 via-slate-950/90 to-slate-900/80 p-4 shadow-lg shadow-slate-950/80 backdrop-blur-xl"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Room Features & Task Options
                    </p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      Decide what kind of tasks and verification your room will support.
                    </p>
                  </div>
                  <Settings className="h-4 w-4 text-cyan-300" />
                </div>

                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <FeatureCheckbox
                    label="Link Tasks"
                    description="Track focus sessions on YouTube, websites, and blogs."
                    checked={features.linkTasks}
                    onChange={() =>
                      setFeatures((prev) => ({ ...prev, linkTasks: !prev.linkTasks }))
                    }
                  />
                  <FeatureCheckbox
                    label="Video Tasks"
                    description="Track watch time on lectures and tutorials."
                    checked={features.videoTasks}
                    onChange={() =>
                      setFeatures((prev) => ({ ...prev, videoTasks: !prev.videoTasks }))
                    }
                  />
                  <FeatureCheckbox
                    label="Reading Tasks"
                    description="Use PDFs or long-form text as tasks."
                    checked={features.readingTasks}
                    onChange={() =>
                      setFeatures((prev) => ({ ...prev, readingTasks: !prev.readingTasks }))
                    }
                  />
                  <FeatureCheckbox
                    label="Pomodoro Sessions"
                    description="Time-boxed sessions with breaks to keep pace."
                    checked={features.pomodoro}
                    onChange={() =>
                      setFeatures((prev) => ({ ...prev, pomodoro: !prev.pomodoro }))
                    }
                  />
                  <FeatureCheckbox
                    label="MCQ / Quiz Tasks"
                    description="Enable short quizzes so users must confirm they learned the material."
                    checked={features.mcq}
                    onChange={() =>
                      setFeatures((prev) => ({ ...prev, mcq: !prev.mcq }))
                    }
                  />
                </div>

                {/* Task Verification Method */}
                <div className="mt-3 space-y-1 text-xs">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Task Verification Method
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {[
                      { key: 'time', label: 'Time-based verification' },
                      { key: 'quiz', label: 'Quiz verification' },
                      { key: 'both', label: 'Both time + quiz' },
                      { key: 'none', label: 'None' },
                    ].map((option) => (
                      <label
                        key={option.key}
                        className={`flex cursor-pointer items-center gap-2 rounded-2xl border px-2 py-1.5 transition $${
                          verificationMethod === option.key
                            ? 'border-cyan-400/70 bg-cyan-500/15 text-cyan-100'
                            : 'border-white/10 bg-slate-950/80 text-slate-200 hover:border-cyan-400/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="verificationMethod"
                          className="h-3 w-3 accent-cyan-400"
                          checked={verificationMethod === option.key}
                          onChange={() => setVerificationMethod(option.key)}
                        />
                        <span className="text-[11px]">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* User Reward System */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="space-y-3 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950/90 via-slate-900/90 to-slate-950/90 p-4 shadow-lg shadow-slate-950/80 backdrop-blur-xl"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                      User Reward System
                    </p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      Tune how generous your room is with points and streaks.
                    </p>
                  </div>
                  <Coins className="h-4 w-4 text-amber-300" />
                </div>

                <div className="space-y-3">
                  <SliderField
                    label="Points per completed task"
                    min={5}
                    max={50}
                    step={5}
                    value={taskPoints}
                    onChange={setTaskPoints}
                    suffix=" pts"
                  />
                  <SliderField
                    label="Bonus points for completing daily tasks"
                    min={20}
                    max={200}
                    step={10}
                    value={dailyBonus}
                    onChange={setDailyBonus}
                    suffix=" pts"
                  />
                  <SliderField
                    label="Streak reward multiplier"
                    min={1}
                    max={5}
                    step={1}
                    value={streakMultiplier}
                    onChange={setStreakMultiplier}
                    suffix="x"
                  />
                </div>
              </motion.div>

              {/* Role & Access Settings */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="space-y-3 rounded-3xl border border-white/10 bg-slate-950/80 p-4 shadow-lg shadow-slate-950/80 backdrop-blur-xl"
              >
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Room Admin Settings
                  </p>
                  <Users className="h-4 w-4 text-cyan-300" />
                </div>

                <div className="space-y-2 text-xs">
                  <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 shadow-inner shadow-slate-950/70">
                    <span>Allow Co-Admins</span>
                    <input
                      type="checkbox"
                      checked={allowCoAdmins}
                      onChange={() => setAllowCoAdmins((prev) => !prev)}
                      className="h-3 w-3 rounded border-slate-600 bg-slate-900 text-cyan-400 focus:ring-cyan-400"
                    />
                  </label>

                  {allowCoAdmins && (
                    <div className="rounded-2xl border border-cyan-400/50 bg-slate-950/80 px-3 py-2 text-xs text-slate-100 shadow-inner shadow-cyan-900/60">
                      <p className="text-[11px] font-medium text-cyan-200">Add co-admin emails/usernames</p>
                      <input
                        type="text"
                        value={coAdminInput}
                        onChange={(e) => setCoAdminInput(e.target.value)}
                        placeholder="example@focus.com, @teammate"
                        className="mt-1 w-full bg-transparent text-xs text-slate-100 placeholder:text-slate-500 outline-none"
                      />
                    </div>
                  )}

                  <ToggleSwitch
                    label="Allow members to suggest tasks"
                    checked={allowSuggestTasks}
                    onChange={() => setAllowSuggestTasks((prev) => !prev)}
                  />
                  <ToggleSwitch
                    label="Allow members to vote on tasks"
                    checked={allowVoteTasks}
                    onChange={() => setAllowVoteTasks((prev) => !prev)}
                  />
                </div>
              </motion.div>

              {/* Advanced Options */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="space-y-3 rounded-3xl border border-white/10 bg-slate-950/80 p-4 shadow-lg shadow-slate-950/80 backdrop-blur-xl"
              >
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Advanced Options
                  </p>
                  <Settings className="h-4 w-4 text-slate-400" />
                </div>

                <div className="space-y-2">
                  <AccordionSection
                    title="Room Section Assignment"
                    tooltip="Decide where your room appears inside Zyntra."
                    open={advancedSectionOpen.placement}
                    onToggle={() =>
                      setAdvancedSectionOpen((prev) => ({
                        ...prev,
                        placement: !prev.placement,
                      }))
                    }
                  >
                    <select
                      value={roomSection}
                      onChange={(e) => setRoomSection(e.target.value)}
                      className="w-full rounded-2xl border border-white/15 bg-slate-950/90 px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-400/80 focus:ring-2 focus:ring-cyan-400/60"
                    >
                      <option>Home Page</option>
                      <option>Top Rooms</option>
                      <option>Trending</option>
                      <option>New Rooms</option>
                      <option>Only Private</option>
                    </select>
                  </AccordionSection>

                  <AccordionSection
                    title="Room Monetization"
                    tooltip="Mock UI only – configure how this room could earn."
                    open={advancedSectionOpen.monetization}
                    onToggle={() =>
                      setAdvancedSectionOpen((prev) => ({
                        ...prev,
                        monetization: !prev.monetization,
                      }))
                    }
                  >
                    <ToggleSwitch
                      label="Enable premium tasks"
                      checked={monetization.premiumTasks}
                      onChange={() =>
                        setMonetization((prev) => ({
                          ...prev,
                          premiumTasks: !prev.premiumTasks,
                        }))
                      }
                    />
                    <ToggleSwitch
                      label="Charge Admin Fee (₹20–₹199)"
                      checked={monetization.adminFee}
                      onChange={() =>
                        setMonetization((prev) => ({
                          ...prev,
                          adminFee: !prev.adminFee,
                        }))
                      }
                    />
                    {monetization.adminFee && (
                      <SliderField
                        label="Admin Fee"
                        min={20}
                        max={199}
                        step={5}
                        value={monetization.feeAmount}
                        onChange={(val) =>
                          setMonetization((prev) => ({ ...prev, feeAmount: val }))
                        }
                        suffix=" ₹"
                      />
                    )}
                    <ToggleSwitch
                      label="Enable sponsor tasks"
                      checked={monetization.sponsorTasks}
                      onChange={() =>
                        setMonetization((prev) => ({
                          ...prev,
                          sponsorTasks: !prev.sponsorTasks,
                        }))
                      }
                    />
                  </AccordionSection>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Create Button & Success State */}
          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="text-[11px] text-slate-400">
              <p>
                Required: Room name and category. Everything else is optional and can be edited later.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <motion.button
                type="button"
                disabled={!isFormValid}
                onClick={handleCreateRoom}
                whileHover={isFormValid ? { y: -1.5, scale: 1.02 } : {}}
                whileTap={isFormValid ? { scale: 0.98 } : {}}
                className={`flex items-center justify-center rounded-full px-6 py-2 text-xs font-semibold shadow-lg shadow-cyan-500/40 transition $${
                  isFormValid
                    ? 'bg-gradient-to-r from-cyan-500 via-indigo-500 to-violet-500 text-slate-950 hover:shadow-cyan-400/60'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
                }`}
              >
                <span>Create Room</span>
              </motion.button>
            </div>
          </div>

          {showSuccess && (
            <div className="mt-4 rounded-3xl border border-cyan-400/50 bg-slate-950/95 p-5 text-xs text-slate-100 shadow-xl shadow-cyan-900/60">
              <div className="flex items-center gap-3">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 text-slate-950 shadow-lg shadow-cyan-500/40">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="pointer-events-none absolute inset-0 rounded-full border border-white/40" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-50">
                    Your room has been created successfully!
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    This is a mock success state. Hook this up to your backend to create real rooms and tasks.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
                <button
                  type="button"
                  className="rounded-full border border-cyan-400/70 bg-cyan-500/15 px-4 py-1 text-cyan-100 hover:bg-cyan-500/25"
                >
                  Go to dashboard
                </button>
                <button
                  type="button"
                  className="rounded-full border border-white/10 bg-slate-900/80 px-4 py-1 text-slate-100 hover:border-cyan-400/60"
                >
                  Add tasks now
                </button>
              </div>
            </div>
          )}

          {limitError && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4">
              <div className="w-full max-w-sm rounded-2xl border border-amber-400/60 bg-slate-950/95 p-5 text-xs text-slate-100 shadow-2xl shadow-amber-900/60">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-amber-200">Room limit reached</p>
                    <p className="mt-1 text-[11px] text-slate-300">
                      You have already created 2 rooms. To keep things focused, each user can create a maximum of 2
                      rooms.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLimitError(false)}
                    className="rounded-full border border-slate-600/70 bg-slate-900/80 px-2 py-1 text-[11px] text-slate-200 hover:border-amber-300/70"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default CreateRoom;
