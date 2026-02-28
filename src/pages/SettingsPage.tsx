import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Settings as SettingsIcon, 
  Map as MapIcon, 
  Save,
  Plus,
  Trash2,
  Clock
} from 'lucide-react';
import { OfficeSettings, User } from '../types';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<OfficeSettings>({
    office_lat: 0,
    office_lng: 0,
    office_radius: 100
  });
  const [shifts, setShifts] = useState<any[]>([]);
  const [showAddShift, setShowAddShift] = useState(false);
  const [newShift, setNewShift] = useState({ name: '', start_time: '', end_time: '' });
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    full_name: '',
    role: 'employee',
    department: '',
    base_salary: 0,
    shift_id: ''
  });

  useEffect(() => {
    fetchData();
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    const res = await fetch('/api/shifts');
    const data = await res.json();
    setShifts(data);
  };

  const handleAddShift = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/shifts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newShift),
    });
    setShowAddShift(false);
    fetchShifts();
    setNewShift({ name: '', start_time: '', end_time: '' });
  };

  const handleDeleteShift = async (id: number) => {
    if (confirm('Hapus shift ini?')) {
      await fetch(`/api/shifts/${id}`, { method: 'DELETE' });
      fetchShifts();
    }
  };

  const fetchData = async () => {
    const [settingsRes, usersRes] = await Promise.all([
      fetch('/api/settings'),
      fetch('/api/users')
    ]);
    setSettings(await settingsRes.json());
    setUsers(await usersRes.json());
    setLoading(false);
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    alert('Pengaturan berhasil disimpan');
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
    });
    if (res.ok) {
      setShowAddUser(false);
      fetchData();
      setNewUser({ username: '', password: '', full_name: '', role: 'employee', department: '', base_salary: 0, shift_id: '' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Pengaturan Sistem</h1>
        <p className="text-zinc-500">Kelola lokasi kantor dan data pegawai</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Office Settings */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                <MapIcon className="w-5 h-5" />
              </div>
              <h2 className="font-bold text-zinc-900">Lokasi Kantor</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-600 mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={settings.office_lat}
                  onChange={(e) => setSettings({ ...settings, office_lat: Number(e.target.value) })}
                  className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-600 mb-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={settings.office_lng}
                  onChange={(e) => setSettings({ ...settings, office_lng: Number(e.target.value) })}
                  className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-600 mb-1">Radius Absensi (Meter)</label>
                <input
                  type="number"
                  value={settings.office_radius}
                  onChange={(e) => setSettings({ ...settings, office_radius: Number(e.target.value) })}
                  className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="w-full py-3 bg-zinc-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all"
              >
                <Save className="w-4 h-4" />
                Simpan Lokasi
              </button>
            </div>
          </div>
        </div>

        {/* User Management */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  <Users className="w-5 h-5" />
                </div>
                <h2 className="font-bold text-zinc-900">Manajemen Pegawai</h2>
              </div>
              <button
                onClick={() => setShowAddUser(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-all"
              >
                <Plus className="w-4 h-4" />
                Tambah Pegawai
              </button>
            </div>

            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="text-left border-b border-zinc-100">
                    <th className="pb-4 font-semibold text-zinc-500 text-sm">Nama Lengkap</th>
                    <th className="pb-4 font-semibold text-zinc-500 text-sm">Username</th>
                    <th className="pb-4 font-semibold text-zinc-500 text-sm">Departemen</th>
                    <th className="pb-4 font-semibold text-zinc-500 text-sm">Role</th>
                    <th className="pb-4 font-semibold text-zinc-500 text-sm">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {users.map((user) => (
                    <tr key={user.id} className="group">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-bold text-zinc-600">
                            {user.full_name[0]}
                          </div>
                          <span className="font-medium text-zinc-900">{user.full_name}</span>
                        </div>
                      </td>
                      <td className="py-4 text-zinc-600 text-sm">{user.username}</td>
                      <td className="py-4 text-zinc-600 text-sm">{user.department || '-'}</td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4">
                        <button className="p-2 text-zinc-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {/* Shift Management */}
        <div className="lg:col-span-3">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                  <Clock className="w-5 h-5" />
                </div>
                <h2 className="font-bold text-zinc-900">Manajemen Shift Kerja</h2>
              </div>
              <button
                onClick={() => setShowAddShift(true)}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-xl font-semibold hover:bg-zinc-800 transition-all"
              >
                <Plus className="w-4 h-4" />
                Tambah Shift
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {shifts.map((shift) => (
                <div key={shift.id} className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-zinc-900">{shift.name}</h3>
                    <p className="text-sm text-zinc-500">{shift.start_time} - {shift.end_time}</p>
                  </div>
                  <button 
                    onClick={() => handleDeleteShift(shift.id)}
                    className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {shifts.length === 0 && (
                <p className="col-span-3 text-center text-zinc-400 py-4">Belum ada data shift</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Shift Modal */}
      {showAddShift && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
          >
            <h2 className="text-xl font-bold mb-6">Tambah Shift Baru</h2>
            <form onSubmit={handleAddShift} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nama Shift</label>
                <input
                  required
                  type="text"
                  value={newShift.name}
                  onChange={(e) => setNewShift({ ...newShift, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Contoh: Shift Pagi"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Jam Mulai</label>
                  <input
                    required
                    type="time"
                    value={newShift.start_time}
                    onChange={(e) => setNewShift({ ...newShift, start_time: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Jam Selesai</label>
                  <input
                    required
                    type="time"
                    value={newShift.end_time}
                    onChange={(e) => setNewShift({ ...newShift, end_time: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddShift(false)}
                  className="flex-1 py-3 bg-zinc-100 text-zinc-600 rounded-xl font-bold hover:bg-zinc-200 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-all shadow-lg"
                >
                  Simpan Shift
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      {showAddUser && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
          >
            <h2 className="text-xl font-bold mb-6">Tambah Pegawai Baru</h2>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
                  <input
                    required
                    type="text"
                    value={newUser.full_name}
                    onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Username</label>
                  <input
                    required
                    type="text"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <input
                    required
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Departemen</label>
                  <input
                    type="text"
                    value={newUser.department}
                    onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Gaji Pokok</label>
                  <input
                    type="number"
                    value={newUser.base_salary}
                    onChange={(e) => setNewUser({ ...newUser, base_salary: Number(e.target.value) })}
                    className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Shift Kerja</label>
                  <select
                    value={newUser.shift_id}
                    onChange={(e) => setNewUser({ ...newUser, shift_id: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Pilih Shift</option>
                    {shifts.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.start_time} - {s.end_time})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddUser(false)}
                  className="flex-1 py-3 bg-zinc-100 text-zinc-600 rounded-xl font-bold hover:bg-zinc-200 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                >
                  Simpan Pegawai
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
