import React from 'react';
import Navbar from '../components/Navbar.jsx';
import { useParams } from 'react-router-dom';

const Dashboard = () => {
  const { roomId } = useParams();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-950 text-slate-50">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pb-10 pt-6">
        <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-5 shadow-xl shadow-slate-950/80">
          <h1 className="text-lg font-semibold text-slate-50">Room Dashboard</h1>
          <p className="mt-1 text-xs text-slate-400">
            Placeholder dashboard for room <span className="font-mono text-cyan-300">{roomId}</span>.
            You can extend this with room summary, task progress, recent tasks, quick actions, and members overview.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
