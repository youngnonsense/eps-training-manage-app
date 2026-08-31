export interface KPI {
  totalHoursCompleted: number;
  isPassed: boolean;
  equivalentCourses?: number;
  statusLabel?: string;
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
  description?: string;
  attendees?: Attendee[];
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
  kpi: KPI;
  todoList?: string[];
  completedList?: string[];
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
  instructor: string;
  location: string;
}
