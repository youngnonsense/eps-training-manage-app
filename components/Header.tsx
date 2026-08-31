import React from 'react';
import { Sparkles, Moon, Sun, Plus, Target, Activity, BookOpen, Users } from 'lucide-react';

interface HeaderProps {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  onOpenCourseModal: () => void;
  onOpenRegModal: () => void;
  scrollToSection: (id: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  setTheme,
  onOpenCourseModal,
  onOpenRegModal,
  scrollToSection
}) => {
  const glassCard = "bg-white dark:bg-[#1E1E1E] shadow-sm rounded-3xl p-5 md:p-6 transition-colors duration-300 border border-gray-100 dark:border-gray-800";
  const btnPrimary = "bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-white text-white dark:text-gray-900 px-5 py-2.5 rounded-2xl text-sm font-bold shadow-md transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 whitespace-nowrap";
  const btnSecondary = "bg-white dark:bg-[#2A2A2A] hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 px-5 py-2.5 rounded-2xl text-sm font-bold shadow-sm border border-gray-200 dark:border-gray-700 transition-all flex items-center justify-center gap-2 whitespace-nowrap";

  return (
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
        <button 
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} 
          className="xl:hidden p-2.5 bg-white dark:bg-[#2A2A2A] hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-700 transition-all text-gray-600 dark:text-gray-300 shadow-sm"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>

      <nav className="flex bg-gray-50 dark:bg-[#2A2A2A] p-1.5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-x-auto w-full xl:w-auto hide-scrollbar">
        <button onClick={() => scrollToSection('overview')} className="px-3 md:px-4 py-2 text-xs md:text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap"><Activity size={16}/> ภาพรวม</button>
        <button onClick={() => scrollToSection('courses')} className="px-3 md:px-4 py-2 text-xs md:text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap"><BookOpen size={16}/> หลักสูตร</button>
        <button onClick={() => scrollToSection('employees')} className="px-3 md:px-4 py-2 text-xs md:text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap"><Users size={16}/> พนักงาน</button>
      </nav>

      <div className="flex items-center gap-2 md:gap-3 w-full xl:w-auto justify-stretch xl:justify-end">
        <button 
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} 
          className="hidden xl:block p-3 bg-white dark:bg-[#2A2A2A] hover:bg-gray-50 dark:hover:bg-gray-700 rounded-2xl border border-gray-200 dark:border-gray-700 transition-all text-gray-600 dark:text-gray-300 shadow-sm"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
        <button onClick={onOpenCourseModal} className={`${btnSecondary} flex-1 xl:flex-none py-3 md:py-2.5`}><Plus size={18} /> เพิ่มหลักสูตร</button>
        <button onClick={onOpenRegModal} className={`${btnPrimary} flex-1 xl:flex-none py-3 md:py-2.5`}><Target size={18} /> ลงทะเบียน</button>
      </div>
    </header>
  );
};
