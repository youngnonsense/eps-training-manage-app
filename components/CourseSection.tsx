import React, { useState, useMemo } from 'react';
import { BookOpen, List, Calendar as CalendarIcon, Users, Plus, Trash2, Pencil, ChevronLeft, ChevronRight, Award, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Course } from '../types';
import { parseDateStr, getDaysInMonth, getFirstDayOfMonth, monthNames } from '../lib/dateUtils';

type SortField = 'courseId' | 'courseCode' | 'courseName' | 'category' | 'startDate' | 'hours';
type SortOrder = 'asc' | 'desc';

interface CourseSectionProps {
  courses: Course[];
  viewMode: 'list' | 'calendar';
  setViewMode: (mode: 'list' | 'calendar') => void;
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
  onSelectCourse: (course: Course) => void;
  onEditCourse: (course: Course, e?: React.MouseEvent) => void;
  onDeleteCourse: (courseId: string | number, courseName: string, e?: React.MouseEvent) => void;
  onOpenRegModalWithCourse: (courseId: string) => void;
}

export const CourseSection: React.FC<CourseSectionProps> = ({
  courses,
  viewMode,
  setViewMode,
  currentMonth,
  setCurrentMonth,
  onSelectCourse,
  onEditCourse,
  onDeleteCourse,
  onOpenRegModalWithCourse
}) => {
  const [sortField, setSortField] = useState<SortField>('courseId');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const glassCard = "bg-white dark:bg-[#1E1E1E] shadow-sm rounded-3xl p-5 md:p-6 transition-colors duration-300 border border-gray-100 dark:border-gray-800";

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

  return (
    <section id="courses" className={`${glassCard} scroll-mt-32`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-lg md:text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
          <BookOpen className="text-gray-700 dark:text-gray-300" /> ข้อมูลหลักสูตรอบรม
        </h2>
        <div className="w-full sm:w-auto bg-gray-50 dark:bg-[#2A2A2A] p-1.5 rounded-2xl flex gap-1 border border-gray-100 dark:border-gray-700 shadow-sm">
          <button 
            onClick={() => setViewMode('list')} 
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all flex justify-center items-center gap-1.5 ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            <List size={16} /> List
          </button>
          <button 
            onClick={() => setViewMode('calendar')} 
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all flex justify-center items-center gap-1.5 ${viewMode === 'calendar' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            <CalendarIcon size={16} /> Calendar
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
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
      ) : (
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
    </section>
  );
};
