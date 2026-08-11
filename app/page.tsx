'use client';

import { useState, useEffect } from 'react';
import { 
  BookOpen, Target, Plus, Search, Trash2, Calendar as CalendarIcon, 
  List, Users, CheckCircle, Clock, Sparkles, ChevronLeft, 
  ChevronRight, X, UserSearch, AlertCircle, Phone, Mail, Sun, Moon, Map, Activity, Copy, Check, ShieldCheck
} from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [empViewMode, setEmpViewMode] = useState<'grid' | 'list'>('grid'); 
  
  const [searchQuery, setSearchQuery] = useState('');
  const [empFilterDept, setEmpFilterDept] = useState('All');
  const [empFilterKpi, setEmpFilterKpi] = useState('All');
  
  const [showRegModal, setShowRegModal] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<any>(null);
  const [selectedCourse, setSelectedCourse] = useState<any>(null); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false); 

  const [isAddingHistory, setIsAddingHistory] = useState(false);
  const [newHistoryItem, setNewHistoryItem] = useState('');

  const [regCourseId, setRegCourseId] = useState('');
  const [regSelectedEmps, setRegSelectedEmps] = useState<string[]>([]);
  const [regSearch, setRegSearch] = useState('');
  const [regDeptFilter, setRegDeptFilter] = useState('All');

  const [newCourse, setNewCourse] = useState({ 
    courseCode: '', courseName: '', category: 'หลักสูตรทั่วไป', 
    startDate: null as Date | null, endDate: null as Date | null, durationHours: '', instructor: '', location: '' 
  });

  // ✅ 1. แก้ให้ Calendar ดึงเดือนปัจจุบันเสมอตอนโหลดหน้าเว็บ
  const [currentMonth, setCurrentMonth] = useState(new Date()); 

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard');
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddHistory = async (empId: string) => {
    if (!newHistoryItem.trim()) return;
    const updatedEmp = { ...selectedEmp, historyList: [...(selectedEmp.historyList || []), newHistoryItem] };
    setSelectedEmp(updatedEmp);
    setNewHistoryItem('');
    setIsAddingHistory(false);

    try {
      await fetch('/api/update-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: empId, action: 'add', courseName: newHistoryItem })
      });
      fetchDashboardData();
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการบันทึกประวัติ');
    }
  };

  const handleRemoveHistory = async (empId: string, courseName: string) => {
    if (!confirm(`ยืนยันการลบประวัติ "${courseName}" ออกจากระบบ?`)) return;
    const updatedEmp = { ...selectedEmp, historyList: selectedEmp.historyList.filter((c: string) => c !== courseName) };
    setSelectedEmp(updatedEmp);

    try {
      await fetch('/api/update-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: empId, action: 'remove', courseName })
      });
      fetchDashboardData();
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการลบประวัติ');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regSelectedEmps.length === 0) { alert('กรุณาเลือกพนักงานอย่างน้อย 1 คน'); return; }
    if (!regCourseId) { alert('กรุณาเลือกหลักสูตร'); return; }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/register', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ employeeIds: regSelectedEmps, courseId: regCourseId }) 
      });
      if (res.ok) { 
        alert(`🎉 ลงทะเบียนสำเร็จ ${regSelectedEmps.length} คน!`); 
        setShowRegModal(false); setRegSelectedEmps([]); setRegCourseId(''); fetchDashboardData(); 
      }
    } finally { setIsSubmitting(false); }
  };

  const formatDateForApi = (date: Date | null) => {
    if (!date) return '';
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const payload = {
      ...newCourse,
      startDate: formatDateForApi(newCourse.startDate),
      endDate: formatDateForApi(newCourse.endDate)
    };

    try {
      const res = await fetch('/api/add-course', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) { 
        alert('เพิ่มหลักสูตรสำเร็จ!'); 
        setShowCourseModal(false); 
        setNewCourse({ courseCode: '', courseName: '', category: 'หลักสูตรทั่วไป', startDate: null, endDate: null, durationHours: '', instructor: '', location: '' }); 
        fetchDashboardData(); 
      }
    } finally { setIsSubmitting(false); }
  };

  const handleDeleteCourse = async (courseId: string, courseName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm(`⚠️ คุณแน่ใจหรือไม่ว่าต้องการลบหลักสูตร "${courseName}"?`)) return;
    try {
      const res = await fetch('/api/delete-course', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ courseId }) });
      if (res.ok) fetchDashboardData(); else alert('เกิดข้อผิดพลาดในการลบ');
    } catch (err) { alert('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้'); }
  };

  const handleDeleteRegistration = async (courseId: string, employeeId: string, nameTh: string) => {
    if (!confirm(`⚠️ คุณแน่ใจหรือไม่ว่าต้องการลบพนักงาน "${nameTh}" ออกจากหลักสูตรนี้?`)) return;
    try {
      const res = await fetch('/api/delete-registration', { 
        method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ courseId, employeeId }) 
      });
      if (res.ok) {
        setSelectedCourse((prev: any) => ({ ...prev, attendees: prev.attendees.filter((a: any) => a.employeeId !== employeeId) }));
        fetchDashboardData();
      } else { alert('เกิดข้อผิดพลาดในการลบผู้ลงทะเบียน'); }
    } catch (err) { alert('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้'); }
  };

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email); setCopiedEmail(true); setTimeout(() => setCopiedEmail(false), 2000);
  };

  const isCourseUpcoming = (dateStr: string) => {
  return true; // ปลดล็อก: อนุญาตให้ปุ่ม + แสดงเสมอ ไม่ว่าจะเป็นอดีตหรืออนาคต
  };

  const parseDateStr = (dateStr: string) => {
    if (!dateStr || typeof dateStr !== 'string') return null;
    const parts = dateStr.split('/');
    if (parts.length === 3) return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    return null;
  };

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
  const year = currentMonth.getFullYear(); const month = currentMonth.getMonth();
  const daysInMonth = getDaysInMonth(year, month); const firstDay = getFirstDayOfMonth(year, month);
  const blanks = Array.from({ length: firstDay }, () => null);
  const days = Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1));
  const calendarCells = [...blanks, ...days];
  const monthNames = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];

  const departments = data?.employees ? ['All', ...new Set(data.employees.map((e:any) => e.departmentName).filter(Boolean))] : ['All'];
  
  const filteredEmployees = data?.employees?.filter((emp: any) => {
    const matchSearch = (emp.nameTh || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                        (emp.nameEn || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                        (emp.employeeId || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchDept = empFilterDept === 'All' || emp.departmentName === empFilterDept;
    const matchKpi = empFilterKpi === 'All' || (empFilterKpi === 'Passed' ? emp.kpi.isPassed : !emp.kpi.isPassed);
    return matchSearch && matchDept && matchKpi;
  }) || [];

  const filteredRegEmployees = data?.employees?.filter((emp: any) => {
    const matchSearch = (emp.nameTh || '').toLowerCase().includes(regSearch.toLowerCase()) || 
                        (emp.employeeId || '').toLowerCase().includes(regSearch.toLowerCase());
    const matchDept = regDeptFilter === 'All' || emp.departmentName === regDeptFilter;
    return matchSearch && matchDept;
  }) || [];

  const handleToggleSelectEmp = (empId: string) => {
    setRegSelectedEmps(prev => prev.includes(empId) ? prev.filter(id => id !== empId) : [...prev, empId]);
  };

  const handleSelectAllRegEmps = () => {
    if (regSelectedEmps.length === filteredRegEmployees.length) setRegSelectedEmps([]);
    else setRegSelectedEmps(filteredRegEmployees.map((e:any) => e.employeeId));
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) { element.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  };

  const glassCard = "bg-white dark:bg-[#1E1E1E] shadow-sm rounded-3xl p-5 md:p-6 transition-colors duration-300 border border-gray-100 dark:border-gray-800";
  const glassInput = "w-full bg-white dark:bg-[#2A2A2A] border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-gray-400 outline-none transition-all flex items-center text-gray-800 dark:text-gray-100";
  const btnPrimary = "bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-white text-white dark:text-gray-900 px-5 py-2.5 rounded-2xl text-sm font-bold shadow-md transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 whitespace-nowrap";
  const btnSecondary = "bg-white dark:bg-[#2A2A2A] hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 px-5 py-2.5 rounded-2xl text-sm font-bold shadow-sm border border-gray-200 dark:border-gray-700 transition-all flex items-center justify-center gap-2 whitespace-nowrap";

  return (
    <main className="min-h-screen bg-[#FDFBF7] dark:bg-[#121212] text-gray-900 dark:text-gray-200 p-3 md:p-8 transition-colors duration-500">
      <div className="max-w-[1400px] mx-auto space-y-6 md:space-y-8 relative">
        
        <header className={`sticky top-3 md:top-4 z-40 ${glassCard} flex flex-col xl:flex-row justify-between items-center gap-4 py-4 px-4 md:px-6`}>
          <div className="flex items-center justify-between w-full xl:w-auto">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-900 dark:bg-gray-700 rounded-2xl flex items-center justify-center shadow-inner shrink-0">
                <Sparkles className="text-white w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white">
                  Training Space
                </h1>
                <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium">HR Development Dashboard</p>
              </div>
            </div>
            <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="xl:hidden p-2.5 bg-white dark:bg-[#2A2A2A] hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-700 transition-all text-gray-600 dark:text-gray-300 shadow-sm">
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>

          <nav className="flex bg-gray-50 dark:bg-[#2A2A2A] p-1.5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-x-auto w-full xl:w-auto hide-scrollbar">
            <button onClick={() => scrollToSection('overview')} className="px-3 md:px-4 py-2 text-xs md:text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap"><Activity size={16}/> ภาพรวม</button>
            <button onClick={() => scrollToSection('courses')} className="px-3 md:px-4 py-2 text-xs md:text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap"><BookOpen size={16}/> หลักสูตร</button>
            <button onClick={() => scrollToSection('employees')} className="px-3 md:px-4 py-2 text-xs md:text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap"><Users size={16}/> พนักงาน</button>
          </nav>

          <div className="flex items-center gap-2 md:gap-3 w-full xl:w-auto justify-stretch xl:justify-end">
            <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="hidden xl:block p-3 bg-white dark:bg-[#2A2A2A] hover:bg-gray-50 dark:hover:bg-gray-700 rounded-2xl border border-gray-200 dark:border-gray-700 transition-all text-gray-600 dark:text-gray-300 shadow-sm">
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <button onClick={() => setShowCourseModal(true)} className={`${btnSecondary} flex-1 xl:flex-none py-3 md:py-2.5`}><Plus size={18} /> เพิ่มหลักสูตร</button>
            <button onClick={() => { setRegSelectedEmps([]); setRegCourseId(''); setShowRegModal(true); }} className={`${btnPrimary} flex-1 xl:flex-none py-3 md:py-2.5`}><Target size={18} /> ลงทะเบียน</button>
          </div>
        </header>

        {loading ? (
          <div className="text-center py-32 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-800 border-t-gray-800 dark:border-t-gray-200 rounded-full animate-spin"></div>
            <p className="text-gray-600 dark:text-gray-400 font-medium tracking-wider animate-pulse">กำลังโหลดข้อมูลระบบ...</p>
          </div>
        ) : data && (
          <div className="space-y-6 md:space-y-8 pb-20">
            
            <div id="overview" className="scroll-mt-32">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {[
                  { label: 'พนักงานทั้งหมด', val: data.employees?.length || 0, icon: Users, color: 'text-gray-700 dark:text-gray-200', bg: 'bg-gray-100 dark:bg-[#2A2A2A]' },
                  { label: 'ผ่าน KPI แล้ว', val: data.employees?.filter((e:any)=>e.kpi.isPassed).length || 0, icon: CheckCircle, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                  { label: 'ยังไม่ผ่าน KPI', val: data.employees?.filter((e:any)=>!e.kpi.isPassed).length || 0, icon: Clock, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/20' },
                  { label: 'หลักสูตรทั้งหมด', val: data.courses?.length || 0, icon: BookOpen, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' }
                ].map((stat, i) => (
                  <div key={i} className={`${glassCard} flex flex-col xl:flex-row items-center xl:items-start gap-3 md:gap-4 hover:-translate-y-1 group`}>
                    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color} shadow-inner shrink-0`}>
                      <stat.icon size={24} className="md:w-7 md:h-7" />
                    </div>
                    <div className="text-center xl:text-left">
                      <p className="text-[10px] md:text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{stat.label}</p>
                      <p className={`text-2xl md:text-3xl font-black ${stat.color} mt-0.5 md:mt-1`}>{stat.val}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <section id="courses" className={`${glassCard} scroll-mt-32`}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-lg md:text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                  <BookOpen className="text-gray-700 dark:text-gray-300" /> ข้อมูลหลักสูตรอบรม
                </h2>
                <div className="w-full sm:w-auto bg-gray-50 dark:bg-[#2A2A2A] p-1.5 rounded-2xl flex gap-1 border border-gray-100 dark:border-gray-700 shadow-sm">
                  <button onClick={() => setViewMode('list')} className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all flex justify-center items-center gap-1.5 ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}><List size={16} /> List</button>
                  {/* ✅ 1. เพิ่ม setCurrentMonth(new Date()) เพื่อให้กด Calendar แล้วมาที่เดือนปัจจุบัน */}
                  <button onClick={() => { setViewMode('calendar'); setCurrentMonth(new Date()); }} className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all flex justify-center items-center gap-1.5 ${viewMode === 'calendar' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}><CalendarIcon size={16} /> Calendar</button>
                </div>
              </div>

              {viewMode === 'list' ? (
                <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto hide-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider bg-gray-50/50 dark:bg-[#262626]">
                          <th className="p-4 font-bold">Course Code</th>
                          <th className="p-4 font-bold w-1/4">Course Name</th>
                          <th className="p-4 font-bold">Category</th>
                          <th className="p-4 font-bold">Date</th>
                          <th className="p-4 font-bold text-center">Hours</th>
                          <th className="p-4 font-bold text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {/* ✅ 2. เรียงตารางหลักสูตรตามวันที่ในหน้า List View */}
                        {[...(data.courses || [])].sort((a, b) => {
                          const dateA = parseDateStr(a.startDate)?.getTime() || 0;
                          const dateB = parseDateStr(b.startDate)?.getTime() || 0;
                          return dateA - dateB;
                        }).map((course: any) => {
                          const upcoming = isCourseUpcoming(course.startDate);
                          return (
                            <tr key={course.courseId} onClick={() => setSelectedCourse(course)} className="hover:bg-gray-50 dark:hover:bg-[#2A2A2A] transition-colors group cursor-pointer">
                              <td className="p-4 text-sm text-gray-600 dark:text-gray-400 font-medium">{course.courseCode || '-'}</td>
                              <td className="p-4 text-sm font-bold text-gray-900 dark:text-gray-100">
                                {course.courseName}
                                <div className="text-[10px] text-gray-400 font-normal mt-1 flex items-center gap-1">
                                  <Users size={12}/> ผู้ลงทะเบียน: {course.attendees?.length || 0} คน
                                </div>
                              </td>
                              <td className="p-4 text-xs"><span className="bg-gray-100 dark:bg-[#333] text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-full font-bold">{course.category || '-'}</span></td>
                              <td className="p-4 text-sm text-gray-600 dark:text-gray-400"><div className="flex items-center gap-1.5"><CalendarIcon size={14}/> {course.startDate || '-'}</div></td>
                              <td className="p-4 text-sm font-bold text-center text-gray-800 dark:text-gray-300">{course.hours}</td>
                              <td className="p-4">
                                <div className="flex justify-center gap-2">
                                  {upcoming && (
                                    <button onClick={(e) => { e.stopPropagation(); setRegCourseId(course.courseId.toString()); setRegSelectedEmps([]); setShowRegModal(true); }} className="p-2 bg-gray-100 dark:bg-[#333] hover:bg-gray-200 text-gray-600 dark:text-gray-300 rounded-xl transition-all shadow-sm"><Plus size={16}/></button>
                                  )}
                                  <button onClick={(e) => handleDeleteCourse(course.courseId, course.courseName, e)} className="p-2 bg-rose-50 dark:bg-rose-900/30 hover:bg-rose-100 text-rose-500 dark:text-rose-400 rounded-xl transition-all shadow-sm"><Trash2 size={16}/></button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
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
                          
                          const coursesOnThisDay = data.courses?.filter((c: any) => {
                            const sDate = parseDateStr(c.startDate);
                            if (!sDate) return false;

                            const eDate = parseDateStr(c.endDate) || sDate;

                            const current = new Date(dayDate as Date); current.setHours(0,0,0,0);
                            const start = new Date(sDate as Date); start.setHours(0,0,0,0);
                            const end = new Date(eDate as Date); end.setHours(0,0,0,0);
  
                            return current >= start && current <= end;
                          }) || [];
                          
                          const isToday = new Date().toDateString() === dayDate.toDateString();
                          
                          return (
                            <div key={index} className={`min-h-[100px] md:min-h-[120px] rounded-2xl p-2 border transition-all flex flex-col group ${isToday ? 'bg-gray-100/50 dark:bg-[#333] border-gray-300 dark:border-gray-600' : 'bg-white dark:bg-[#1E1E1E] border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#2A2A2A]'}`}>
                              <span className={`text-xs md:text-sm font-bold pl-1 pt-1 ${isToday ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400'}`}>{dayDate.getDate()}</span>
                              <div className="mt-1.5 space-y-1.5 flex-1">
                                {coursesOnThisDay.map((course: any, idx: number) => {
                                  const upcoming = isCourseUpcoming(course.startDate);
                                  return (
                                    <div key={idx} onClick={() => setSelectedCourse(course)} className="group/course relative cursor-pointer">
                                      <div className="text-[9px] md:text-[10px] bg-gray-100 dark:bg-[#333] text-gray-800 dark:text-gray-200 p-1.5 md:p-2 rounded-lg font-bold shadow-sm line-clamp-2 leading-tight">
                                        {course.courseName}
                                      </div>
                                      {upcoming && (
                                        <button 
                                          onClick={(e) => { e.stopPropagation(); setRegCourseId(course.courseId.toString()); setRegSelectedEmps([]); setShowRegModal(true); }}
                                          className="absolute inset-0 w-full h-full bg-gray-900/90 dark:bg-gray-600/90 text-white text-[10px] font-bold rounded-lg opacity-0 lg:group-hover/course:opacity-100 transition-all flex items-center justify-center gap-1 backdrop-blur-sm shadow-sm"
                                        >
                                          <Plus size={12} /> ลงทะเบียน
                                        </button>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>

            <section id="employees" className={`${glassCard} scroll-mt-32`}>
              <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6">
                <h2 className="text-lg md:text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                  <Users className="text-gray-700 dark:text-gray-300" /> ฐานข้อมูลพนักงาน
                </h2>
                <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 w-full xl:w-auto">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input type="text" placeholder="ค้นหาชื่อ, รหัส..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`${glassInput} pl-9 py-2 bg-white`} />
                  </div>
                  <div className="flex gap-2">
                    <select className={`${glassInput} py-2 flex-1 sm:min-w-[140px] bg-white`} value={empFilterDept} onChange={e => setEmpFilterDept(e.target.value)}>
                      {departments.map((d:any) => <option key={d} value={d}>{d === 'All' ? 'EPS All Group' : d}</option>)}
                    </select>
                    <select className={`${glassInput} py-2 flex-1 sm:min-w-[120px] bg-white`} value={empFilterKpi} onChange={e => setEmpFilterKpi(e.target.value)}>
                      <option value="All">KPI ทั้งหมด</option>
                      <option value="Passed">ผ่านแล้ว</option>
                      <option value="Failed">ยังไม่ผ่าน</option>
                    </select>
                  </div>
                  <div className="hidden sm:flex bg-white dark:bg-[#2A2A2A] p-1 rounded-xl gap-1 border border-gray-100 dark:border-gray-700 shrink-0">
                    <button onClick={() => setEmpViewMode('grid')} className={`p-2 rounded-lg transition-all ${empViewMode === 'grid' ? 'bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500'}`}><Map size={16}/></button>
                    <button onClick={() => setEmpViewMode('list')} className={`p-2 rounded-lg transition-all ${empViewMode === 'list' ? 'bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500'}`}><List size={16}/></button>
                  </div>
                </div>
              </div>

              {empViewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredEmployees.map((emp: any) => {
                    const percent = Math.min(100, Math.round((emp.kpi.totalHoursCompleted / 12) * 100));
                    return (
                      <div key={emp.employeeId} className="bg-white dark:bg-[#1E1E1E] p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col gap-4 hover:bg-gray-50 dark:hover:bg-[#2A2A2A] transition-all group">
                        <div className="flex justify-between items-start">
                          <div className="flex gap-3 items-center">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-100 dark:bg-[#333] flex items-center justify-center text-gray-600 dark:text-gray-300 shadow-inner shrink-0">
                              <UserSearch size={20} />
                            </div>
                            <div>
                              <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 leading-tight">
                                {emp.nameTh} <span className="text-[10px] text-gray-400 font-normal block xl:inline">({emp.nameEn})</span>
                              </h3>
                              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium mt-0.5">{emp.employeeId} • <span>{emp.departmentName}</span></p>
                            </div>
                          </div>
                          <button onClick={() => setSelectedEmp(emp)} className="bg-gray-50 dark:bg-[#2A2A2A] hover:bg-gray-100 text-gray-700 dark:text-gray-300 text-[10px] font-bold px-3 py-1.5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm transition-all shrink-0">
                            ดูประวัติ
                          </button>
                        </div>
                        <div className="space-y-1.5 bg-gray-50/50 dark:bg-[#262626] p-3 rounded-2xl border border-gray-100 dark:border-gray-800 mt-auto">
                          <div className="flex justify-between text-[10px] font-black tracking-wide">
                            <span className={emp.kpi.isPassed ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}>
                              KPI: {emp.kpi.totalHoursCompleted} / 12 ชม.
                            </span>
                            <span className={emp.kpi.isPassed ? 'text-emerald-600' : 'text-rose-500'}>{percent}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden shadow-inner">
                            <div className={`h-full rounded-full transition-all duration-1000 ${emp.kpi.isPassed ? 'bg-emerald-400' : 'bg-gray-500'}`} style={{ width: `${percent}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto hide-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider bg-gray-50/50 dark:bg-[#262626]">
                          <th className="p-4 font-bold">EMP ID</th>
                          <th className="p-4 font-bold w-1/4">Name (TH / EN)</th>
                          <th className="p-4 font-bold">Department</th>
                          <th className="p-4 font-bold">Position</th>
                          <th className="p-4 font-bold w-1/4">KPI Progress</th>
                          <th className="p-4 font-bold text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {filteredEmployees.map((emp: any) => {
                          const percent = Math.min(100, Math.round((emp.kpi.totalHoursCompleted / 12) * 100));
                          return (
                            <tr key={emp.employeeId} className="hover:bg-gray-50 dark:hover:bg-[#2A2A2A] transition-colors">
                              <td className="p-4 text-sm font-black text-gray-800 dark:text-gray-300">{emp.employeeId}</td>
                              <td className="p-4 text-sm font-bold text-gray-900 dark:text-gray-100">
                                {emp.nameTh}
                                <div className="text-xs font-normal text-gray-400">{emp.nameEn}</div>
                              </td>
                              <td className="p-4 text-sm text-gray-600 dark:text-gray-400">{emp.departmentName || '-'}</td>
                              <td className="p-4 text-sm text-gray-600 dark:text-gray-400 truncate max-w-[150px]">{emp.positionName || '-'}</td>
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden shadow-inner">
                                    <div className={`h-full rounded-full transition-all ${emp.kpi.isPassed ? 'bg-emerald-400' : 'bg-gray-500'}`} style={{ width: `${percent}%` }} />
                                  </div>
                                  <span className="text-xs font-bold w-10 text-right">{percent}%</span>
                                </div>
                              </td>
                              <td className="p-4 text-center">
                                <button onClick={() => setSelectedEmp(emp)} className="px-4 py-1.5 bg-gray-100 dark:bg-[#333] hover:bg-gray-200 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-bold transition-all shadow-sm">
                                  ดูประวัติ
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}
      </div>

      {/* Modal: ดูรายชื่อคนลงทะเบียนในหลักสูตร */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 md:p-4 z-50">
           <div className="bg-white dark:bg-[#1E1E1E] p-5 md:p-8 rounded-3xl md:rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-2xl max-w-3xl w-full max-h-[85vh] md:max-h-[90vh] flex flex-col">
             <div className="flex justify-between items-start mb-4 md:mb-6 border-b border-gray-100 dark:border-gray-800 pb-4 shrink-0">
               <div className="pr-4">
                 <h3 className="text-lg md:text-2xl font-bold flex items-start md:items-center gap-2 text-gray-900 dark:text-white leading-tight">
                   <BookOpen className="text-gray-700 dark:text-gray-300 shrink-0 mt-1 md:mt-0" /> {selectedCourse.courseName}
                 </h3>
                 <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1.5">
                   ผู้ลงทะเบียนทั้งหมด: <span className="font-bold text-gray-800 dark:text-gray-200">{selectedCourse.attendees?.length || 0}</span> คน
                 </p>
               </div>
               <button onClick={() => setSelectedCourse(null)} className="p-2 bg-gray-100 dark:bg-[#2A2A2A] hover:bg-gray-200 rounded-full transition-all text-gray-600 dark:text-gray-300 shrink-0"><X size={20}/></button>
             </div>
             
             <div className="overflow-auto pr-2 rounded-xl border border-gray-100 dark:border-gray-800 hide-scrollbar flex-1">
               <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-[#262626] text-gray-500 dark:text-gray-400 text-[10px] md:text-xs uppercase tracking-wider sticky top-0 z-10 shadow-sm">
                      <th className="p-3 md:p-4 font-bold">EMP ID</th>
                      <th className="p-3 md:p-4 font-bold">Name</th>
                      <th className="p-3 md:p-4 font-bold text-center">Status</th>
                      <th className="p-3 md:p-4 font-bold text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {selectedCourse.attendees?.length > 0 ? selectedCourse.attendees.map((att: any, idx: number) => (
                      <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-[#2A2A2A] transition-colors group/row">
                        <td className="p-3 md:p-4 text-xs md:text-sm font-bold text-gray-800 dark:text-gray-300">{att.employeeId}</td>
                        <td className="p-3 md:p-4 text-xs md:text-sm font-medium text-gray-800 dark:text-gray-200">
                          {att.nameTh}
                          <div className="text-[10px] text-gray-400 mt-0.5">{att.department}</div>
                        </td>
                        <td className="p-3 md:p-4 text-center">
                          {/* ✅ 3. คำนวณและแสดงผลสถานะ Attended/Registered อัตโนมัติ พร้อมสลับสี */}
                          {(() => {
                            let currentStatus = att.status || 'Registered';
                            const parts = selectedCourse.startDate?.split('/') || [];
                            
                            if (parts.length === 3) {
                              const cDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
                              const today = new Date(); 
                              today.setHours(0, 0, 0, 0); 
                              currentStatus = cDate < today ? 'Attended' : 'Registered';
                            }

                            const statusColor = currentStatus === 'Attended' 
                              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/50'
                              : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50';

                            return (
                              <span className={`text-[10px] md:text-xs font-bold px-2 py-1 md:px-3 md:py-1 rounded-full border ${statusColor}`}>
                                {currentStatus}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="p-3 md:p-4 text-center">
                          <button 
                            onClick={() => handleDeleteRegistration(selectedCourse.courseId, att.employeeId, att.nameTh)} 
                            className="p-1.5 text-gray-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-all lg:opacity-0 group-hover/row:opacity-100"
                            title="ลบผู้ลงทะเบียน"
                          >
                            <Trash2 size={16}/>
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={4} className="p-8 text-center text-gray-400 text-sm">ยังไม่มีผู้ลงทะเบียน</td></tr>
                    )}
                  </tbody>
               </table>
             </div>
           </div>
        </div>
      )}

      {/* Modal: Employee Details */}
      {selectedEmp && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 md:p-4 z-50">
          <div className="bg-white dark:bg-[#1E1E1E] p-5 md:p-8 rounded-3xl md:rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-2xl max-w-5xl w-full max-h-[85vh] md:max-h-[90vh] overflow-y-auto hide-scrollbar">
            <div className="flex justify-between items-start mb-6 border-b border-gray-100 dark:border-gray-800 pb-4 md:pb-6">
              <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-5 pr-4">
                <div className="w-14 h-14 md:w-20 md:h-20 rounded-2xl bg-gray-100 dark:bg-[#333] flex items-center justify-center text-gray-600 dark:text-gray-300 shadow-inner shrink-0">
                  <UserSearch size={28} className="md:w-9 md:h-9" />
                </div>
                <div>
                  <h3 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white leading-tight">{selectedEmp.nameTh}</h3>
                  <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 mt-0.5">{selectedEmp.nameEn}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-[#2A2A2A] px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700">ID: <span>{selectedEmp.employeeId}</span></span>
                    <span className="text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-[#2A2A2A] px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700">{selectedEmp.departmentName}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedEmp(null)} className="p-2 bg-gray-100 dark:bg-[#2A2A2A] hover:bg-gray-200 rounded-full transition-all text-gray-600 dark:text-gray-300 shrink-0"><X size={20}/></button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-[#262626] p-3 md:p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col justify-center">
                <p className="text-[9px] md:text-[10px] text-gray-400 uppercase font-bold mb-1">Position</p>
                <p className="text-xs md:text-sm font-bold text-gray-800 dark:text-gray-200 line-clamp-2 md:truncate" title={selectedEmp.positionName}>{selectedEmp.positionName || '-'}</p>
              </div>
              <div className="bg-gray-50 dark:bg-[#262626] p-3 md:p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col justify-center">
                <p className="text-[9px] md:text-[10px] text-gray-400 uppercase font-bold mb-1">Level / Group</p>
                <p className="text-xs md:text-sm font-bold text-gray-800 dark:text-gray-200 truncate">{selectedEmp.level || '-'} <span className="text-gray-400 font-normal hidden sm:inline">({selectedEmp.levelGroup || '-'})</span></p>
              </div>
              <div className="bg-gray-50 dark:bg-[#262626] p-3 md:p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col justify-center">
                <p className="text-[9px] md:text-[10px] text-gray-400 uppercase font-bold mb-1">Phone</p>
                <p className="text-xs md:text-sm font-bold flex items-center gap-1.5 text-gray-800 dark:text-gray-200 truncate"><Phone size={12} className="text-gray-400 shrink-0 md:w-3.5 md:h-3.5"/> {selectedEmp.phone || '-'}</p>
              </div>
              <div className="bg-gray-50 dark:bg-[#262626] p-3 md:p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col justify-center group">
                <p className="text-[9px] md:text-[10px] text-gray-400 uppercase font-bold mb-1">Email</p>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs md:text-sm font-bold flex items-center gap-1.5 text-gray-800 dark:text-gray-200 truncate" title={selectedEmp.email}>
                    <Mail size={12} className="text-gray-400 shrink-0 md:w-3.5 md:h-3.5"/> 
                    {selectedEmp.email || '-'}
                  </p>
                  {selectedEmp.email && (
                    <button 
                      onClick={() => handleCopyEmail(selectedEmp.email)} 
                      className="p-1.5 bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-[#333] rounded-lg transition-all text-gray-500 shadow-sm shrink-0"
                    >
                      {copiedEmail ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-rose-50/50 dark:bg-rose-900/10 p-4 md:p-5 rounded-3xl border border-rose-100/50 dark:border-rose-900/20">
                <h4 className="font-bold text-xs md:text-sm text-rose-600 dark:text-rose-400 mb-3 md:mb-4 flex items-center gap-2">
                  <AlertCircle size={16} /> ต้องเรียนเพิ่ม ({selectedEmp.todoList?.length || 0})
                </h4>
                <div className="space-y-2 max-h-[250px] md:max-h-[300px] overflow-y-auto pr-2 hide-scrollbar">
                  {!selectedEmp.todoList || selectedEmp.todoList.length === 0 ? <p className="text-xs text-gray-400">ครบถ้วนแล้ว เก่งมาก!</p> : selectedEmp.todoList.map((item: string, idx: number) => (
                    <div key={idx} className="p-3 bg-white dark:bg-[#262626] rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm text-xs font-medium flex gap-2 text-gray-700 dark:text-gray-300 leading-snug"><span className="text-rose-400 shrink-0">•</span> <span>{item}</span></div>
                  ))}
                </div>
              </div>

              <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-4 md:p-5 rounded-3xl border border-emerald-100/50 dark:border-emerald-900/20">
                <h4 className="font-bold text-xs md:text-sm text-emerald-600 dark:text-emerald-400 mb-3 md:mb-4 flex items-center gap-2">
                  <CheckCircle size={16} /> ผ่านแล้วปีนี้ ({selectedEmp.completedList?.length || 0})
                </h4>
                <div className="space-y-2 max-h-[250px] md:max-h-[300px] overflow-y-auto pr-2 hide-scrollbar">
                  {!selectedEmp.completedList || selectedEmp.completedList.length === 0 ? <p className="text-xs text-gray-400">ยังไม่มีประวัติ</p> : selectedEmp.completedList.map((item: string, idx: number) => (
                    <div key={idx} className="p-3 bg-white dark:bg-[#262626] rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm text-xs font-medium flex gap-2 text-gray-700 dark:text-gray-300 leading-snug"><CheckCircle size={14} className="text-emerald-500 mt-0.5 shrink-0" /> <span>{item}</span></div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50/50 dark:bg-[#262626] p-4 md:p-5 rounded-3xl border border-blue-100/50 dark:border-gray-700">
                <div className="flex justify-between items-center mb-3 md:mb-4">
                  <h4 className="font-bold text-xs md:text-sm text-blue-600 dark:text-gray-300 flex items-center gap-2">
                    <ShieldCheck size={16} /> หลักสูตรบังคับ ({selectedEmp.historyList?.length || 0})
                  </h4>
                  <button 
                    onClick={() => setIsAddingHistory(!isAddingHistory)} 
                    className="p-1.5 bg-white dark:bg-[#333] hover:bg-blue-50 dark:hover:bg-gray-600 rounded-lg text-blue-600 dark:text-gray-300 shadow-sm transition-all"
                  >
                    <Plus size={14}/>
                  </button>
                </div>
                
                {isAddingHistory && (
                  <div className="flex gap-2 mb-3 bg-white dark:bg-[#1E1E1E] p-2 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <select 
                      value={newHistoryItem} 
                      onChange={e => setNewHistoryItem(e.target.value)} 
                      className="text-xs p-1.5 rounded-lg bg-transparent border border-gray-200 dark:border-gray-700 outline-none w-full text-gray-800 dark:text-gray-200 cursor-pointer" 
                    >
                      <option value="" className="bg-white dark:bg-[#1E1E1E] text-gray-900 dark:text-gray-200">-- เลือกหลักสูตร --</option>
                      {data?.mandatoryCourses?.map((courseName: string, idx: number) => (
                        <option key={idx} value={courseName} className="bg-white dark:bg-[#1E1E1E] text-gray-900 dark:text-gray-200">{courseName}</option>
                      ))}
                    </select>
                    <button 
                      onClick={() => handleAddHistory(selectedEmp.employeeId)} 
                      disabled={!newHistoryItem}
                      className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-[10px] md:text-xs px-2 md:px-3 py-1.5 rounded-lg font-bold shrink-0 disabled:opacity-50"
                    >
                      บันทึก
                    </button>
                  </div>
                )}

                <div className="space-y-2 max-h-[200px] md:max-h-[250px] overflow-y-auto pr-2 hide-scrollbar">
                  {!selectedEmp.historyList || selectedEmp.historyList.length === 0 ? <p className="text-xs text-gray-400">ไม่มีประวัติเดิม</p> : selectedEmp.historyList.map((item: string, idx: number) => (
                    <div key={idx} className="p-3 bg-white dark:bg-[#1E1E1E] rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm text-xs font-medium flex justify-between items-start text-gray-700 dark:text-gray-300 group/history leading-snug">
                      <div className="flex gap-2"><ShieldCheck size={14} className="text-blue-500 mt-0.5 shrink-0" /> <span>{item}</span></div>
                      <button 
                        onClick={() => handleRemoveHistory(selectedEmp.employeeId, item)} 
                        className="text-gray-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 p-1 rounded-md lg:opacity-0 group-hover/history:opacity-100 transition-all shrink-0"
                      >
                        <Trash2 size={14}/>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: ลงทะเบียน (Multi-select) */}
      {showRegModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 md:p-4 z-50">
          <div className="bg-white dark:bg-[#1E1E1E] p-5 md:p-8 rounded-3xl md:rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-2xl max-w-4xl w-full max-h-[85vh] md:max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4 md:mb-6 shrink-0">
              <h3 className="text-xl md:text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                <Target className="text-gray-700 dark:text-gray-300" /> ลงทะเบียนกลุ่ม
              </h3>
              <button onClick={() => { setShowRegModal(false); setRegSelectedEmps([]); setRegCourseId(''); }} className="p-2 bg-gray-100 dark:bg-[#2A2A2A] hover:bg-gray-200 rounded-full transition-all text-gray-600 dark:text-gray-300"><X size={20}/></button>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 md:gap-6 overflow-hidden flex-1 min-h-[400px]">
              <div className="flex-1 flex flex-col border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden bg-gray-50 dark:bg-[#262626]">
                <div className="p-3 md:p-4 border-b border-gray-100 dark:border-gray-800 space-y-3 shrink-0">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                      <input type="text" placeholder="ค้นหาพนักงาน..." value={regSearch} onChange={(e) => setRegSearch(e.target.value)} className={`${glassInput} pl-9 py-2 text-xs bg-white`} />
                    </div>
                    <select className={`${glassInput} py-2 text-xs sm:max-w-[140px] bg-white`} value={regDeptFilter} onChange={e => setRegDeptFilter(e.target.value)}>
                      {departments.map((d:any) => <option key={d} value={d}>{d === 'All' ? 'ทุกแผนก' : d}</option>)}
                    </select>
                  </div>
                  <div className="flex justify-between items-center text-[10px] md:text-xs font-bold text-gray-500">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded text-gray-500 w-4 h-4 bg-gray-800" 
                        checked={filteredRegEmployees.length > 0 && regSelectedEmps.length === filteredRegEmployees.length}
                        onChange={handleSelectAllRegEmps}
                      />
                      เลือกทั้งหมดที่แสดง
                    </label>
                    <span className="text-gray-700 dark:text-gray-300">เลือกแล้ว {regSelectedEmps.length} คน</span>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-2 space-y-1 hide-scrollbar">
                  {filteredRegEmployees.map((emp: any) => (
                    <label key={emp.employeeId} className={`flex items-center gap-3 p-2.5 md:p-3 rounded-xl cursor-pointer transition-all border ${regSelectedEmps.includes(emp.employeeId) ? 'bg-white dark:bg-[#333] border-gray-300 dark:border-gray-500 shadow-sm' : 'bg-transparent border-transparent hover:border-gray-200 dark:hover:border-gray-600'}`}>
                      <input type="checkbox" className="rounded text-gray-600 w-4 h-4 shrink-0" 
                        checked={regSelectedEmps.includes(emp.employeeId)}
                        onChange={() => handleToggleSelectEmp(emp.employeeId)}
                      />
                      <div className="min-w-0">
                        <p className="text-xs md:text-sm font-bold text-gray-800 dark:text-gray-200 truncate">{emp.nameTh} <span className="text-[10px] text-gray-400 font-normal ml-1">({emp.employeeId})</span></p>
                        <p className="text-[9px] md:text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">{emp.departmentName} • {emp.positionName}</p>
                      </div>
                    </label>
                  ))}
                  {filteredRegEmployees.length === 0 && <p className="text-center text-xs text-gray-400 mt-4">ไม่พบรายชื่อพนักงาน</p>}
                </div>
              </div>

              <div className="md:w-1/3 flex flex-col justify-between shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-gray-800">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 pl-1">เลือกหลักสูตรที่ต้องการลงทะเบียน</label>
                  <select required className={`${glassInput} h-10 md:h-12 text-xs md:text-sm`} onChange={e => setRegCourseId(e.target.value)} value={regCourseId}>
                    <option value="">-- เลือกหลักสูตร --</option>
                    {data?.courses?.filter((c:any) => isCourseUpcoming(c.startDate)).map((c:any) => (
                      <option key={c.courseId} value={c.courseId}>[{c.courseId}] {c.courseName}</option>
                    ))}
                  </select>

                  {regCourseId && (
                    <div className="mt-4 p-3 md:p-4 bg-gray-50 dark:bg-[#2A2A2A] rounded-2xl border border-gray-200 dark:border-gray-700">
                      <p className="text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">สรุปการทำรายการ</p>
                      <ul className="text-xs md:text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <li className="line-clamp-2">• วิชา: <span className="font-bold text-gray-900 dark:text-gray-100">{data?.courses.find((c:any) => c.courseId.toString() === regCourseId)?.courseName}</span></li>
                        <li>• จำนวน: <span className="font-bold text-rose-500">{regSelectedEmps.length}</span> คน</li>
                      </ul>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 mt-4 md:mt-6">
                  <button type="button" onClick={handleRegister} disabled={isSubmitting || regSelectedEmps.length === 0 || !regCourseId} className={`${btnPrimary} w-full py-3 md:py-4 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed`}>
                    {isSubmitting ? 'กำลังบันทึกข้อมูล...' : 'ยืนยันลงทะเบียน'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: เพิ่มหลักสูตร (อัปเดต DatePicker แบบ dd/mm/yyyy สวยงาม) */}
      {showCourseModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 md:p-4 z-50">
          <div className="bg-white dark:bg-[#1E1E1E] p-5 md:p-8 rounded-3xl md:rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-2xl max-w-xl w-full max-h-[85vh] md:max-h-[95vh] overflow-y-auto hide-scrollbar">
            <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
              <BookOpen className="text-gray-800 dark:text-gray-200"/> เพิ่มหลักสูตรใหม่ 
              <span className="text-[10px] md:text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-[#333] px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700">Auto ID</span>
            </h3>
            <form onSubmit={handleAddCourse} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 pl-1">รหัสอ้างอิง</label>
                  <input placeholder="เช่น HR-001" className={`${glassInput}`} value={newCourse.courseCode} onChange={e => setNewCourse({...newCourse, courseCode: e.target.value})}/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 pl-1">หมวดหมู่</label>
                  <select className={`${glassInput}`} value={newCourse.category} onChange={e => setNewCourse({...newCourse, category: e.target.value})}>
                    <option value="หลักสูตรทั่วไป">หลักสูตรทั่วไป</option>
                    <option value="หลักสูตรเฉพาะ">หลักสูตรเฉพาะ</option>
                    <option value="หลักสูตรความปลอดภัย">หลักสูตรความปลอดภัย</option>
                    <option value="หลักสูตรพัฒนาทักษะ">หลักสูตรพัฒนาทักษะ</option>
                    <option value="สัมมนาภายนอก/พัฒนาทักษะ">สัมมนาภายนอก/พัฒนาทักษะ</option>
                    <option value="OJT">OJT</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 pl-1">ชื่อหลักสูตร *</label>
                <input required placeholder="พิมพ์ชื่อวิชาที่นี่..." className={`${glassInput}`} value={newCourse.courseName} onChange={e => setNewCourse({...newCourse, courseName: e.target.value})}/>
              </div>
              
              {/* ใช้ React DatePicker แทน Native Input */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                <div className="relative">
                  <label className="block text-[10px] md:text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 pl-1">วันที่เริ่ม</label>
                  <div className="relative w-full">
                    <DatePicker 
                      selected={newCourse.startDate} 
                      onChange={(date: Date | null) => setNewCourse({...newCourse, startDate: date})} 
                      dateFormat="dd/MM/yyyy"
                      placeholderText="dd/mm/yyyy"
                      className={`${glassInput} pl-3 pr-8 w-full`}
                    />
                    <CalendarIcon size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div className="relative">
                  <label className="block text-[10px] md:text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 pl-1">วันที่จบ</label>
                  <div className="relative w-full">
                    <DatePicker 
                      selected={newCourse.endDate} 
                      onChange={(date: Date | null) => setNewCourse({...newCourse, endDate: date})} 
                      dateFormat="dd/MM/yyyy"
                      placeholderText="dd/mm/yyyy"
                      className={`${glassInput} pl-3 pr-8 w-full`}
                    />
                    <CalendarIcon size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] md:text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 pl-1">ชั่วโมงอบรม *</label>
                  <input required type="number" min="0.5" step="0.5" placeholder="เช่น 6" className={`${glassInput}`} value={newCourse.durationHours} onChange={e => setNewCourse({...newCourse, durationHours: e.target.value})}/>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 pl-1">ผู้สอน</label>
                  <input placeholder="ชื่อวิทยากร" className={`${glassInput}`} value={newCourse.instructor} onChange={e => setNewCourse({...newCourse, instructor: e.target.value})}/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 pl-1">สถานที่</label>
                  <input placeholder="เช่น ห้องประชุม A, Zoom" className={`${glassInput}`} value={newCourse.location} onChange={e => setNewCourse({...newCourse, location: e.target.value})}/>
                </div>
              </div>
              <div className="flex gap-3 pt-6 border-t border-gray-100 dark:border-gray-800 mt-2">
                <button type="button" onClick={() => setShowCourseModal(false)} className="flex-1 py-3 bg-gray-100 dark:bg-[#333] hover:bg-gray-200 text-gray-700 dark:text-gray-200 rounded-xl font-bold text-sm transition-colors">ยกเลิก</button>
                <button type="submit" disabled={isSubmitting} className={btnPrimary}>{isSubmitting ? 'กำลังบันทึก...' : '+ บันทึกหลักสูตร'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}