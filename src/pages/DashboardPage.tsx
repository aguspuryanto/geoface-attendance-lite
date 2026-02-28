import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { User } from '../types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface DashboardPageProps {
  user: User;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ user }) => {
  const [stats, setStats] = useState<any>(null);
  const [recentAttendance, setRecentAttendance] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [statsRes, attendanceRes] = await Promise.all([
      fetch('/api/reports/summary'),
      fetch(`/api/attendance/${user.id}`)
    ]);
    const statsData = await statsRes.json();
    const myStats = statsData.find((r: any) => r.full_name === user.full_name);
    setStats(myStats);
    setRecentAttendance((await attendanceRes.json()).slice(0, 5));
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-zinc-900">Selamat Datang, {user.full_name}!</h1>
        <p className="text-zinc-500 mt-1">Berikut ringkasan aktivitas kerja Anda hari ini.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-200">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl w-fit mb-4">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <p className="text-zinc-500 text-sm font-medium">Total Kehadiran</p>
          <p className="text-3xl font-bold text-zinc-900 mt-1">{stats?.days_present || 0} Hari</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-200">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl w-fit mb-4">
            <Clock className="w-6 h-6" />
          </div>
          <p className="text-zinc-500 text-sm font-medium">Terlambat</p>
          <p className="text-3xl font-bold text-zinc-900 mt-1">{stats?.days_late || 0} Kali</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-200">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl w-fit mb-4">
            <Calendar className="w-6 h-6" />
          </div>
          <p className="text-zinc-500 text-sm font-medium">Sisa Cuti</p>
          <p className="text-3xl font-bold text-zinc-900 mt-1">12 Hari</p>
        </div>

        <div className="bg-zinc-900 text-white p-6 rounded-3xl shadow-xl">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl w-fit mb-4">
            <TrendingUp className="w-6 h-6" />
          </div>
          <p className="text-zinc-400 text-sm font-medium">Efisiensi Kerja</p>
          <p className="text-3xl font-bold mt-1">98%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-zinc-200 overflow-hidden">
          <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
            <h2 className="font-bold text-zinc-900">Riwayat Absensi Terakhir</h2>
            <button className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              Lihat Semua <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {recentAttendance.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center border border-zinc-100">
                      <Calendar className="w-6 h-6 text-zinc-400" />
                    </div>
                    <div>
                      <p className="font-bold text-zinc-900">
                        {format(new Date(item.date), 'EEEE, d MMM', { locale: id })}
                      </p>
                      <p className="text-sm text-zinc-500">Masuk: {item.check_in} • Pulang: {item.check_out || '--:--'}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    item.status === 'present' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
              {recentAttendance.length === 0 && (
                <p className="text-center text-zinc-400 py-10">Belum ada riwayat absensi</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-200">
            <h2 className="font-bold text-zinc-900 mb-4">Pengumuman Internal</h2>
            <div className="space-y-4">
              <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                <p className="text-xs font-bold text-emerald-600 uppercase mb-1">Update Sistem</p>
                <p className="text-sm font-medium text-zinc-900">Fitur Face Recognition telah diperbarui untuk akurasi lebih baik.</p>
              </div>
              <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                <p className="text-xs font-bold text-blue-600 uppercase mb-1">Kebijakan Cuti</p>
                <p className="text-sm font-medium text-zinc-900">Pengajuan cuti lebaran sudah bisa dilakukan mulai hari ini.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
