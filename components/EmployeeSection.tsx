import React from 'react';
import { Users, Search, Map, List, UserSearch } from 'lucide-react';
import { Employee } from '../types';

interface EmployeeSectionProps {
  employees: Employee[];
  departments: string[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  empFilterDept: string;
  setEmpFilterDept: (dept: string) => void;
  empFilterKpi: string;
  setEmpFilterKpi: (kpi: string) => void;
  empViewMode: 'grid' | 'list';
  setEmpViewMode: (mode: 'grid' | 'list') => void;
  onSelectEmployee: (emp: Employee) => void;
}

export const EmployeeSection: React.FC<EmployeeSectionProps> = ({
  employees,
  departments,
  searchQuery,
  setSearchQuery,
  empFilterDept,
  setEmpFilterDept,
  empFilterKpi,
  setEmpFilterKpi,
  empViewMode,
  setEmpViewMode,
  onSelectEmployee
}) => {
  const glassCard = "bg-white dark:bg-[#1E1E1E] shadow-sm rounded-3xl p-5 md:p-6 transition-colors duration-300 border border-gray-100 dark:border-gray-800";
  const glassInput = "w-full bg-white dark:bg-[#2A2A2A] border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-gray-400 outline-none transition-all flex items-center text-gray-800 dark:text-gray-100";

  return (
    <section id="employees" className={`${glassCard} scroll-mt-32`}>
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6">
        <h2 className="text-lg md:text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
          <Users className="text-gray-700 dark:text-gray-300" /> ฐานข้อมูลพนักงาน
        </h2>
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 w-full xl:w-auto">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="ค้นหาชื่อ, รหัส..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className={`${glassInput} pl-9 py-2 bg-white`} 
            />
          </div>
          <div className="flex gap-2">
            <select className={`${glassInput} py-2 flex-1 sm:min-w-[140px] bg-white`} value={empFilterDept} onChange={e => setEmpFilterDept(e.target.value)}>
              {departments.map((d: string) => <option key={d} value={d}>{d === 'All' ? 'EPS All Group' : d}</option>)}
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
          {employees.map((emp) => {
            const percent = Math.min(100, Math.round(((emp.kpi?.totalHoursCompleted || 0) / 12) * 100));
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
                  <button onClick={() => onSelectEmployee(emp)} className="bg-gray-50 dark:bg-[#2A2A2A] hover:bg-gray-100 text-gray-700 dark:text-gray-300 text-[10px] font-bold px-3 py-1.5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm transition-all shrink-0">
                    ดูประวัติ
                  </button>
                </div>
                <div className="space-y-1.5 bg-gray-50/50 dark:bg-[#262626] p-3 rounded-2xl border border-gray-100 dark:border-gray-800 mt-auto">
                  <div className="flex justify-between text-[10px] font-black tracking-wide">
                    <span className={emp.kpi?.isPassed ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}>
                      KPI: {emp.kpi?.totalHoursCompleted || 0} / 12 ชม.
                    </span>
                    <span className={emp.kpi?.isPassed ? 'text-emerald-600' : 'text-rose-500'}>{percent}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden shadow-inner">
                    <div className={`h-full rounded-full transition-all duration-1000 ${emp.kpi?.isPassed ? 'bg-emerald-400' : 'bg-gray-500'}`} style={{ width: `${percent}%` }} />
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
                {employees.map((emp) => {
                  const percent = Math.min(100, Math.round(((emp.kpi?.totalHoursCompleted || 0) / 12) * 100));
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
                            <div className={`h-full rounded-full transition-all ${emp.kpi?.isPassed ? 'bg-emerald-400' : 'bg-gray-500'}`} style={{ width: `${percent}%` }} />
                          </div>
                          <span className="text-xs font-bold w-10 text-right">{percent}%</span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <button onClick={() => onSelectEmployee(emp)} className="px-4 py-1.5 bg-gray-100 dark:bg-[#333] hover:bg-gray-200 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-bold transition-all shadow-sm">
                          ดูประวัติ
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
};
