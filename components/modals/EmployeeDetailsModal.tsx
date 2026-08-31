import React, { useState } from 'react';
import { UserSearch, X, Phone, Mail, Copy, Check, AlertCircle, CheckCircle, ShieldCheck, Plus, Trash2, Award } from 'lucide-react';
import { Employee, Course } from '../../types';

interface EmployeeDetailsModalProps {
  employee: Employee;
  courses?: Course[];
  mandatoryCourses?: string[];
  onClose: () => void;
  onAddHistory: (empId: string, courseName: string) => Promise<void>;
  onRemoveHistory: (empId: string, courseName: string) => Promise<void>;
}

export const EmployeeDetailsModal: React.FC<EmployeeDetailsModalProps> = ({
  employee,
  courses = [],
  mandatoryCourses = [],
  onClose,
  onAddHistory,
  onRemoveHistory
}) => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [isAddingHistory, setIsAddingHistory] = useState(false);
  const [newHistoryItem, setNewHistoryItem] = useState('');

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleSaveHistory = async () => {
    if (!newHistoryItem) return;
    await onAddHistory(employee.employeeId, newHistoryItem);
    setNewHistoryItem('');
    setIsAddingHistory(false);
  };

  const isCourseCert = (courseName: string): boolean => {
    const found = courses.find(c => c.courseName?.trim().toLowerCase() === courseName?.trim().toLowerCase());
    return Boolean(found?.hasCertificate);
  };

  const coursesCompleted = employee.kpi?.totalCoursesCompleted ?? ((employee.kpi?.totalHoursCompleted || 0) / 6);
  const certCount = employee.kpi?.certCoursesCount || 0;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 md:p-4 z-50">
      <div className="bg-white dark:bg-[#1E1E1E] p-5 md:p-8 rounded-3xl md:rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-2xl max-w-5xl w-full max-h-[85vh] md:max-h-[90vh] overflow-y-auto hide-scrollbar">
        
        {/* Header Profile Section */}
        <div className="flex justify-between items-start mb-6 border-b border-gray-100 dark:border-gray-800 pb-4 md:pb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-5 pr-4">
            <div className="w-14 h-14 md:w-20 md:h-20 rounded-2xl bg-gray-100 dark:bg-[#333] flex items-center justify-center text-gray-600 dark:text-gray-300 shadow-inner shrink-0">
              <UserSearch size={28} className="md:w-9 md:h-9" />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white leading-tight">{employee.nameTh}</h3>
                <span className={`text-xs px-3 py-1 rounded-full font-bold border ${employee.kpi?.isPassed ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800'}`}>
                  KPI: {coursesCompleted} / 2 หลักสูตร {employee.kpi?.isPassed ? '🎉 (ผ่าน)' : '⏳ (ยังไม่ผ่าน)'}
                </span>
              </div>
              <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 mt-0.5">{employee.nameEn}</p>
              <div className="flex flex-wrap gap-2">
                <span className="text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-[#2A2A2A] px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700">ID: <span>{employee.employeeId}</span></span>
                <span className="text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-[#2A2A2A] px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700">{employee.departmentName}</span>
                {certCount > 0 && (
                  <span className="text-[10px] md:text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800/60 flex items-center gap-1">
                    <Award size={13} className="text-amber-600" /> {certCount} ใบ Certificate
                  </span>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-[#2A2A2A] hover:bg-gray-200 rounded-full transition-all text-gray-600 dark:text-gray-300 shrink-0"><X size={20}/></button>
        </div>

        {/* Basic Info Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-[#262626] p-3 md:p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col justify-center">
            <p className="text-[9px] md:text-[10px] text-gray-400 uppercase font-bold mb-1">Position</p>
            <p className="text-xs md:text-sm font-bold text-gray-800 dark:text-gray-200 line-clamp-2 md:truncate" title={employee.positionName}>{employee.positionName || '-'}</p>
          </div>
          <div className="bg-gray-50 dark:bg-[#262626] p-3 md:p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col justify-center">
            <p className="text-[9px] md:text-[10px] text-gray-400 uppercase font-bold mb-1">Level / Group</p>
            <p className="text-xs md:text-sm font-bold text-gray-800 dark:text-gray-200 truncate">{employee.level || '-'} <span className="text-gray-400 font-normal hidden sm:inline">({employee.levelGroup || '-'})</span></p>
          </div>
          <div className="bg-gray-50 dark:bg-[#262626] p-3 md:p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col justify-center">
            <p className="text-[9px] md:text-[10px] text-gray-400 uppercase font-bold mb-1">Phone</p>
            <p className="text-xs md:text-sm font-bold flex items-center gap-1.5 text-gray-800 dark:text-gray-200 truncate"><Phone size={12} className="text-gray-400 shrink-0 md:w-3.5 md:h-3.5"/> {employee.phone || '-'}</p>
          </div>
          <div className="bg-gray-50 dark:bg-[#262626] p-3 md:p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col justify-center group">
            <p className="text-[9px] md:text-[10px] text-gray-400 uppercase font-bold mb-1">Email</p>
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs md:text-sm font-bold flex items-center gap-1.5 text-gray-800 dark:text-gray-200 truncate" title={employee.email}>
                <Mail size={12} className="text-gray-400 shrink-0 md:w-3.5 md:h-3.5"/> 
                {employee.email || '-'}
              </p>
              {employee.email && (
                <button 
                  onClick={() => handleCopyEmail(employee.email!)} 
                  className="p-1.5 bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-[#333] rounded-lg transition-all text-gray-500 shadow-sm shrink-0"
                >
                  {copiedEmail ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 3 Main Training Sections */}
        <div className="grid md:grid-cols-3 gap-4">
          
          {/* 1. To-Do List */}
          <div className="bg-rose-50/50 dark:bg-rose-900/10 p-4 md:p-5 rounded-3xl border border-rose-100/50 dark:border-rose-900/20">
            <h4 className="font-bold text-xs md:text-sm text-rose-600 dark:text-rose-400 mb-3 md:mb-4 flex items-center gap-2">
              <AlertCircle size={16} /> ต้องเรียนเพิ่ม ({employee.todoList?.length || 0})
            </h4>
            <div className="space-y-2 max-h-[250px] md:max-h-[300px] overflow-y-auto pr-2 hide-scrollbar">
              {!employee.todoList || employee.todoList.length === 0 ? (
                <p className="text-xs text-gray-400">ครบถ้วนตามเกณฑ์แล้ว เก่งมาก!</p>
              ) : (
                employee.todoList.map((item, idx) => (
                  <div key={idx} className="p-3 bg-white dark:bg-[#262626] rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm text-xs font-medium flex gap-2 text-gray-700 dark:text-gray-300 leading-snug">
                    <span className="text-rose-400 shrink-0">•</span> 
                    <span>{item}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 2. Completed Courses this Year */}
          <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-4 md:p-5 rounded-3xl border border-emerald-100/50 dark:border-emerald-900/20">
            <h4 className="font-bold text-xs md:text-sm text-emerald-600 dark:text-emerald-400 mb-3 md:mb-4 flex items-center gap-2">
              <CheckCircle size={16} /> ผ่านแล้วปีนี้ ({employee.completedDetails?.length || employee.completedList?.length || 0})
            </h4>
            <div className="space-y-2 max-h-[250px] md:max-h-[300px] overflow-y-auto pr-2 hide-scrollbar">
              {employee.completedDetails && employee.completedDetails.length > 0 ? (
                employee.completedDetails.map((item, idx) => {
                  const hasCert = item.hasCertificate || isCourseCert(item.courseName);
                  return (
                    <div key={idx} className="p-3 bg-white dark:bg-[#262626] rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm text-xs font-medium flex justify-between items-start gap-2 text-gray-700 dark:text-gray-300 leading-snug">
                      <div className="flex gap-2">
                        <CheckCircle size={14} className="text-emerald-500 mt-0.5 shrink-0" /> 
                        <div>
                          <span className="font-semibold text-gray-900 dark:text-gray-100">{item.courseName}</span>
                          <div className="text-[10px] text-gray-400 mt-0.5">{item.hours} ชั่วโมง</div>
                        </div>
                      </div>
                      {hasCert && (
                        <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 px-2 py-0.5 rounded-lg text-[10px] font-bold shadow-2xs shrink-0">
                          <Award size={12} className="text-amber-600 dark:text-amber-400" /> มีใบ Cer
                        </span>
                      )}
                    </div>
                  );
                })
              ) : (!employee.completedList || employee.completedList.length === 0 ? (
                <p className="text-xs text-gray-400">ยังไม่มีประวัติการอบรมปีนี้</p>
              ) : (
                employee.completedList.map((item, idx) => {
                  const hasCert = isCourseCert(item);
                  return (
                    <div key={idx} className="p-3 bg-white dark:bg-[#262626] rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm text-xs font-medium flex justify-between items-start gap-2 text-gray-700 dark:text-gray-300 leading-snug">
                      <div className="flex gap-2">
                        <CheckCircle size={14} className="text-emerald-500 mt-0.5 shrink-0" /> 
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{item}</span>
                      </div>
                      {hasCert && (
                        <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 px-2 py-0.5 rounded-lg text-[10px] font-bold shadow-2xs shrink-0">
                          <Award size={12} className="text-amber-600 dark:text-amber-400" /> มีใบ Cer
                        </span>
                      )}
                    </div>
                  );
                })
              ))}
            </div>
          </div>

          {/* 3. Historical Training */}
          <div className="bg-blue-50/50 dark:bg-[#262626] p-4 md:p-5 rounded-3xl border border-blue-100/50 dark:border-gray-700">
            <div className="flex justify-between items-center mb-3 md:mb-4">
              <h4 className="font-bold text-xs md:text-sm text-blue-600 dark:text-gray-300 flex items-center gap-2">
                <ShieldCheck size={16} /> ประวัติเดิม ({employee.historyList?.length || 0})
              </h4>
              <button 
                onClick={() => setIsAddingHistory(!isAddingHistory)} 
                className="p-1.5 bg-white dark:bg-[#333] hover:bg-blue-50 dark:hover:bg-gray-600 rounded-lg text-blue-600 dark:text-gray-300 shadow-sm transition-all"
                title="เพิ่มประวัติอบรมเดิม"
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
                  <option value="">-- เลือกหลักสูตร --</option>
                  {mandatoryCourses.map((courseName, idx) => (
                    <option key={idx} value={courseName}>{courseName}</option>
                  ))}
                </select>
                <button 
                  onClick={handleSaveHistory} 
                  disabled={!newHistoryItem}
                  className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-[10px] md:text-xs px-2 md:px-3 py-1.5 rounded-lg font-bold shrink-0 disabled:opacity-50"
                >
                  บันทึก
                </button>
              </div>
            )}

            <div className="space-y-2 max-h-[200px] md:max-h-[250px] overflow-y-auto pr-2 hide-scrollbar">
              {!employee.historyList || employee.historyList.length === 0 ? (
                <p className="text-xs text-gray-400">ไม่มีประวัติเดิม</p>
              ) : (
                employee.historyList.map((item, idx) => {
                  const hasCert = isCourseCert(item);
                  return (
                    <div key={idx} className="p-3 bg-white dark:bg-[#1E1E1E] rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm text-xs font-medium flex justify-between items-start text-gray-700 dark:text-gray-300 group/history leading-snug">
                      <div className="flex gap-2 items-start">
                        <ShieldCheck size={14} className="text-blue-500 mt-0.5 shrink-0" /> 
                        <div>
                          <span className="font-semibold text-gray-900 dark:text-gray-100">{item}</span>
                          {hasCert && (
                            <div className="mt-1">
                              <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 px-2 py-0.5 rounded-lg text-[9px] font-bold">
                                <Award size={10} className="text-amber-600 dark:text-amber-400" /> มีใบ Cer
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <button 
                        onClick={() => onRemoveHistory(employee.employeeId, item)} 
                        className="text-gray-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 p-1 rounded-md lg:opacity-0 group-hover/history:opacity-100 transition-all shrink-0"
                        title="ลบประวัติ"
                      >
                        <Trash2 size={14}/>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
