import React, { useState, useMemo, useEffect } from 'react';
import { 
  BookOpen, List, Calendar as CalendarIcon, Users, Plus, Trash2, Pencil, 
  ChevronLeft, ChevronRight, Award, ArrowUpDown, ArrowUp, ArrowDown, 
  Search, CheckCircle2, Clock, XCircle, MapPin, User
} from 'lucide-react';
import { Course, Employee } from '../types';
import { parseDateStr, getDaysInMonth, getFirstDayOfMonth, monthNames } from '../lib/dateUtils';

type SortField = 'courseId' | 'courseCode' | 'courseName' | 'category' | 'startDate' | 'hours';
type SortOrder = 'asc' | 'desc';

interface CourseSectionProps {
  courses: Course[];
  employees?: Employee[];
  departments?: string[];
  viewMode: 'list' | 'calendar' | 'monthly';
  setViewMode: (mode: 'list' | 'calendar' | 'monthly') => void;
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
  onSelectCourse: (course: Course) => void;
  onEditCourse: (course: Course, e?: React.MouseEvent) => void;
  onDeleteCourse: (courseId: string | number, courseName: string, e?: React.MouseEvent) => void;
  onOpenRegModalWithCourse: (courseId: string) => void;
  onSelectEmployee?: (employee: Employee) => void;
  onDeleteRegistration?: (courseId: string | number, employeeId: string, nameTh: string) => void;
}

export const CourseSection: React.FC<CourseSectionProps> = ({
  courses,
  employees = [],
  departments = [],
  viewMode,
  setViewMode,
  currentMonth,
  setCurrentMonth,
  onSelectCourse,
  onEditCourse,
  onDeleteCourse,
  onOpenRegModalWithCourse,
  onSelectEmployee,
  onDeleteRegistration
}) => {
  const [sortField, setSortField] = useState<SortField>('courseId');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Filter states สำหรับ Monthly View
  const [monthlySearch, setMonthlySearch] = useState('');
  const [monthlyDeptFilter, setMonthlyDeptFilter] = useState('All');
  const [monthlyKpiFilter, setMonthlyKpiFilter] = useState('All'); // 'All' | 'Passed' | 'NotPassed'
  const [monthlyCourseFilter, setMonthlyCourseFilter] = useState('All'); // 'All' | courseId

  useEffect(() => {
    setMonthlyCourseFilter('All');
  }, [currentMonth]);

  const glassCard = "bg-white dark:bg-[#1E1E1E] shadow-sm rounded-3xl p-5 md:p-6 transition-colors duration-300 border border-gray-100 dark:border-gray-800";
  const glassInput = "bg-white dark:bg-[#2A2A2A] border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-800 dark:text-gray-100";

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedCourses = useMemo(() => {
    if (!courses) return [];
    return [...courses].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'courseId': {
          const idA = Number(a.courseId) || 0;
          const idB = Number(b.courseId) || 0;
          comparison = idA - idB;
          break;
        }
        case 'courseCode': {
          const codeA = (a.courseCode || '').toString().trim();
          const codeB = (b.courseCode || '').toString().trim();
          comparison = codeA.localeCompare(codeB, 'th', { numeric: true });
          break;
        }
        case 'courseName': {
          const nameA = (a.courseName || '').toString().trim();
          const nameB = (b.courseName || '').toString().trim();
          comparison = nameA.localeCompare(nameB, 'th', { numeric: true });
          break;
        }
        case 'category': {
          const catA = (a.category || '').toString().trim();
          const catB = (b.category || '').toString().trim();
          comparison = catA.localeCompare(catB, 'th', { numeric: true });
          break;
        }
        case 'startDate': {
          const timeA = parseDateStr(a.startDate)?.getTime() || 0;
          const timeB = parseDateStr(b.startDate)?.getTime() || 0;
          comparison = timeA - timeB;
          break;
        }
        case 'hours': {
          const hrsA = Number(a.hours) || 0;
          const hrsB = Number(b.hours) || 0;
          comparison = hrsA - hrsB;
          break;
        }
        default:
          comparison = 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [courses, sortField, sortOrder]);

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown size={13} className="text-gray-300 dark:text-gray-600 group-hover/th:text-gray-500 transition-colors shrink-0" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp size={13} className="text-blue-600 dark:text-blue-400 shrink-0" />
    ) : (
      <ArrowDown size={13} className="text-blue-600 dark:text-blue-400 shrink-0" />
    );
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const blanks = Array.from({ length: firstDay }, () => null);
  const days = Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1));
  const calendarCells = [...blanks, ...days];

  // คำนวณหลักสูตรที่จัดขึ้นในเดือนที่เลือก
  const coursesInSelectedMonth = useMemo(() => {
    if (!courses) return [];
    return courses.filter(c => {
      const sDate = parseDateStr(c.startDate);
      if (!sDate) return false;
      const eDate = parseDateStr(c.endDate) || sDate;
      const startOfMonth = new Date(year, month, 1);
      const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59);
      return sDate <= endOfMonth && eDate >= startOfMonth;
    });
  }, [courses, year, month]);

  // คำนวณภาพรวมสถิติประจำเดือน (Monthly Metrics)
  const monthlyStats = useMemo(() => {
    let totalAttendees = 0;
    let totalPassedCourse = 0;
    let totalPassedKpi = 0;
    const uniqueEmployees = new Set<string>();

    coursesInSelectedMonth.forEach(c => {
      (c.attendees || []).forEach(att => {
        totalAttendees++;
        uniqueEmployees.add(att.employeeId);
        if (att.evaluationResult === 'Pass' || att.status === 'Attended') {
          totalPassedCourse++;
        }
        if (att.kpi?.isPassed) {
          totalPassedKpi++;
        }
      });
    });

    return {
      courseCount: coursesInSelectedMonth.length,
      totalAttendees,
      uniqueEmployeeCount: uniqueEmployees.size,
      totalPassedCourse,
      totalPassedKpi
    };
  }, [coursesInSelectedMonth]);

  const displayedCourses = useMemo(() => {
    return coursesInSelectedMonth.filter(c => 
      monthlyCourseFilter === 'All' || c.courseId.toString() === monthlyCourseFilter
    );
  }, [coursesInSelectedMonth, monthlyCourseFilter]);

  const handleOpenEmpModal = (employeeId: string) => {
    if (!onSelectEmployee) return;
    const emp = employees.find(e => e.employeeId === employeeId);
    if (emp) {
      onSelectEmployee(emp);
    }
  };

  return (
    <section id="courses" className={`${glassCard} scroll-mt-32`}>
      {/* View Mode Toggle Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-lg md:text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
          <BookOpen className="text-gray-700 dark:text-gray-300" /> ข้อมูลหลักสูตรอบรม
        </h2>
        <div className="w-full sm:w-auto bg-gray-50 dark:bg-[#2A2A2A] p-1.5 rounded-2xl flex gap-1 border border-gray-100 dark:border-gray-700 shadow-sm overflow-x-auto hide-scrollbar">
          <button 
            onClick={() => setViewMode('list')} 
            className={`flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex justify-center items-center gap-1.5 whitespace-nowrap ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            <List size={16} /> List
          </button>
          <button 
            onClick={() => setViewMode('calendar')} 
            className={`flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex justify-center items-center gap-1.5 whitespace-nowrap ${viewMode === 'calendar' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            <CalendarIcon size={16} /> Calendar
          </button>
          <button 
            onClick={() => setViewMode('monthly')} 
            className={`flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex justify-center items-center gap-1.5 whitespace-nowrap ${viewMode === 'monthly' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            <Users size={16} /> สรุปรายเดือน
          </button>
        </div>
      </div>

      {/* 1. LIST VIEW */}
      {viewMode === 'list' && (
        <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto hide-scrollbar">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider bg-gray-50/50 dark:bg-[#262626] select-none">
                  <th 
                    onClick={() => handleSort('courseId')}
                    className="p-4 font-bold w-20 text-center cursor-pointer hover:bg-gray-100/70 dark:hover:bg-[#303030] transition-colors group/th"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>ID</span>
                      {renderSortIcon('courseId')}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('courseCode')}
                    className="p-4 font-bold cursor-pointer hover:bg-gray-100/70 dark:hover:bg-[#303030] transition-colors group/th"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Course Code</span>
                      {renderSortIcon('courseCode')}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('courseName')}
                    className="p-4 font-bold w-1/3 cursor-pointer hover:bg-gray-100/70 dark:hover:bg-[#303030] transition-colors group/th"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Course Name</span>
                      {renderSortIcon('courseName')}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('category')}
                    className="p-4 font-bold cursor-pointer hover:bg-gray-100/70 dark:hover:bg-[#303030] transition-colors group/th"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Category</span>
                      {renderSortIcon('category')}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('startDate')}
                    className="p-4 font-bold cursor-pointer hover:bg-gray-100/70 dark:hover:bg-[#303030] transition-colors group/th"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Date</span>
                      {renderSortIcon('startDate')}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('hours')}
                    className="p-4 font-bold text-center cursor-pointer hover:bg-gray-100/70 dark:hover:bg-[#303030] transition-colors group/th"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span>Hours / Type</span>
                      {renderSortIcon('hours')}
                    </div>
                  </th>
                  <th className="p-4 font-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {sortedCourses.map((course, index) => (
                  <tr 
                    key={`${course.courseId}-${index}`} 
                    onClick={() => onSelectCourse(course)} 
                    className="hover:bg-gray-50 dark:hover:bg-[#2A2A2A] transition-colors group cursor-pointer"
                  >
                    <td className="p-4 text-sm font-black text-gray-800 dark:text-gray-300 text-center">{course.courseId}</td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-400 font-medium">{course.courseCode || '-'}</td>
                    <td className="p-4 text-sm font-bold text-gray-900 dark:text-gray-100">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span>{course.courseName}</span>
                        {course.hasCertificate && (
                          <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                            <Award size={12} className="text-amber-600" /> Certificate (1 หลักสูตร)
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-400 font-normal mt-1 flex items-center gap-1">
                        <Users size={12}/> ผู้ลงทะเบียน: {course.attendees?.length || 0} คน
                      </div>
                    </td>
                    <td className="p-4 text-xs">
                      <span className="bg-gray-100 dark:bg-[#333] text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-full font-bold">{course.category || '-'}</span>
                    </td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1.5"><CalendarIcon size={14}/> {course.startDate || '-'}</div>
                    </td>
                    <td className="p-4 text-sm text-center font-bold text-gray-800 dark:text-gray-300">
                      {course.hasCertificate ? (
                        <div className="flex flex-col items-center">
                          <span className="text-amber-600 dark:text-amber-400 text-xs">1 หลักสูตร</span>
                          <span className="text-[10px] text-gray-400 font-normal">({course.hours} ชม.)</span>
                        </div>
                      ) : (
                        <span>{course.hours} ชม.</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); onOpenRegModalWithCourse(course.courseId.toString()); }} 
                          className="p-2 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 text-emerald-600 dark:text-emerald-400 rounded-xl transition-all shadow-sm"
                          title="ลงทะเบียนเพิ่ม"
                        >
                          <Plus size={16}/>
                        </button>
                        <button 
                          onClick={(e) => onEditCourse(course, e)} 
                          className="p-2 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 text-blue-600 dark:text-blue-400 rounded-xl transition-all shadow-sm"
                          title="แก้ไขหลักสูตร"
                        >
                          <Pencil size={16}/>
                        </button>
                        <button 
                          onClick={(e) => onDeleteCourse(course.courseId, course.courseName, e)} 
                          className="p-2 bg-rose-50 dark:bg-rose-900/30 hover:bg-rose-100 text-rose-500 dark:text-rose-400 rounded-xl transition-all shadow-sm"
                          title="ลบหลักสูตร"
                        >
                          <Trash2 size={16}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. CALENDAR VIEW */}
      {viewMode === 'calendar' && (
        <div className="bg-white dark:bg-[#1E1E1E] p-4 md:p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h3 className="text-base md:text-lg font-bold bg-gray-50 dark:bg-[#2A2A2A] px-5 py-2 rounded-full shadow-sm text-gray-800 dark:text-gray-200">
              {monthNames[month]} {year}
            </h3>
            <div className="flex gap-2 w-full md:w-auto justify-center">
              <button onClick={() => setCurrentMonth(new Date(year, month - 1, 1))} className="p-2 bg-gray-50 dark:bg-[#2A2A2A] hover:bg-gray-100 rounded-full shadow-sm"><ChevronLeft size={20}/></button>
              <button onClick={() => setCurrentMonth(new Date())} className="px-4 py-2 bg-gray-50 dark:bg-[#2A2A2A] hover:bg-gray-100 text-xs font-bold rounded-full shadow-sm">เดือนปัจจุบัน</button>
              <button onClick={() => setCurrentMonth(new Date(year, month + 1, 1))} className="p-2 bg-gray-50 dark:bg-[#2A2A2A] hover:bg-gray-100 rounded-full shadow-sm"><ChevronRight size={20}/></button>
            </div>
          </div>
          <div className="overflow-x-auto hide-scrollbar">
            <div className="min-w-[700px]">
              <div className="grid grid-cols-7 gap-2 md:gap-3 mb-3 text-center text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest">
                <div className="text-rose-400">Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div className="text-gray-600">Sat</div>
              </div>
              <div className="grid grid-cols-7 gap-2 md:gap-3">
                {calendarCells.map((dayDate, index) => {
                  if (!dayDate) return <div key={`blank-${index}`} className="min-h-[100px] md:min-h-[120px] rounded-2xl bg-gray-50/50 dark:bg-[#262626]/50 border border-gray-100 dark:border-gray-800"></div>;
                  
                  const coursesOnThisDay = courses?.filter((c) => {
                    const sDate = parseDateStr(c.startDate);
                    if (!sDate) return false;

                    const eDate = parseDateStr(c.endDate) || sDate;
                    const current = new Date(dayDate); current.setHours(0,0,0,0);
                    const start = new Date(sDate); start.setHours(0,0,0,0);
                    const end = new Date(eDate); end.setHours(0,0,0,0);

                    return current >= start && current <= end;
                  }) || [];
                  
                  const isToday = new Date().toDateString() === dayDate.toDateString();
                  
                  return (
                    <div key={index} className={`min-h-[100px] md:min-h-[120px] rounded-2xl p-2 border transition-all flex flex-col group ${isToday ? 'bg-gray-100/50 dark:bg-[#333] border-gray-300 dark:border-gray-600' : 'bg-white dark:bg-[#1E1E1E] border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#2A2A2A]'}`}>
                      <span className={`text-xs md:text-sm font-bold pl-1 pt-1 ${isToday ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400'}`}>{dayDate.getDate()}</span>
                      <div className="mt-1.5 space-y-1.5 flex-1">
                        {coursesOnThisDay.map((course, idx) => (
                          <div key={idx} onClick={() => onSelectCourse(course)} className="group/course relative cursor-pointer">
                            <div className={`text-[9px] md:text-[10px] p-1.5 md:p-2 rounded-lg font-bold shadow-sm line-clamp-2 leading-tight ${course.hasCertificate ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-200/60 dark:border-amber-800/40' : 'bg-gray-100 dark:bg-[#333] text-gray-800 dark:text-gray-200'}`}>
                              {course.hasCertificate && <Award size={10} className="inline mr-1 text-amber-600" />}
                              {course.courseName}
                            </div>
                            <button 
                              onClick={(e) => { e.stopPropagation(); onOpenRegModalWithCourse(course.courseId.toString()); }}
                              className="absolute inset-0 w-full h-full bg-gray-900/90 dark:bg-gray-600/90 text-white text-[10px] font-bold rounded-lg opacity-0 lg:group-hover/course:opacity-100 transition-all flex items-center justify-center gap-1 backdrop-blur-sm shadow-sm"
                            >
                              <Plus size={12} /> ลงทะเบียน
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. MONTHLY ATTENDANCE SUMMARY VIEW */}
      {viewMode === 'monthly' && (
        <div className="space-y-6">
          {/* Month Picker & Filters Bar */}
          <div className="bg-white dark:bg-[#1E1E1E] p-4 md:p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              
              {/* Month Navigation */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentMonth(new Date(year, month - 1, 1))} 
                  className="p-2 bg-gray-100 dark:bg-[#2A2A2A] hover:bg-gray-200 dark:hover:bg-[#333] text-gray-700 dark:text-gray-300 rounded-xl transition-all shadow-xs"
                  title="เดือนก่อนหน้า"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="px-4 py-2 bg-gray-50 dark:bg-[#262626] border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-800 dark:text-gray-200 text-center min-w-[160px]">
                  {monthNames[month]} {year}
                </div>
                <button 
                  onClick={() => setCurrentMonth(new Date(year, month + 1, 1))} 
                  className="p-2 bg-gray-100 dark:bg-[#2A2A2A] hover:bg-gray-200 dark:hover:bg-[#333] text-gray-700 dark:text-gray-300 rounded-xl transition-all shadow-xs"
                  title="เดือนถัดไป"
                >
                  <ChevronRight size={18} />
                </button>
                <button 
                  onClick={() => setCurrentMonth(new Date())} 
                  className="px-3 py-2 bg-gray-100 dark:bg-[#2A2A2A] hover:bg-gray-200 dark:hover:bg-[#333] text-gray-600 dark:text-gray-300 text-xs font-semibold rounded-xl transition-all shadow-xs"
                >
                  เดือนปัจจุบัน
                </button>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
                <div className="relative flex-1 sm:w-56">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                  <input 
                    type="text" 
                    placeholder="ค้นหาชื่อ, รหัส, แผนก..." 
                    value={monthlySearch} 
                    onChange={e => setMonthlySearch(e.target.value)} 
                    className={`${glassInput} pl-8 w-full`} 
                  />
                </div>

                <select 
                  value={monthlyCourseFilter} 
                  onChange={e => setMonthlyCourseFilter(e.target.value)}
                  className={`${glassInput} w-auto max-w-[200px] cursor-pointer font-medium`}
                >
                  <option value="All">ทุกหลักสูตรในเดือนนี้ ({coursesInSelectedMonth.length})</option>
                  {coursesInSelectedMonth.map((c) => (
                    <option key={c.courseId} value={c.courseId.toString()}>
                      [{c.courseId}] {c.courseName}
                    </option>
                  ))}
                </select>

                <select 
                  value={monthlyDeptFilter} 
                  onChange={e => setMonthlyDeptFilter(e.target.value)}
                  className={`${glassInput} w-auto max-w-[150px] cursor-pointer`}
                >
                  <option value="All">ทุกแผนก</option>
                  {departments.filter(d => d !== 'All').map((dept, idx) => (
                    <option key={idx} value={dept}>{dept}</option>
                  ))}
                </select>

                <select 
                  value={monthlyKpiFilter} 
                  onChange={e => setMonthlyKpiFilter(e.target.value)}
                  className={`${glassInput} w-auto cursor-pointer`}
                >
                  <option value="All">สถานะ KPI: ทั้งหมด</option>
                  <option value="Passed">🎉 ผ่าน KPI แล้ว (≥ 2 วิชา)</option>
                  <option value="NotPassed">⏳ ยังไม่ผ่าน KPI (&lt; 2 วิชา)</option>
                </select>
              </div>
            </div>

            {/* Monthly Summary Statistics Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              <div className="bg-gray-50/70 dark:bg-[#262626] p-3 rounded-2xl border border-gray-100 dark:border-gray-800">
                <p className="text-[10px] uppercase font-bold text-gray-400">หลักสูตรในเดือนนี้</p>
                <p className="text-xl font-black text-gray-800 dark:text-gray-100 mt-1">{monthlyStats.courseCount} <span className="text-xs font-normal text-gray-500">วิชา</span></p>
              </div>
              <div className="bg-gray-50/70 dark:bg-[#262626] p-3 rounded-2xl border border-gray-100 dark:border-gray-800">
                <p className="text-[10px] uppercase font-bold text-gray-400">ยอดผู้เข้าอบรม</p>
                <p className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1">{monthlyStats.totalAttendees} <span className="text-xs font-normal text-gray-500">คน-ครั้ง</span></p>
              </div>
              <div className="bg-gray-50/70 dark:bg-[#262626] p-3 rounded-2xl border border-gray-100 dark:border-gray-800">
                <p className="text-[10px] uppercase font-bold text-gray-400">ผ่านการประเมินวิชา</p>
                <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{monthlyStats.totalPassedCourse} <span className="text-xs font-normal text-gray-500">คน</span></p>
              </div>
              <div className="bg-gray-50/70 dark:bg-[#262626] p-3 rounded-2xl border border-gray-100 dark:border-gray-800">
                <p className="text-[10px] uppercase font-bold text-gray-400">ผ่าน KPI ประจำปีแล้ว</p>
                <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">{monthlyStats.totalPassedKpi} <span className="text-xs font-normal text-gray-500">คน</span></p>
              </div>
            </div>
          </div>

          {/* Grouped by Course Cards */}
          {coursesInSelectedMonth.length === 0 ? (
            <div className="bg-white dark:bg-[#1E1E1E] p-12 text-center rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-3">
              <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-[#2A2A2A] rounded-2xl flex items-center justify-center text-gray-400">
                <CalendarIcon size={32} />
              </div>
              <h3 className="text-base font-bold text-gray-700 dark:text-gray-300">ไม่มีหลักสูตรอบรมในเดือน {monthNames[month]} {year}</h3>
              <p className="text-xs text-gray-400">สามารถคลิกลูกศรด้านบนเพื่อดูเดือนอื่น หรือกดปุ่ม "เพิ่มหลักสูตร" ด้านบนขวาเพื่อสร้างหลักสูตรใหม่</p>
            </div>
          ) : displayedCourses.length === 0 ? (
            <div className="bg-white dark:bg-[#1E1E1E] p-12 text-center rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-3">
              <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-[#2A2A2A] rounded-2xl flex items-center justify-center text-gray-400">
                <BookOpen size={32} />
              </div>
              <h3 className="text-base font-bold text-gray-700 dark:text-gray-300">ไม่พบหลักสูตรที่ตรงกับตัวกรอง</h3>
              <p className="text-xs text-gray-400">ลองเปลี่ยนการเลือกหลักสูตรเป็น "ทุกหลักสูตรในเดือนนี้"</p>
            </div>
          ) : (
            <div className="space-y-6">
              {displayedCourses.map((course) => {
                // กรองผู้เข้าอบรมในวิชานี้ตาม Filter
                const filteredAttendees = (course.attendees || []).filter(att => {
                  const matchSearch = 
                    (att.nameTh || '').toLowerCase().includes(monthlySearch.toLowerCase()) ||
                    (att.employeeId || '').toLowerCase().includes(monthlySearch.toLowerCase()) ||
                    (att.department || '').toLowerCase().includes(monthlySearch.toLowerCase());

                  const matchDept = monthlyDeptFilter === 'All' || att.department === monthlyDeptFilter;

                  let matchKpi = true;
                  if (monthlyKpiFilter === 'Passed') {
                    matchKpi = Boolean(att.kpi?.isPassed);
                  } else if (monthlyKpiFilter === 'NotPassed') {
                    matchKpi = !Boolean(att.kpi?.isPassed);
                  }

                  return matchSearch && matchDept && matchKpi;
                });

                return (
                  <div key={course.courseId} className="bg-white dark:bg-[#1E1E1E] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                    {/* Course Card Header */}
                    <div className="p-5 md:p-6 bg-gray-50/70 dark:bg-[#242424] border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-black text-gray-700 dark:text-gray-300 bg-white dark:bg-[#333] px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700">
                            ID: {course.courseId}
                          </span>
                          {course.courseCode && (
                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-[#2A2A2A] px-2 py-0.5 rounded-md">
                              {course.courseCode}
                            </span>
                          )}
                          <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-[#2A2A2A] px-2.5 py-1 rounded-full">
                            {course.category || 'ทั่วไป'}
                          </span>
                          {course.hasCertificate && (
                            <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 px-2.5 py-1 rounded-lg text-xs font-bold shadow-2xs">
                              <Award size={13} className="text-amber-600 dark:text-amber-400" /> Certificate (1 หลักสูตรเต็ม)
                            </span>
                          )}
                          {/* 🟢 ผู้เข้าอบรมต่อหลักสูตร (ตรงกรอบสีแดงในภาพของผู้ใช้) */}
                          <span className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 px-2.5 py-1 rounded-lg text-xs font-bold shadow-2xs">
                            <Users size={13} className="text-blue-600 dark:text-blue-400" />
                            ผู้เข้าอบรม: {course.attendees?.length || 0} คน <span className="font-normal text-blue-500 dark:text-blue-400">({(course.attendees || []).filter(a => a.evaluationResult === 'Pass' || a.status === 'Attended').length} ผ่านแล้ว)</span>
                          </span>
                        </div>

                        <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white leading-snug">
                          {course.courseName}
                        </h3>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400 pt-0.5">
                          <span className="flex items-center gap-1">
                            <CalendarIcon size={13} /> {course.startDate || '-'}
                          </span>
                          <span>•</span>
                          <span>{course.hours} ชั่วโมง</span>
                          {course.instructor && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <User size={13} /> {course.instructor}
                              </span>
                            </>
                          )}
                          {course.location && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <MapPin size={13} /> {course.location}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Course Action Buttons */}
                      <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                        <button 
                          onClick={() => onOpenRegModalWithCourse(course.courseId.toString())}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                          title="ลงทะเบียนพนักงานเพิ่มในวิชานี้"
                        >
                          <Plus size={15} /> ลงทะเบียนเพิ่ม
                        </button>
                        <button 
                          onClick={(e) => onEditCourse(course, e)}
                          className="p-2 bg-white dark:bg-[#2A2A2A] hover:bg-gray-100 dark:hover:bg-[#333] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-xl transition-all shadow-xs"
                          title="แก้ไขข้อมูลหลักสูตร"
                        >
                          <Pencil size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Attendee Table */}
                    <div className="overflow-x-auto hide-scrollbar">
                      <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                          <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 text-[11px] uppercase tracking-wider bg-white dark:bg-[#1E1E1E]">
                            <th className="p-3.5 pl-6 font-bold w-24">รหัสพนักงาน</th>
                            <th className="p-3.5 font-bold">ชื่อ - นามสกุล</th>
                            <th className="p-3.5 font-bold">แผนก</th>
                            <th className="p-3.5 font-bold text-center">ผลการประเมินวิชานี้</th>
                            <th className="p-3.5 font-bold text-center">สถานะ KPI สะสม</th>
                            <th className="p-3.5 pr-6 font-bold text-center w-20">จัดการ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                          {filteredAttendees.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="p-8 text-center text-gray-400">
                                {course.attendees && course.attendees.length > 0 
                                  ? 'ไม่มีรายชื่อที่ตรงกับตัวกรองที่เลือก' 
                                  : 'ยังไม่มีผู้ลงทะเบียนในหลักสูตรนี้'}
                              </td>
                            </tr>
                          ) : (
                            filteredAttendees.map((att) => {
                              const isCoursePassed = att.evaluationResult === 'Pass' || att.status === 'Attended';
                              const isKpiPassed = Boolean(att.kpi?.isPassed);
                              const kpiCount = att.kpi?.totalCoursesCompleted ?? '-';

                              return (
                                <tr key={att.employeeId} className="hover:bg-gray-50/70 dark:hover:bg-[#252525] transition-colors group">
                                  <td className="p-3.5 pl-6 font-bold text-gray-800 dark:text-gray-300">
                                    {att.employeeId}
                                  </td>
                                  <td className="p-3.5">
                                    <button 
                                      onClick={() => handleOpenEmpModal(att.employeeId)}
                                      className="font-bold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left"
                                      title="คลิกเพื่อดู Profile พนักงาน"
                                    >
                                      {att.nameTh}
                                    </button>
                                  </td>
                                  <td className="p-3.5 text-gray-600 dark:text-gray-400">
                                    {att.department}
                                  </td>
                                  <td className="p-3.5 text-center">
                                    {isCoursePassed ? (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                                        <CheckCircle2 size={13} /> ผ่านแล้ว (Pass)
                                      </span>
                                    ) : att.evaluationResult === 'Fail' || att.status === 'Absence' ? (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60">
                                        <XCircle size={13} /> ไม่ผ่าน (Fail)
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60">
                                        <Clock size={13} /> รอผล / รออบรม
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-3.5 text-center">
                                    {isKpiPassed ? (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                                        🎉 {kpiCount}/2 วิชา (ผ่าน)
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
                                        ⏳ {kpiCount}/2 วิชา (ยังไม่ผ่าน)
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-3.5 pr-6 text-center">
                                    {onDeleteRegistration && (
                                      <button 
                                        onClick={() => onDeleteRegistration(course.courseId, att.employeeId, att.nameTh)}
                                        className="p-1.5 text-gray-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-all lg:opacity-0 group-hover:opacity-100"
                                        title="ลบผู้ลงทะเบียน"
                                      >
                                        <Trash2 size={15} />
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
};
