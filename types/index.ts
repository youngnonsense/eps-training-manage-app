export interface KPI {
  totalHoursCompleted: number;
  certCoursesCount?: number;
  nonCertHours?: number;
  totalCoursesCompleted: number; // e.g. 2.0
  targetCourses?: number; // default 2
  isPassed: boolean;
  equivalentCourses?: number;
  statusLabel?: string;
  progressPercent?: number;
}

export interface Attendee {
  employeeId: string;
  nameTh: string;
  department: string;
  status: string;
}

export interface Course {
  courseId: string | number;
  courseCode?: string;
  courseName: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  hours: number;
  durationHours?: string | number;
  hasCertificate?: boolean;
  instructor?: string;
  location?: string;
  description?: string;
  attendees?: Attendee[];
}

export interface CompletedCourseDetail {
  courseName: string;
  hasCertificate?: boolean;
  hours?: number;
}

export interface Employee {
  employeeId: string;
  nameTh: string;
  nameEn?: string;
  departmentName?: string;
  positionName?: string;
  level?: string;
  levelGroup?: string;
  phone?: string;
  email?: string;
  status?: string;
  kpi: KPI;
  todoList?: string[];
  completedList?: string[];
  completedDetails?: CompletedCourseDetail[];
  historyList?: string[];
}

export interface DashboardData {
  courses: Course[];
  employees: Employee[];
  mandatoryCourses?: string[];
}

export interface NewCourseFormData {
  courseCode: string;
  courseName: string;
  category: string;
  startDate: Date | null;
  endDate: Date | null;
  durationHours: string;
  hasCertificate: boolean;
  instructor: string;
  location: string;
}
