'use client';

import { useState, useEffect, useMemo } from 'react';
import { DashboardData, Employee, Course } from '@/types';
import { Header } from '@/components/Header';
import { OverviewStats } from '@/components/OverviewStats';
import { CourseSection } from '@/components/CourseSection';
import { EmployeeSection } from '@/components/EmployeeSection';
import { CourseAttendeesModal } from '@/components/modals/CourseAttendeesModal';
import { EmployeeDetailsModal } from '@/components/modals/EmployeeDetailsModal';
import { GroupRegistrationModal } from '@/components/modals/GroupRegistrationModal';
import { AddCourseModal } from '@/components/modals/AddCourseModal';
import { EditCourseModal } from '@/components/modals/EditCourseModal';

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [empViewMode, setEmpViewMode] = useState<'grid' | 'list'>('grid'); 
  
  const [searchQuery, setSearchQuery] = useState('');
  const [empFilterDept, setEmpFilterDept] = useState('All');
  const [empFilterKpi, setEmpFilterKpi] = useState('All');
  
  const [showRegModal, setShowRegModal] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null); 
  const [regCourseId, setRegCourseId] = useState('');

  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 6, 1)); 

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
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddHistory = async (empId: string, courseName: string) => {
    if (!selectedEmp) return;
    const updatedEmp = { 
      ...selectedEmp, 
      historyList: [...(selectedEmp.historyList || []), courseName] 
    };
    setSelectedEmp(updatedEmp);

    try {
      await fetch('/api/update-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: empId, action: 'add', courseName })
      });
      fetchDashboardData();
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการบันทึกประวัติ');
    }
  };

  const handleRemoveHistory = async (empId: string, courseName: string) => {
    if (!selectedEmp) return;
    if (!confirm(`ยืนยันการลบประวัติ "${courseName}" ออกจากระบบ?`)) return;
    
    const updatedEmp = { 
      ...selectedEmp, 
      historyList: (selectedEmp.historyList || []).filter((c) => c !== courseName) 
    };
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

  const handleEditCourseClick = (course: Course, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingCourse(course);
  };

  const handleDeleteCourse = async (courseId: string | number, courseName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm(`⚠️ คุณแน่ใจหรือไม่ว่าต้องการลบหลักสูตร "${courseName}"?`)) return;
    try {
      const res = await fetch('/api/delete-course', { 
        method: 'DELETE', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ courseId }) 
      });
      if (res.ok) fetchDashboardData(); 
      else alert('เกิดข้อผิดพลาดในการลบ');
    } catch (err) { 
      alert('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้'); 
    }
  };

  const handleDeleteRegistration = async (courseId: string | number, employeeId: string, nameTh: string) => {
    if (!confirm(`⚠️ คุณแน่ใจหรือไม่ว่าต้องการลบพนักงาน "${nameTh}" ออกจากหลักสูตรนี้?`)) return;
    try {
      const res = await fetch('/api/delete-registration', { 
        method: 'DELETE', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ courseId, employeeId }) 
      });
      if (res.ok) {
        if (selectedCourse) {
          setSelectedCourse({
            ...selectedCourse,
            attendees: (selectedCourse.attendees || []).filter((a) => a.employeeId !== employeeId)
          });
        }
        fetchDashboardData();
      } else { 
        alert('เกิดข้อผิดพลาดในการลบผู้ลงทะเบียน'); 
      }
    } catch (err) { 
      alert('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้'); 
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) { 
      element.scrollIntoView({ behavior: 'smooth', block: 'start' }); 
    }
  };

  const departments = useMemo(() => {
    return data?.employees ? ['All', ...new Set(data.employees.map((e) => e.departmentName).filter(Boolean))] : ['All'];
  }, [data]);
  
  const filteredEmployees = useMemo(() => {
    return data?.employees?.filter((emp) => {
      const matchSearch = (emp.nameTh || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (emp.nameEn || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (emp.employeeId || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchDept = empFilterDept === 'All' || emp.departmentName === empFilterDept;
      const matchKpi = empFilterKpi === 'All' || (empFilterKpi === 'Passed' ? emp.kpi.isPassed : !emp.kpi.isPassed);
      return matchSearch && matchDept && matchKpi;
    }) || [];
  }, [data, searchQuery, empFilterDept, empFilterKpi]);

  const handleOpenRegModalWithCourse = (courseId: string) => {
    setRegCourseId(courseId);
    setShowRegModal(true);
  };

  return (
    <main className="min-h-screen bg-[#FDFBF7] dark:bg-[#121212] text-gray-900 dark:text-gray-200 p-3 md:p-8 transition-colors duration-500">
      <div className="max-w-[1400px] mx-auto space-y-6 md:space-y-8 relative">
        
        <Header 
          theme={theme}
          setTheme={setTheme}
          onOpenCourseModal={() => setShowCourseModal(true)}
          onOpenRegModal={() => { setRegCourseId(''); setShowRegModal(true); }}
          scrollToSection={scrollToSection}
        />

        {loading ? (
          <div className="text-center py-32 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-800 border-t-gray-800 dark:border-t-gray-200 rounded-full animate-spin"></div>
            <p className="text-gray-600 dark:text-gray-400 font-medium tracking-wider animate-pulse">กำลังโหลดข้อมูลระบบ...</p>
          </div>
        ) : data && (
          <div className="space-y-6 md:space-y-8 pb-20">
            <OverviewStats data={data} />

            <CourseSection 
              courses={data.courses}
              viewMode={viewMode}
              setViewMode={setViewMode}
              currentMonth={currentMonth}
              setCurrentMonth={setCurrentMonth}
              onSelectCourse={setSelectedCourse}
              onEditCourse={handleEditCourseClick}
              onDeleteCourse={handleDeleteCourse}
              onOpenRegModalWithCourse={handleOpenRegModalWithCourse}
            />

            <EmployeeSection 
              employees={filteredEmployees}
              departments={departments as string[]}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              empFilterDept={empFilterDept}
              setEmpFilterDept={setEmpFilterDept}
              empFilterKpi={empFilterKpi}
              setEmpFilterKpi={setEmpFilterKpi}
              empViewMode={empViewMode}
              setEmpViewMode={setEmpViewMode}
              onSelectEmployee={setSelectedEmp}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedCourse && (
        <CourseAttendeesModal 
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
          onDeleteRegistration={handleDeleteRegistration}
        />
      )}

      {selectedEmp && (
        <EmployeeDetailsModal 
          employee={selectedEmp}
          mandatoryCourses={data?.mandatoryCourses}
          onClose={() => setSelectedEmp(null)}
          onAddHistory={handleAddHistory}
          onRemoveHistory={handleRemoveHistory}
        />
      )}

      {showRegModal && data && (
        <GroupRegistrationModal 
          courses={data.courses}
          employees={data.employees}
          departments={departments as string[]}
          initialCourseId={regCourseId}
          onClose={() => setShowRegModal(false)}
          onSuccess={() => {
            setShowRegModal(false);
            fetchDashboardData();
          }}
        />
      )}

      {showCourseModal && (
        <AddCourseModal 
          onClose={() => setShowCourseModal(false)}
          onSuccess={() => {
            setShowCourseModal(false);
            fetchDashboardData();
          }}
        />
      )}

      {editingCourse && (
        <EditCourseModal 
          course={editingCourse}
          onClose={() => setEditingCourse(null)}
          onSuccess={() => {
            setEditingCourse(null);
            fetchDashboardData();
          }}
        />
      )}
    </main>
  );
}