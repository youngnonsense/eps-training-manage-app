import React from 'react';
import { Users, CheckCircle, Clock, BookOpen } from 'lucide-react';
import { DashboardData } from '../types';

interface OverviewStatsProps {
  data: DashboardData;
}

export const OverviewStats: React.FC<OverviewStatsProps> = ({ data }) => {
  const glassCard = "bg-white dark:bg-[#1E1E1E] shadow-sm rounded-3xl p-5 md:p-6 transition-colors duration-300 border border-gray-100 dark:border-gray-800";

  const stats = [
    { label: 'พนักงานทั้งหมด', val: data.employees?.length || 0, icon: Users, color: 'text-gray-700 dark:text-gray-200', bg: 'bg-gray-100 dark:bg-[#2A2A2A]' },
    { label: 'ผ่าน KPI แล้ว', val: data.employees?.filter(e => e.kpi?.isPassed).length || 0, icon: CheckCircle, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'ยังไม่ผ่าน KPI', val: data.employees?.filter(e => !e.kpi?.isPassed).length || 0, icon: Clock, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/20' },
    { label: 'หลักสูตรทั้งหมด', val: data.courses?.length || 0, icon: BookOpen, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' }
  ];

  return (
    <div id="overview" className="scroll-mt-32">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {stats.map((stat, i) => (
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
  );
};
