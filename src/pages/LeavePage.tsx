import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Calendar, 
  Plus, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle 
} from 'lucide-react';
import { User, LeaveRequest } from '../types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface LeavePageProps {
  user: User;
}

export const LeavePage: React.FC<LeavePageProps> = ({ user }) => {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newRequest, setNewRequest] = useState({
    type: 'cuti',
    start_date: '',
    end_date: '',
    reason: ''
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const res = await fetch(`/api/leave/${user.id}`);
    const data = await res.json();
    setRequests(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/leave', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newRequest, user_id: user.id }),
    });
    if (res.ok) {
      setShowModal(false);
      fetchRequests();
      setNewRequest({ type: 'cuti', start_date: '', end_date: '', reason: '' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Pengajuan Cuti</h1>
          <p className="text-zinc-500">Kelola izin, sakit, dan cuti tahunan</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all shadow-xl"
        >
          <Plus className="w-5 h-5" />
          Buat Pengajuan
        </button>
      </header>

      <div className="space-y-4">
        {requests.length === 0 && !loading ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-zinc-200">
            <Calendar className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
            <p className="text-zinc-500 font-medium">Belum ada riwayat pengajuan</p>
          </div>
        ) : (
          requests.map((req) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={req.id}
              className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${
                  req.type === 'cuti' ? 'bg-blue-50 text-blue-600' : 
                  req.type === 'sakit' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 capitalize">{req.type}</h3>
                  <p className="text-sm text-zinc-500">
                    {format(new Date(req.start_date), 'd MMM')} - {format(new Date(req.end_date), 'd MMM yyyy')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium text-zinc-900">Alasan</p>
                  <p className="text-xs text-zinc-500 truncate max-w-[200px]">{req.reason}</p>
                </div>
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  req.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                  req.status === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-zinc-100 text-zinc-600'
                }`}>
                  {req.status}
                </span>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
          >
            <h2 className="text-xl font-bold mb-6">Form Pengajuan</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Jenis Pengajuan</label>
                <select
                  value={newRequest.type}
                  onChange={(e) => setNewRequest({ ...newRequest, type: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="cuti">Cuti Tahunan</option>
                  <option value="sakit">Sakit</option>
                  <option value="izin">Izin Keperluan</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Mulai</label>
                  <input
                    required
                    type="date"
                    value={newRequest.start_date}
                    onChange={(e) => setNewRequest({ ...newRequest, start_date: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Selesai</label>
                  <input
                    required
                    type="date"
                    value={newRequest.end_date}
                    onChange={(e) => setNewRequest({ ...newRequest, end_date: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Alasan</label>
                <textarea
                  required
                  rows={3}
                  value={newRequest.reason}
                  onChange={(e) => setNewRequest({ ...newRequest, reason: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  placeholder="Jelaskan alasan pengajuan..."
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 bg-zinc-100 text-zinc-600 rounded-xl font-bold hover:bg-zinc-200 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-all shadow-lg"
                >
                  Kirim Pengajuan
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
