export enum Role {
  STUDENT = 'STUDENT',
  FACULTY = 'FACULTY',
  ADMIN = 'ADMIN'
}

export type UserRole = 'STUDENT' | 'FACULTY' | 'ADMIN';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  phone: string;
  profile_image?: string;
  created_at: string;
  profile?: any;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  created_at: string;
  student_count?: number;
  faculty_count?: number;
  subject_count?: number;
}

export interface StudentProfile {
  id: number;
  user_id: number;
  roll_number: string;
  department_id: number;
  department_name?: string;
  department_code?: string;
  year: number;
  section: string;
  date_of_birth: string;
  address: string;
}

export interface FacultyProfile {
  id: number;
  user_id: number;
  employee_id: string;
  department_id: number;
  department_name?: string;
  department_code?: string;
  designation: string;
}

export interface Subject {
  id: number;
  name: string;
  code: string;
  department_id: number;
  department_name?: string;
  department_code?: string;
  semester: number;
  faculty_id: number;
  faculty_name?: string;
}

export interface AttendanceRecord {
  id: number;
  student_id: number;
  student_name?: string;
  roll_number?: string;
  subject_id: number;
  subject_name?: string;
  subject_code?: string;
  date: string;
  status: 'PRESENT' | 'ABSENT';
  marked_by: number;
  marked_by_name?: string;
  created_at: string;
}

export interface SubjectAttendanceSummary {
  subject_id: number;
  subject_name: string;
  subject_code: string;
  present_classes: number;
  total_classes: number;
  attendance_percentage: number;
  is_warning: boolean;
}

export interface StudentAttendanceSummary {
  student_id: number;
  overall_percentage: number;
  is_warning: boolean;
  total_conducted: number;
  total_attended: number;
  subjects: SubjectAttendanceSummary[];
}

export interface Assignment {
  id: number;
  title: string;
  description: string;
  subject_id: number;
  subject_name?: string;
  subject_code?: string;
  department_name?: string;
  department_id?: number;
  faculty_id: number;
  faculty_name?: string;
  deadline: string;
  created_at: string;
  updated_at: string;
  total_submissions?: number;
  student_submission?: Submission | null;
  is_past_deadline?: boolean;
}

export interface Submission {
  id: number;
  assignment_id: number;
  assignment_title?: string;
  assignment_deadline?: string;
  subject_name?: string;
  student_id: number;
  student_name?: string;
  student_email?: string;
  roll_number?: string;
  submission_file?: string;
  submission_text: string;
  submitted_at: string;
  marks?: number | null;
  feedback?: string;
  status: 'SUBMITTED' | 'GRADED' | 'LATE';
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  created_by: number;
  creator_name?: string;
  department_id?: number | null;
  department_name?: string;
  department_code?: string;
  created_at: string;
  updated_at: string;
}

export interface Complaint {
  id: number;
  student_id: number;
  student_name?: string;
  student_email?: string;
  roll_number?: string;
  department_name?: string;
  category: 'Infrastructure' | 'Transport' | 'Hostel' | 'Library' | 'Internet' | 'Academic' | 'Other';
  subject: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
  admin_response?: string;
  created_at: string;
  updated_at: string;
}
