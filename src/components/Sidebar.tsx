import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  UserCheck, 
  CalendarDays, 
  FileText, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Wallet
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../types';

interface SidebarProps {
  user: User;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: UserCheck, label: 'Absensi', path: '/attendance' },
    { icon: CalendarDays, label: 'Pengajuan Cuti', path: '/leave' },
    { icon: Wallet, label: 'Payroll', path: '/payroll' },
    { icon: FileText, label: 'Laporan', path: '/reports' },
  ];

  if (user.role === 'admin') {
    menuItems.push({ icon: Settings, label: 'Pengaturan', path: '/settings' });
  }

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        <Menu className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={`fixed top-0 left-0 h-full bg-zinc-900 text-white w-64 z-50 transition-transform lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-10">
            <h1 className="text-xl font-bold tracking-tight text-emerald-400">GeoFace AI</h1>
            <button onClick={() => setIsOpen(false)} className="lg:hidden">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center gap-3 mb-10 p-3 bg-zinc-800 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center font-bold">
              {user.full_name[0]}
            </div>
            <div className="overflow-hidden">
              <p className="font-medium truncate">{user.full_name}</p>
              <p className="text-xs text-zinc-400 capitalize">{user.role}</p>
            </div>
          </div>

          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  location.pathname === item.path
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all mt-auto"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Keluar</span>
          </button>
        </div>
      </motion.aside>
    </>
  );
};
