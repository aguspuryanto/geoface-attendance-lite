export interface User {
  id: number;
  username: string;
  full_name: string;
  role: 'admin' | 'employee';
  department?: string;
  base_salary?: number;
}

export interface Attendance {
  id: number;
  user_id: number;
  date: string;
  check_in: string;
  check_out?: string;
  status: string;
  location_lat: number;
  location_lng: number;
  photo_url: string;
}

export interface LeaveRequest {
  id: number;
  user_id: number;
  type: 'cuti' | 'sakit' | 'izin';
  start_date: string;
  end_date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface OfficeSettings {
  office_lat: number;
  office_lng: number;
  office_radius: number;
}
