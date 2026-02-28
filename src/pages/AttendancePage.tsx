import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Navigation,
  Camera
} from 'lucide-react';
import { FaceRecognition } from '../components/FaceRecognition';
import { User, OfficeSettings } from '../types';
import { calculateDistance } from '../lib/utils';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface AttendancePageProps {
  user: User;
}

export const AttendancePage: React.FC<AttendancePageProps> = ({ user }) => {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [settings, setSettings] = useState<OfficeSettings | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [isWithinRadius, setIsWithinRadius] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [todayAttendance, setTodayAttendance] = useState<any>(null);

  useEffect(() => {
    fetchSettings();
    getCurrentLocation();
    fetchTodayAttendance();
  }, []);

  const fetchSettings = async () => {
    const res = await fetch('/api/settings');
    const data = await res.json();
    setSettings(data);
  };

  const fetchTodayAttendance = async () => {
    const res = await fetch(`/api/attendance/${user.id}`);
    const data = await res.json();
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayRecord = data.find((a: any) => a.date === today);
    setTodayAttendance(todayRecord);
  };

  const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ lat: latitude, lng: longitude });
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    if (location && settings) {
      const dist = calculateDistance(
        location.lat,
        location.lng,
        Number(settings.office_lat),
        Number(settings.office_lng)
      );
      setDistance(dist);
      setIsWithinRadius(dist <= Number(settings.office_radius));
    }
  }, [location, settings]);

  const handleCapture = async (photo: string) => {
    if (!isWithinRadius) {
      setMessage({ type: 'error', text: 'Anda berada di luar radius kantor!' });
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch('/api/attendance/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          date: format(new Date(), 'yyyy-MM-dd'),
          time: format(new Date(), 'HH:mm:ss'),
          lat: location?.lat,
          lng: location?.lng,
          photo
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Absensi masuk berhasil!' });
        fetchTodayAttendance();
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Gagal mengirim absensi' });
    } finally {
      setProcessing(false);
    }
  };

  const handleCheckOut = async () => {
    setProcessing(true);
    try {
      const res = await fetch('/api/attendance/check-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          date: format(new Date(), 'yyyy-MM-dd'),
          time: format(new Date(), 'HH:mm:ss'),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Absensi pulang berhasil!' });
        fetchTodayAttendance();
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Gagal mengirim absensi' });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Absensi Harian</h1>
        <p className="text-zinc-500">{format(new Date(), 'EEEE, d MMMM yyyy', { locale: id })}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
          <div className="flex items-center gap-3 text-zinc-500 mb-2">
            <Clock className="w-5 h-5" />
            <span className="text-sm font-medium">Waktu Sekarang</span>
          </div>
          <p className="text-2xl font-bold">{format(new Date(), 'HH:mm')}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
          <div className="flex items-center gap-3 text-zinc-500 mb-2">
            <Navigation className="w-5 h-5" />
            <span className="text-sm font-medium">Jarak ke Kantor</span>
          </div>
          <p className="text-2xl font-bold">
            {distance !== null ? `${Math.round(distance)}m` : 'Detecting...'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
          <div className="flex items-center gap-3 text-zinc-500 mb-2">
            <MapPin className="w-5 h-5" />
            <span className="text-sm font-medium">Status Lokasi</span>
          </div>
          <div className="flex items-center gap-2">
            {isWithinRadius ? (
              <span className="text-emerald-500 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-5 h-5" /> Dalam Radius
              </span>
            ) : (
              <span className="text-red-500 font-bold flex items-center gap-1">
                <AlertCircle className="w-5 h-5" /> Luar Radius
              </span>
            )}
          </div>
        </div>
      </div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl mb-6 flex items-center gap-3 ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-medium">{message.text}</span>
        </motion.div>
      )}

      {!todayAttendance ? (
        <div className="bg-zinc-900 text-white p-8 rounded-3xl shadow-2xl overflow-hidden relative">
          <div className="relative z-10">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Camera className="w-6 h-6 text-emerald-400" />
              Verifikasi Wajah
            </h2>
            <FaceRecognition onCapture={handleCapture} isProcessing={processing} />
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        </div>
      ) : (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-200 text-center">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">Anda Sudah Absen Masuk</h2>
          <p className="text-zinc-500 mb-8">Absen masuk pada jam {todayAttendance.check_in}</p>
          
          {!todayAttendance.check_out ? (
            <button
              onClick={handleCheckOut}
              disabled={processing}
              className="px-10 py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all shadow-xl disabled:opacity-50"
            >
              Absen Pulang Sekarang
            </button>
          ) : (
            <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 inline-block">
              <p className="text-zinc-600 font-medium">Absen pulang pada jam {todayAttendance.check_out}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
