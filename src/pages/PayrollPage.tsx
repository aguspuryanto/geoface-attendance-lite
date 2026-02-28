import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Wallet, 
  TrendingUp, 
  Download, 
  History,
  CreditCard,
  ArrowUpRight,
  FileText
} from 'lucide-react';
import { User } from '../types';

interface PayrollPageProps {
  user: User;
}

export const PayrollPage: React.FC<PayrollPageProps> = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const res = await fetch('/api/reports/summary');
    const data = await res.json();
    const myStats = data.find((r: any) => r.full_name === user.full_name);
    setStats(myStats);
    setLoading(false);
  };

  const baseSalary = user.base_salary || 5000000;
  const daysPresent = stats?.days_present || 0;
  const dailyRate = baseSalary / 22;
  const currentEarnings = dailyRate * daysPresent;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Payroll & Gaji</h1>
        <p className="text-zinc-500">Informasi penghasilan dan slip gaji</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-zinc-900 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="font-medium text-zinc-400">Estimasi Gaji Bulan Ini</span>
            </div>
            <p className="text-4xl font-bold mb-2">
              Rp {currentEarnings.toLocaleString('id-ID')}
            </p>
            <div className="flex items-center gap-2 text-emerald-400 text-sm">
              <ArrowUpRight className="w-4 h-4" />
              <span>Berdasarkan {daysPresent} hari kerja</span>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="font-medium text-zinc-500">Gaji Pokok</span>
          </div>
          <p className="text-3xl font-bold text-zinc-900 mb-2">
            Rp {baseSalary.toLocaleString('id-ID')}
          </p>
          <p className="text-sm text-zinc-400">Periode: Februari 2024</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-zinc-200 overflow-hidden">
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
          <h2 className="font-bold text-zinc-900 flex items-center gap-2">
            <History className="w-5 h-5 text-zinc-400" />
            Riwayat Slip Gaji
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[
              { month: 'Januari 2024', amount: baseSalary, status: 'Dibayar' },
              { month: 'Desember 2023', amount: baseSalary, status: 'Dibayar' },
              { month: 'November 2023', amount: baseSalary, status: 'Dibayar' },
            ].map((slip, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <FileText className="w-5 h-5 text-zinc-400" />
                  </div>
                  <div>
                    <p className="font-bold text-zinc-900">{slip.month}</p>
                    <p className="text-sm text-zinc-500">Rp {slip.amount.toLocaleString('id-ID')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase">
                    {slip.status}
                  </span>
                  <button className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors">
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
