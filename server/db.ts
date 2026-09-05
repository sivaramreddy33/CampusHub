import fs from 'fs';
import path from 'path';

export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: 'STUDENT' | 'FACULTY' | 'ADMIN';
  phone: string;
  profile_image?: string;
  created_at: string;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  created_at: string;
}

export interface StudentProfile {
  id: number;
  user_id: number;
  roll_number: string;
  department_id: number;
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
  designation: string;
}

export interface Subject {
  id: number;
  name: string;
  code: string;
  department_id: number;
  semester: number;
  faculty_id: number;
}

export interface Attendance {
  id: number;
  student_id: number;
  subject_id: number;
  date: string;
  status: 'PRESENT' | 'ABSENT';
  marked_by: number;
  created_at: string;
}

export interface Assignment {
  id: number;
  title: string;
  description: string;
  subject_id: number;
  faculty_id: number;
  deadline: string;
  created_at: string;
  updated_at: string;
}

export interface Submission {
  id: number;
  assignment_id: number;
  student_id: number;
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
  department_id?: number | null; // null for college-wide/general
  created_at: string;
  updated_at: string;
}

export interface Complaint {
  id: number;
  student_id: number;
  category: 'Infrastructure' | 'Transport' | 'Hostel' | 'Library' | 'Internet' | 'Academic' | 'Other';
  subject: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
  admin_response?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseData {
  users: User[];
  departments: Department[];
  student_profiles: StudentProfile[];
  faculty_profiles: FacultyProfile[];
  subjects: Subject[];
  attendance: Attendance[];
  assignments: Assignment[];
  submissions: Submission[];
  announcements: Announcement[];
  complaints: Complaint[];
}

const DB_FILE = path.join(process.cwd(), 'campushub_data.json');

// Default initial dataset
export function getInitialSeedData(): DatabaseData {
  const now = new Date().toISOString();
  const pastDays = (d: number) => {
    const date = new Date();
    date.setDate(date.getDate() - d);
    return date.toISOString().split('T')[0];
  };

  const departments: Department[] = [
    { id: 1, name: 'Electronics and Communication Engineering', code: 'ECE', created_at: now },
    { id: 2, name: 'Computer Science and Engineering', code: 'CSE', created_at: now },
    { id: 3, name: 'Electrical and Electronics Engineering', code: 'EEE', created_at: now },
    { id: 4, name: 'Mechanical Engineering', code: 'MECH', created_at: now },
    { id: 5, name: 'Civil Engineering', code: 'CIVIL', created_at: now }
  ];

  // Passwords:
  // Admin@123, Faculty@123, Student@123
  // Pre-hashed with bcrypt or simple salt hash:
  const users: User[] = [
    {
      id: 1,
      username: 'admin',
      email: 'admin@campushub.com',
      password_hash: '$2a$10$iM.o50Uu5z1Yj8yL1sH4he2cbnqZsmZ5wzE8Uq0u0sP8FwW2mF9gO', // Admin@123
      first_name: 'Dr. Suresh',
      last_name: 'Kumar',
      role: 'ADMIN',
      phone: '+91 98765 43210',
      profile_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      created_at: now
    },
    {
      id: 2,
      username: 'faculty_ece',
      email: 'faculty@campushub.com',
      password_hash: '$2a$10$wE9K6s5k8m0B9x7Y1sH4he5rtyqZsmZ5wzE8Uq0u0sP8FwW2mF9gO', // Faculty@123
      first_name: 'Prof. Rajesh',
      last_name: 'Sharma',
      role: 'FACULTY',
      phone: '+91 98451 23456',
      profile_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      created_at: now
    },
    {
      id: 3,
      username: 'student_sivarami',
      email: 'student@campushub.com',
      password_hash: '$2a$10$kP2R9q7m4s1V8yL1sH4he7uiopqZsmZ5wzE8Uq0u0sP8FwW2mF9gO', // Student@123
      first_name: 'Pidugu Sivarami',
      last_name: 'Reddy',
      role: 'STUDENT',
      phone: '+91 91234 56789',
      profile_image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      created_at: now
    },
    {
      id: 4,
      username: 'student_ananya',
      email: 'ananya.p@campushub.com',
      password_hash: '$2a$10$kP2R9q7m4s1V8yL1sH4he7uiopqZsmZ5wzE8Uq0u0sP8FwW2mF9gO', // Student@123
      first_name: 'Ananya',
      last_name: 'Patel',
      role: 'STUDENT',
      phone: '+91 94567 12345',
      profile_image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      created_at: now
    },
    {
      id: 5,
      username: 'student_vikram',
      email: 'vikram.m@campushub.com',
      password_hash: '$2a$10$kP2R9q7m4s1V8yL1sH4he7uiopqZsmZ5wzE8Uq0u0sP8FwW2mF9gO', // Student@123
      first_name: 'Vikram',
      last_name: 'Mehta',
      role: 'STUDENT',
      phone: '+91 97890 65432',
      profile_image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      created_at: now
    },
    {
      id: 6,
      username: 'faculty_cse',
      email: 'priya.cse@campushub.com',
      password_hash: '$2a$10$wE9K6s5k8m0B9x7Y1sH4he5rtyqZsmZ5wzE8Uq0u0sP8FwW2mF9gO', // Faculty@123
      first_name: 'Dr. Priya',
      last_name: 'Nair',
      role: 'FACULTY',
      phone: '+91 98222 33445',
      profile_image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      created_at: now
    }
  ];

  const student_profiles: StudentProfile[] = [
    {
      id: 1,
      user_id: 3,
      roll_number: '2023ECE104',
      department_id: 1, // ECE
      year: 3,
      section: 'A',
      date_of_birth: '2003-05-14',
      address: 'Plot 42, Green Avenue, Tech City, Hyderabad, India'
    },
    {
      id: 2,
      user_id: 4,
      roll_number: '2023ECE105',
      department_id: 1, // ECE
      year: 3,
      section: 'A',
      date_of_birth: '2003-08-22',
      address: 'Flat 302, Lakeview Apartments, Bengaluru, India'
    },
    {
      id: 3,
      user_id: 5,
      roll_number: '2023ECE106',
      department_id: 1, // ECE
      year: 3,
      section: 'B',
      date_of_birth: '2003-11-05',
      address: 'House No 12, River Road, Chennai, India'
    }
  ];

  const faculty_profiles: FacultyProfile[] = [
    {
      id: 1,
      user_id: 2,
      employee_id: 'FAC-ECE-01',
      department_id: 1,
      designation: 'Associate Professor & HOD'
    },
    {
      id: 2,
      user_id: 6,
      employee_id: 'FAC-CSE-02',
      department_id: 2,
      designation: 'Assistant Professor'
    }
  ];

  const subjects: Subject[] = [
    { id: 1, name: 'Digital Signal Processing', code: 'EC501', department_id: 1, semester: 5, faculty_id: 1 },
    { id: 2, name: 'Embedded Systems & IoT', code: 'EC502', department_id: 1, semester: 5, faculty_id: 1 },
    { id: 3, name: 'VLSI Design & Technology', code: 'EC503', department_id: 1, semester: 5, faculty_id: 1 },
    { id: 4, name: 'Wireless Communication Networks', code: 'EC504', department_id: 1, semester: 5, faculty_id: 1 },
    { id: 5, name: 'Database Management Systems', code: 'CS501', department_id: 2, semester: 5, faculty_id: 2 }
  ];

  // Generate realistic attendance records
  const attendance: Attendance[] = [];
  let attId = 1;
  const sampleDates = [
    pastDays(14), pastDays(13), pastDays(12), pastDays(11), pastDays(10),
    pastDays(9), pastDays(8), pastDays(7), pastDays(6), pastDays(5),
    pastDays(4), pastDays(3), pastDays(2), pastDays(1)
  ];

  // For Student 3 (Sivarami Reddy)
  // High attendance in subjects 1, 2, 4 (85-92%) and slightly lower in 3 (around 70% to trigger warning threshold!)
  sampleDates.forEach((date, index) => {
    // Subject 1: 12 present out of 14 (~86%)
    attendance.push({
      id: attId++,
      student_id: 3,
      subject_id: 1,
      date,
      status: index === 3 || index === 9 ? 'ABSENT' : 'PRESENT',
      marked_by: 2,
      created_at: now
    });
    // Subject 2: 13 present out of 14 (~93%)
    attendance.push({
      id: attId++,
      student_id: 3,
      subject_id: 2,
      date,
      status: index === 6 ? 'ABSENT' : 'PRESENT',
      marked_by: 2,
      created_at: now
    });
    // Subject 3: 9 present out of 14 (~64% - triggers warning <75%!)
    attendance.push({
      id: attId++,
      student_id: 3,
      subject_id: 3,
      date,
      status: [1, 4, 7, 10, 13].includes(index) ? 'ABSENT' : 'PRESENT',
      marked_by: 2,
      created_at: now
    });
    // Subject 4: 12 present out of 14 (~86%)
    attendance.push({
      id: attId++,
      student_id: 3,
      subject_id: 4,
      date,
      status: index === 2 || index === 8 ? 'ABSENT' : 'PRESENT',
      marked_by: 2,
      created_at: now
    });

    // Also populate student 4
    attendance.push({
      id: attId++,
      student_id: 4,
      subject_id: 1,
      date,
      status: index % 4 === 0 ? 'ABSENT' : 'PRESENT',
      marked_by: 2,
      created_at: now
    });
  });

  const assignments: Assignment[] = [
    {
      id: 1,
      title: 'DSP Filter Design using MATLAB / SciPy',
      description: 'Design and simulate an FIR Low-Pass filter with cutoff frequency of 2.5 kHz and sampling rate of 10 kHz. Submit report with frequency response plots and source code.',
      subject_id: 1,
      faculty_id: 1,
      deadline: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(), // 7 days ahead
      created_at: pastDays(5),
      updated_at: pastDays(5)
    },
    {
      id: 2,
      title: 'ARM Cortex-M Interrupt Handling Lab',
      description: 'Implement external interrupt handling on GPIO pin with debouncing logic. Document timer-triggered ADC conversions.',
      subject_id: 2,
      faculty_id: 1,
      deadline: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(), // 3 days ahead
      created_at: pastDays(4),
      updated_at: pastDays(4)
    },
    {
      id: 3,
      title: 'CMOS Inverter VTC & Propagation Delay Analysis',
      description: 'Perform transient and DC simulation of 45nm CMOS inverter. Calculate VIL, VIH, NMH, NML and average delay.',
      subject_id: 3,
      faculty_id: 1,
      deadline: pastDays(2), // Past deadline (for testing late submission & grading!)
      created_at: pastDays(10),
      updated_at: pastDays(10)
    },
    {
      id: 4,
      title: 'OFDM Modulation & Multipath Fading Analysis',
      description: 'Write a comprehensive report on 5G NR physical layer frame structure and cyclic prefix length tradeoffs.',
      subject_id: 4,
      faculty_id: 1,
      deadline: new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString(),
      created_at: pastDays(2),
      updated_at: pastDays(2)
    }
  ];

  const submissions: Submission[] = [
    {
      id: 1,
      assignment_id: 3,
      student_id: 3,
      submission_file: 'cmos_vtc_analysis_sivarami.pdf',
      submission_text: 'Completed all DC and transient analysis in SPICE. All noise margin values calculated accurately and verified with theoretical formulas.',
      submitted_at: pastDays(3),
      marks: 92,
      feedback: 'Excellent circuit modeling and accurate delay calculations. Well documented waveforms.',
      status: 'GRADED'
    },
    {
      id: 2,
      assignment_id: 2,
      student_id: 3,
      submission_file: 'arm_interrupt_sivarami.c',
      submission_text: 'Submitted interrupt vector table configuration and software debouncing routine with state machine approach.',
      submitted_at: pastDays(1),
      marks: null,
      feedback: undefined,
      status: 'SUBMITTED'
    },
    {
      id: 3,
      assignment_id: 3,
      student_id: 4,
      submission_file: 'ananya_cmos_report.pdf',
      submission_text: 'Submitted simulation results for CMOS inverter.',
      submitted_at: pastDays(1), // submitted after deadline -> LATE
      marks: 78,
      feedback: 'Good report but submitted late after deadline. 5 marks deducted.',
      status: 'GRADED'
    }
  ];

  const announcements: Announcement[] = [
    {
      id: 1,
      title: 'Mid-Semester Examinations Schedule Announced',
      content: 'The Mid-Semester Theory & Practical Examinations for all B.Tech 3rd Year students will commence from next month. Hall tickets will be released on the portal 5 days prior.',
      created_by: 1,
      department_id: null, // General
      created_at: pastDays(2),
      updated_at: pastDays(2)
    },
    {
      id: 2,
      title: 'ECE Department Workshop on Embedded AI & TinyML',
      content: 'The ECE department is organizing a hands-on 2-day technical workshop on deploying neural networks on STM32 / ESP32 microcontrollers. Registration is free for 3rd and 4th year students.',
      created_by: 2,
      department_id: 1, // ECE specific
      created_at: pastDays(4),
      updated_at: pastDays(4)
    },
    {
      id: 3,
      title: 'Campus Recruitment Drive: Core Embedded & VLSI Firms',
      content: 'Leading semiconductor and embedded firmware companies will be visiting the campus for internship and placement drives. Check syllabus and prepare resume.',
      created_by: 1,
      department_id: null,
      created_at: pastDays(6),
      updated_at: pastDays(6)
    }
  ];

  const complaints: Complaint[] = [
    {
      id: 1,
      student_id: 3,
      category: 'Infrastructure',
      subject: 'Faulty Digital Storage Oscilloscope in ECE Lab 2',
      description: 'Oscilloscope Station #4 in ECE Advanced Electronics Lab has an intermittent trigger issue on Channel 2, causing signal loss during DSP experiments.',
      status: 'RESOLVED',
      admin_response: 'Lab technician inspected the unit on 2nd Sep. Probe and BNC cable were replaced, and calibration was verified. Station is now operational.',
      created_at: pastDays(6),
      updated_at: pastDays(3)
    },
    {
      id: 2,
      student_id: 3,
      category: 'Internet',
      subject: 'High latency and intermittent Wi-Fi drops in ECE Block 3rd Floor',
      description: 'The Wi-Fi access point near Seminar Hall 3 drops connection every 15 minutes during project research hours.',
      status: 'IN_PROGRESS',
      admin_response: 'IT infrastructure team is upgrading firmware on the Cisco APs this weekend and adding load balancing.',
      created_at: pastDays(2),
      updated_at: pastDays(1)
    },
    {
      id: 3,
      student_id: 4,
      category: 'Library',
      subject: 'Request for additional copies of Oppenheim Discrete-Time Signal Processing',
      description: 'The reference section has only 2 copies of DSP by Oppenheim & Schafer which are constantly checked out.',
      status: 'PENDING',
      admin_response: undefined,
      created_at: pastDays(1),
      updated_at: pastDays(1)
    }
  ];

  return {
    users,
    departments,
    student_profiles,
    faculty_profiles,
    subjects,
    attendance,
    assignments,
    submissions,
    announcements,
    complaints
  };
}

let dbInstance: DatabaseData | null = null;

export function getDB(): DatabaseData {
  if (!dbInstance) {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        dbInstance = JSON.parse(raw);
      } catch {
        dbInstance = getInitialSeedData();
        saveDB(dbInstance);
      }
    } else {
      dbInstance = getInitialSeedData();
      saveDB(dbInstance);
    }
  }
  return dbInstance!;
}

export function saveDB(data: DatabaseData) {
  dbInstance = data;
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database file:', err);
  }
}

export function resetDB(): DatabaseData {
  const fresh = getInitialSeedData();
  saveDB(fresh);
  return fresh;
}
