import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import AdminDashboard from './AdminDashboard.jsx';
import UserBoard from './UserBoard.jsx';

const RoomDashboardRouter = () => {
  const { roomId } = useParams();
  const [state, setState] = useState({ loading: true, error: null, isCreator: false, room: null });

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token || !roomId) {
      setState((prev) => ({ ...prev, loading: false, error: 'You must be logged in to view this room.' }));
      return;
    }

    const load = async () => {
      try {
        const profileRes = await fetch('http://localhost:5000/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!profileRes.ok) {
          setState({ loading: false, error: 'Failed to load profile', isCreator: false, room: null });
          return;
        }
        const profile = await profileRes.json();

        const roomRes = await fetch(`http://localhost:5000/api/rooms/${roomId}/details`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!roomRes.ok) {
          setState({ loading: false, error: 'Failed to load room', isCreator: false, room: null });
          return;
        }
        const roomPayload = await roomRes.json();
        const room = roomPayload.room;

        const creatorId = room?.createdBy?._id || room?.createdBy || null;
        const userId = profile?._id || profile?.id || null;
        const isCreator = creatorId && userId && String(creatorId) === String(userId);

        setState({ loading: false, error: null, isCreator, room });
      } catch (error) {
        setState({ loading: false, error: 'Something went wrong loading this room.', isCreator: false, room: null });
      }
    };

    load();
  }, [roomId]);

  if (state.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-950 text-slate-50">
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 pb-10 pt-6 text-xs text-slate-400">Loading dashboard…</main>
      </div>
    );
  }

  if (state.error || !state.room) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-950 text-slate-50">
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 pb-10 pt-6 text-xs text-rose-300">{state.error || 'Room not found.'}</main>
      </div>
    );
  }

  return state.isCreator ? (
    <AdminDashboard room={state.room} />
  ) : (
    <UserBoard room={state.room} />
  );
};

export default RoomDashboardRouter;
