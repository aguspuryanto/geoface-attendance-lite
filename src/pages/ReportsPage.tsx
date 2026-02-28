import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  FileText, 
  Download, 
  TrendingUp, 
  Users as UsersIcon,
  Calendar,
  Search
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    const res = await fetch('/api/reports/summary');
    const data = await res.json();
    setReports(data);
    setLoading(false);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('Laporan Absensi Pegawai', 14, 15);
    (doc as any).autoTable({
      head: [['Nama Pegawai', 'Departemen', 'Hadir', 'Terlambat']],
      body: reports.map(r => [r.full_name, r.department, r.days_present, r.days_late]),
      startY: 20,
    });
    doc.save('laporan-absensi.pdf');
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(reports);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan");
    XLSX.writeFile(wb, "laporan-absensi.xlsx");
  };

  const filteredReports = reports.filter(r => 
    r.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const chartData = reports.slice(0, 5).map(r => ({
    name: r.full_name,
    present: r.days_present,
    late: r.days_late
  }));

  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Laporan & Analitik</h1>
          <p className="text-zinc-500">Rekapitulasi kehadiran pegawai</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-semibold hover:bg-emerald-100 transition-all"
          >
            <Download className="w-4 h-4" />
            Excel
          </button>
          <button
            onClick={exportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-xl font-semibold hover:bg-zinc-800 transition-all shadow-lg"
          >
            <FileText className="w-4 h-4" />
            PDF
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-zinc-200">
          <h2 className="font-bold text-zinc-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            Statistik Kehadiran (Top 5)
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: '#f8f8f8' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="present" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
                <Bar dataKey="late" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-emerald-500 text-white p-6 rounded-3xl shadow-xl shadow-emerald-500/20">
            <div className="flex items-center gap-3 mb-4">
              <UsersIcon className="w-6 h-6" />
              <span className="font-medium">Total Pegawai</span>
            </div>
            <p className="text-4xl font-bold">{reports.length}</p>
          </div>
          <div className="bg-zinc-900 text-white p-6 rounded-3xl shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-6 h-6" />
              <span className="font-medium">Periode Laporan</span>
            </div>
            <p className="text-xl font-bold">Februari 2024</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-zinc-200 overflow-hidden">
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
          <h2 className="font-bold text-zinc-900">Tabel Rekapitulasi</h2>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Cari pegawai..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left bg-zinc-50/50">
                <th className="px-6 py-4 font-semibold text-zinc-500 text-sm">Nama Pegawai</th>
                <th className="px-6 py-4 font-semibold text-zinc-500 text-sm">Departemen</th>
                <th className="px-6 py-4 font-semibold text-zinc-500 text-sm">Hadir</th>
                <th className="px-6 py-4 font-semibold text-zinc-500 text-sm">Terlambat</th>
                <th className="px-6 py-4 font-semibold text-zinc-500 text-sm">Persentase</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {filteredReports.map((r, i) => (
                <tr key={i} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-zinc-900">{r.full_name}</td>
                  <td className="px-6 py-4 text-zinc-600 text-sm">{r.department || '-'}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md text-xs font-bold">
                      {r.days_present} Hari
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-rose-100 text-rose-700 rounded-md text-xs font-bold">
                      {r.days_late} Hari
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full" 
                        style={{ width: `${Math.min((r.days_present / 22) * 100, 100)}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
