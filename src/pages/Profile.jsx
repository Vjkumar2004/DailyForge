import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Star, Award, Compass } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import { useNavigate } from 'react-router-dom';
import { deleteUser, signOut } from 'firebase/auth';
import { auth } from '../firebase.js';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    name: 'User',
    rank: 'Rookie',
    joinedRooms: 0,
    createdRooms: 0,
    creatorBadge: false,
    points: 0,
    streak: 0,
    streakGoal: 30,
    rankProgress: 0,
    bio: '',
  });
  const [createdRooms, setCreatedRooms] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/user/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) return;

        const data = await response.json();
        const rank = data.points >= 500 ? 'Elite' : data.points >= 200 ? 'Pro' : 'Rookie';
        const rankProgress = Math.min(1, data.points / 500);

        setUser({
          name: data.username || 'User',
          rank,
          joinedRooms: data.joinedRoomsCount || 0,
          createdRooms: data.createdRoomsCount || 0,
          creatorBadge: !!data.creatorBadge,
          points: data.points || 0,
          streak: data.streak || 0,
          streakGoal: 30,
          rankProgress,
          bio: data.about || '',
        });
      } catch (error) {
        // optional: handle fetch error
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    const fetchCreatedRooms = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/user/created-rooms', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) return;

        const data = await response.json();
        if (Array.isArray(data.rooms)) {
          setCreatedRooms(data.rooms);
        }
      } catch (error) {
        // optional: handle fetch error
      }
    };

    fetchCreatedRooms();
  }, []);

  const streakPercent = Math.min(100, Math.round((user.streak / user.streakGoal) * 100));
  const rankPercent = Math.min(100, Math.round(user.rankProgress * 100));

  const handleDeleteAccount = async () => {
    const token = localStorage.getItem('authToken');
    try {
      if (token) {
        try {
          await fetch('http://localhost:5000/api/user/delete', {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          // Ignore response status here to ensure Firebase account is still removed
        } catch (error) {
          // optional: handle backend delete error, but continue with Firebase deletion
        }
      }

      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          await deleteUser(currentUser);
        } catch (error) {
          // if deleteUser fails (e.g., requires recent login), still proceed to logout and navigate
        }
      }
    } catch (error) {
      // optional: handle delete error
    } finally {
      setShowConfirm(false);
      try {
        await signOut(auth);
      } catch (error) {
        // ignore signOut errors
      }
      localStorage.removeItem('authToken');
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-950 text-slate-50">
      <Navbar />
      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-10 pt-8">
        {/* Top Profile Bar */}
        <section className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div className="relative inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-sky-500 to-cyan-400 p-[2px] shadow-lg shadow-cyan-500/30">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-950/90 text-xl font-semibold text-slate-50">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold text-slate-50">{user.name}</h1>
                {user.creatorBadge && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/60 bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-200">
                    <Star className="h-3 w-3" />
                    Creator
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">Design your focus. Protect your streaks. Level up daily.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-cyan-400/40 bg-slate-900/70 px-4 py-2 text-xs shadow-lg shadow-cyan-500/30 backdrop-blur-xl">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 shadow-md shadow-amber-500/50">
              <Star className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200">Rank</p>
              <p className="text-xs font-medium text-slate-50">{user.rank}</p>
            </div>
          </div>
        </section>

        {/* Grid Layout */}
        <section className="grid gap-4 md:grid-cols-3">
          {/* Joined Rooms */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="col-span-1 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950/90 via-slate-900/90 to-slate-950/90 p-4 shadow-lg shadow-slate-950/80 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Joined Rooms</p>
              <Compass className="h-4 w-4 text-cyan-300" />
            </div>
            <p className="mt-3 text-3xl font-semibold text-slate-50">{user.joinedRooms}</p>
            <p className="mt-1 text-xs text-slate-500">Rooms you are currently part of.</p>
          </motion.div>

          {/* Earned Points */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="col-span-1 rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-600/20 via-violet-600/10 to-cyan-500/20 p-4 shadow-lg shadow-indigo-900/70 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-100/80">Earned Points</p>
              <Award className="h-4 w-4 text-amber-300" />
            </div>
            <p className="mt-3 text-3xl font-semibold text-slate-50">{user.points}</p>
            <p className="mt-1 text-xs text-slate-100/80">Earn points by completing focus blocks and maintaining streaks.</p>
          </motion.div>

          {/* Daily Streak */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="col-span-1 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950/90 via-slate-900/90 to-slate-950/90 p-4 shadow-lg shadow-slate-950/80 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Daily Streak</p>
              <div className="flex items-center gap-1 text-amber-300">
                <Flame className="h-4 w-4" />
                <span className="text-xs font-medium">{user.streak} days</span>
              </div>
            </div>
            <div className="mt-3 h-2.5 w-full rounded-full bg-slate-800/80">
              <div
                className="h-2.5 rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 shadow-inner shadow-amber-500/60"
                style={{ width: `${streakPercent}%` }}
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              {user.streak} / {user.streakGoal} day streak goal
            </p>
          </motion.div>
        </section>

        {/* Created Rooms */}
        <section className="grid gap-4 md:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="col-span-3 rounded-3xl border border-white/10 bg-slate-950/90 p-5 text-xs text-slate-200 shadow-lg shadow-slate-950/80 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                Created Rooms
              </p>
              <span className="rounded-full bg-slate-900/80 px-2 py-0.5 text-[10px] text-slate-300">
                {user.createdRooms} total
              </span>
            </div>

            {createdRooms.length === 0 && (
              <p className="mt-3 text-[11px] text-slate-400">
                You haven't created any rooms yet. Create a focus room to see it listed here.
              </p>
            )}

            {createdRooms.length > 0 && (
              <div className="mt-3 space-y-2">
                {createdRooms.map((room) => (
                  <div
                    key={room._id || room.roomId}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-50">{room.name || room.title}</p>
                      <p className="text-[11px] text-slate-400">
                        {room.category || 'Others'} •{' '}
                        {room.createdAt
                          ? new Date(room.createdAt).toLocaleDateString()
                          : 'Recently created'}
                      </p>
                    </div>
                    {room.roomId && (
                      <span className="text-[10px] text-slate-500">#{room.roomId}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </section>

        {/* Lower Grid: About + Rank */}
        <section className="grid gap-4 md:grid-cols-3">
          {/* About Me */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="col-span-3 rounded-3xl border border-white/10 bg-slate-950/90 p-5 shadow-lg shadow-slate-950/80 backdrop-blur-xl md:col-span-2"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">About Me</p>
            <p className="mt-3 text-sm leading-relaxed text-slate-200">
              {user.bio}
            </p>
          </motion.div>

          {/* Rank Progress */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="col-span-3 rounded-3xl border border-cyan-400/40 bg-gradient-to-br from-slate-950/90 via-slate-900/90 to-slate-950/90 p-5 shadow-lg shadow-cyan-900/60 backdrop-blur-xl md:col-span-1"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-200">Rank Progress</p>
            <p className="mt-2 text-sm font-medium text-slate-50">Next level in {100 - rankPercent}%</p>
            <div className="mt-3 h-2.5 w-full rounded-full bg-slate-900/80">
              <div
                className="h-2.5 rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500 shadow-inner shadow-cyan-500/60"
                style={{ width: `${rankPercent}%` }}
              />
            </div>
            <p className="mt-1 text-[11px] text-cyan-100/90">Level up by staying consistent in your focus blocks.</p>
          </motion.div>
        </section>

        <section className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            className="rounded-full border border-rose-500/60 bg-rose-500/10 px-4 py-1.5 text-xs font-medium text-rose-200 shadow-sm transition-transform hover:scale-[1.02] hover:border-rose-400/80"
          >
            Delete Account
          </button>
        </section>

        {showConfirm && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4">
            <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-slate-950/95 p-5 shadow-2xl shadow-black/70">
              <p className="text-sm font-semibold text-slate-50">Delete account?</p>
              <p className="mt-1 text-[11px] text-slate-400">
                Are you sure you want to delete this account? This action cannot be undone.
              </p>
              <div className="mt-4 flex justify-end gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  className="rounded-full border border-slate-600/70 bg-slate-900/80 px-3 py-1 text-slate-200 hover:border-slate-400/80"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  className="rounded-full border border-rose-500/60 bg-rose-500/90 px-3 py-1 font-medium text-slate-950 hover:bg-rose-400"
                >
                  Yes, delete
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Profile;
