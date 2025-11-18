import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import Navbar from '../components/Navbar.jsx';
import { auth } from '../firebase.js';

const baseCategories = ['All', 'Study', 'Work', 'Coding', 'Reading', 'Fitness'];

const BrowseRooms = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/rooms/browse');
        if (!response.ok) return;

        const data = await response.json();
        if (Array.isArray(data.rooms)) {
          setRooms(data.rooms);
        }
      } catch (error) {
        // optional: handle error
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const filteredRooms = rooms.filter((room) => {
    const roomCategory = room.category || 'Others';
    const roomTitle = room.name || room.title || '';
    const matchesCategory = category === 'All' || room.category === category;
    const matchesSearch = roomTitle.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-950 text-slate-50">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pb-12 pt-8">
        {/* Header */}
        <section className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h1 className="bg-gradient-to-r from-indigo-200 via-sky-200 to-cyan-200 bg-clip-text text-3xl font-semibold text-transparent">
              Browse Focus Rooms
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Find active and trending rooms to stay productive, study in public, or ship your next project.
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="hidden rounded-3xl border border-cyan-500/40 bg-gradient-to-br from-sky-500/20 via-indigo-600/20 to-cyan-400/30 px-4 py-3 text-xs text-slate-50 shadow-lg shadow-slate-950/70 backdrop-blur-xl md:block"
          >
            <p className="font-medium">Stay in the room, stay in motion.</p>
            <p className="mt-1 text-[11px] text-slate-100/80">
              Rooms with more than 5 active users see 2x higher task completion.
            </p>
          </motion.div>
        </section>

        {/* Search + Filters */}
        <motion.section
          className="mt-6 rounded-3xl border border-white/10 bg-slate-900/70 p-4 shadow-lg shadow-slate-950/70 backdrop-blur-xl"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
              {/* Search */}
              <div className="relative flex-1">
                <motion.div
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="flex items-center rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-white shadow-inner shadow-slate-950/60 focus-within:border-cyan-400/80 focus-within:ring-2 focus-within:ring-cyan-400/60"
                >
                  <Search className="mr-2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search rooms…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
                  />
                </motion.div>
              </div>

              {/* Category */}
              <div className="w-full md:w-56">
                <label className="mb-1 block text-[11px] font-medium text-slate-300">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-white shadow-inner shadow-slate-950/60 outline-none focus:border-cyan-400/80 focus:ring-2 focus:ring-cyan-400/60"
                >
                  {baseCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Room Grid */}
        <section className="mt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {loading && (
              <>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-36 rounded-3xl border border-white/10 bg-slate-900/70 shadow-lg shadow-slate-950/80"
                  />
                ))}
              </>
            )}

            {!loading && filteredRooms.length === 0 && (
              <p className="col-span-full rounded-3xl border border-dashed border-slate-700/80 bg-slate-950/80 px-4 py-6 text-center text-xs text-slate-400">
                No rooms found. Create a new focus room and it will appear here.
              </p>
            )}

            {!loading &&
              filteredRooms.map((room, index) => (
                <motion.div
                  key={room._id || room.roomId || index}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.05 * index }}
                  whileHover={{ y: -6 }}
                  className="flex flex-col rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950/80 via-slate-900/80 to-slate-950/90 p-4 shadow-lg shadow-slate-950/80 backdrop-blur-xl"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-300">
                      {room.category || 'Others'}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Users className="h-3.5 w-3.5 text-cyan-300" />
                      0 online
                    </span>
                    <div className="flex -space-x-1">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-tr from-sky-500 to-cyan-400 text-[9px] font-semibold text-slate-950 ring-2 ring-slate-950"
                        >
                          +
                        </div>
                      ))}
                    </div>
                  </div>

                  <h2 className="mt-3 text-sm font-semibold text-slate-50">{room.name || room.title}</h2>
                  <p className="mt-1 text-xs text-slate-400">
                    {room.title || 'Live focus room for deep work.'}
                  </p>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                    <span>
                      Created by <span className="text-slate-100">Room Admin</span>
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-2">
                    <button
                      className="rounded-full border border-slate-600/60 bg-slate-900/80 px-3 py-1.5 text-[11px] font-medium text-slate-100 transition-transform hover:scale-[1.02] hover:border-cyan-400/70"
                      onClick={() => setSelectedRoom(room)}
                    >
                      View Details
                    </button>
                    <button
                      className="rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 px-3 py-1.5 text-[11px] font-semibold text-slate-950 shadow-md shadow-cyan-500/40 transition-transform hover:scale-[1.04]"
                      onClick={() => {
                        if (!currentUser) {
                          navigate('/login');
                          return;
                        }

                        const id = room.roomId || room._id;
                        if (id) {
                          navigate(`/dashboard/${id}`);
                        }
                      }}
                    >
                      Join Room
                    </button>
                  </div>
                </motion.div>
              ))}
          </div>

          {/* Load more */}
          <div className="mt-8 flex justify-center">
            <button className="rounded-full border border-white/10 bg-slate-900/80 px-4 py-2 text-xs font-medium text-slate-100 shadow-md shadow-slate-950/70 transition-transform hover:scale-[1.03] hover:border-cyan-400/70">
              Load more rooms
            </button>
          </div>
        </section>

        {selectedRoom && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-950/95 p-5 text-xs text-slate-100 shadow-2xl shadow-black/70">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Room Details
                  </p>
                  <h2 className="mt-1 text-sm font-semibold text-slate-50">
                    {selectedRoom.name || selectedRoom.title}
                  </h2>
                  <p className="mt-1 text-[11px] text-slate-400">
                    {selectedRoom.title || 'Live focus room for deep work.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedRoom(null)}
                  className="rounded-full border border-slate-600/70 bg-slate-900/80 px-2 py-1 text-[11px] text-slate-200 hover:border-cyan-400/70"
                >
                  Close
                </button>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                <div className="rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2">
                  <p className="text-[10px] text-slate-400">Category</p>
                  <p className="mt-0.5 text-xs font-medium text-sky-200">
                    {selectedRoom.category || 'Others'}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2">
                  <p className="text-[10px] text-slate-400">Visibility</p>
                  <p className="mt-0.5 text-xs font-medium text-emerald-200">
                    {selectedRoom.privacy === 'private' ? 'Private' : 'Public'}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2">
                  <p className="text-[10px] text-slate-400">Task points</p>
                  <p className="mt-0.5 text-xs font-medium text-cyan-200">
                    {typeof selectedRoom.taskPoints === 'number'
                      ? `${selectedRoom.taskPoints} pts`
                      : 'Not set'}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2">
                  <p className="text-[10px] text-slate-400">Daily bonus</p>
                  <p className="mt-0.5 text-xs font-medium text-amber-200">
                    {typeof selectedRoom.dailyBonusPoints === 'number'
                      ? `${selectedRoom.dailyBonusPoints} pts`
                      : 'Not set'}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 col-span-2">
                  <p className="text-[10px] text-slate-400">Streak multiplier</p>
                  <p className="mt-0.5 text-xs font-medium text-violet-200">
                    {typeof selectedRoom.streakMultiplier === 'number'
                      ? `${selectedRoom.streakMultiplier}x`
                      : 'Not set'}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 col-span-2">
                  <p className="text-[10px] text-slate-400">Created at</p>
                  <p className="mt-0.5 text-[11px]">
                    {selectedRoom.createdAt
                      ? new Date(selectedRoom.createdAt).toLocaleString()
                      : 'Not available'}
                  </p>
                </div>
              </div>

              <div className="mt-3 rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-[11px] text-slate-300">
                <p className="text-[10px] text-slate-400">About this room</p>
                <p className="mt-1">
                  {selectedRoom.description ||
                    'Admins can use this space to describe focus rules, timing, and what members should bring.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default BrowseRooms;
