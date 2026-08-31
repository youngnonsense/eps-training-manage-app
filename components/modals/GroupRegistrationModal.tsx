import React, { useState } from 'react';
import { Target, X, Search } from 'lucide-react';
import { Course, Employee } from '../../types';
import { isCourseUpcoming } from '../../lib/dateUtils';

interface GroupRegistrationModalProps {
  courses: Course[];
  employees: Employee[];
  departments: string[];
  initialCourseId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const GroupRegistrationModal: React.FC<GroupRegistrationModalProps> = ({
  courses,
  employees,
  departments,
  initialCourseId = '',
  onClose,
  onSuccess
}) => {
  const [regCourseId, setRegCourseId] = useState(initialCourseId);
  const [regSelectedEmps, setRegSelectedEmps] = useState<string[]>([]);
  const [regSearch, setRegSearch] = useState('');
  const [regDeptFilter, setRegDeptFilter] = useState('All');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const glassInput = "w-full bg-white dark:bg-[#2A2A2A] border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-gray-400 outline-none transition-all flex items-center text-gray-800 dark:text-gray-100";
  const btnPrimary = "bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-white text-white dark:text-gray-900 px-5 py-2.5 rounded-2xl text-sm font-bold shadow-md transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 whitespace-nowrap";

  const filteredRegEmployees = employees.filter((emp) => {
    const matchSearch = (emp.nameTh || '').toLowerCase().includes(regSearch.toLowerCase()) || 
                        (emp.employeeId || '').toLowerCase().includes(regSearch.toLowerCase());
    const matchDept = regDeptFilter === 'All' || emp.departmentName === regDeptFilter;
    return matchSearch && matchDept;
  });

  const handleToggleSelectEmp = (empId: string) => {
    setRegSelectedEmps(prev => prev.includes(empId) ? prev.filter(id => id !== empId) : [...prev, empId]);
  };

  const handleSelectAllRegEmps = () => {
    if (regSelectedEmps.length === filteredRegEmployees.length) {
      setRegSelectedEmps([]);
    } else {
      setRegSelectedEmps(filteredRegEmployees.map((e) => e.employeeId));
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
        onSuccess();
      }
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const selectedCourseName = courses.find((c) => c.courseId.toString() === regCourseId)?.courseName;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 md:p-4 z-50">
      <div className="bg-white dark:bg-[#1E1E1E] p-5 md:p-8 rounded-3xl md:rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-2xl max-w-4xl w-full max-h-[85vh] md:max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4 md:mb-6 shrink-0">
          <h3 className="text-xl md:text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
            <Target className="text-gray-700 dark:text-gray-300" /> ลงทะเบียนกลุ่ม
          </h3>
          <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-[#2A2A2A] hover:bg-gray-200 rounded-full transition-all text-gray-600 dark:text-gray-300"><X size={20}/></button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 overflow-hidden flex-1 min-h-[400px]">
          <div className="flex-1 flex flex-col border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden bg-gray-50 dark:bg-[#262626]">
            <div className="p-3 md:p-4 border-b border-gray-100 dark:border-gray-800 space-y-3 shrink-0">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  <input 
                    type="text" 
                    placeholder="ค้นหาพนักงาน..." 
                    value={regSearch} 
                    onChange={(e) => setRegSearch(e.target.value)} 
                    className={`${glassInput} pl-9 py-2 text-xs bg-white`} 
                  />
                </div>
                <select className={`${glassInput} py-2 text-xs sm:max-w-[140px] bg-white`} value={regDeptFilter} onChange={e => setRegDeptFilter(e.target.value)}>
                  {departments.map((d: string) => <option key={d} value={d}>{d === 'All' ? 'ทุกแผนก' : d}</option>)}
                </select>
              </div>
              <div className="flex justify-between items-center text-[10px] md:text-xs font-bold text-gray-500">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="rounded text-gray-500 w-4 h-4 bg-gray-800" 
                    checked={filteredRegEmployees.length > 0 && regSelectedEmps.length === filteredRegEmployees.length}
                    onChange={handleSelectAllRegEmps}
                  />
                  เลือกทั้งหมดที่แสดง
                </label>
                <span className="text-gray-700 dark:text-gray-300">เลือกแล้ว {regSelectedEmps.length} คน</span>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-1 hide-scrollbar">
              {filteredRegEmployees.map((emp) => (
                <label key={emp.employeeId} className={`flex items-center gap-3 p-2.5 md:p-3 rounded-xl cursor-pointer transition-all border ${regSelectedEmps.includes(emp.employeeId) ? 'bg-white dark:bg-[#333] border-gray-300 dark:border-gray-500 shadow-sm' : 'bg-transparent border-transparent hover:border-gray-200 dark:hover:border-gray-600'}`}>
                  <input 
                    type="checkbox" 
                    className="rounded text-gray-600 w-4 h-4 shrink-0" 
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
                {courses.filter((c) => isCourseUpcoming(c.startDate)).map((c) => (
                  <option key={c.courseId} value={c.courseId}>[{c.courseId}] {c.courseName}</option>
                ))}
              </select>

              {regCourseId && (
                <div className="mt-4 p-3 md:p-4 bg-gray-50 dark:bg-[#2A2A2A] rounded-2xl border border-gray-200 dark:border-gray-700">
                  <p className="text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">สรุปการทำรายการ</p>
                  <ul className="text-xs md:text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li className="line-clamp-2">• วิชา: <span className="font-bold text-gray-900 dark:text-gray-100">{selectedCourseName}</span></li>
                    <li>• จำนวน: <span className="font-bold text-rose-500">{regSelectedEmps.length}</span> คน</li>
                  </ul>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 mt-4 md:mt-6">
              <button 
                type="button" 
                onClick={handleRegister} 
                disabled={isSubmitting || regSelectedEmps.length === 0 || !regCourseId} 
                className={`${btnPrimary} w-full py-3 md:py-4 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isSubmitting ? 'กำลังบันทึกข้อมูล...' : 'ยืนยันลงทะเบียน'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
