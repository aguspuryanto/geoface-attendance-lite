import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UserCheck, 
  CalendarDays, 
  Wallet 
} from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { AttendancePage } from './pages/AttendancePage';
import { LeavePage } from './pages/LeavePage';
import { PayrollPage } from './pages/PayrollPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { User } from './types';

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="flex min-h-screen bg-zinc-50 pb-20 lg:pb-0">
        <Sidebar user={user} onLogout={handleLogout} />
        
        {/* Mobile Bottom Nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 px-6 py-3 flex justify-between items-center z-40">
          <Link to="/" className="flex flex-col items-center gap-1 text-zinc-400 focus:text-emerald-500">
            <LayoutDashboard className="w-6 h-6" />
            <span className="text-[10px] font-medium">Home</span>
          </Link>
          <Link to="/attendance" className="flex flex-col items-center gap-1 text-zinc-400 focus:text-emerald-500">
            <UserCheck className="w-6 h-6" />
            <span className="text-[10px] font-medium">Absen</span>
          </Link>
          <Link to="/leave" className="flex flex-col items-center gap-1 text-zinc-400 focus:text-emerald-500">
            <CalendarDays className="w-6 h-6" />
            <span className="text-[10px] font-medium">Cuti</span>
          </Link>
          <Link to="/payroll" className="flex flex-col items-center gap-1 text-zinc-400 focus:text-emerald-500">
            <Wallet className="w-6 h-6" />
            <span className="text-[10px] font-medium">Gaji</span>
          </Link>
        </nav>

        <main className="flex-1 lg:ml-64 min-h-screen">
          <div className="p-4 lg:p-8">
            <Routes>
              <Route path="/" element={<DashboardPage user={user} />} />
              <Route path="/attendance" element={<AttendancePage user={user} />} />
              <Route path="/leave" element={<LeavePage user={user} />} />
              <Route path="/payroll" element={<PayrollPage user={user} />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/settings" element={user.role === 'admin' ? <SettingsPage /> : <Navigate to="/" />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}
