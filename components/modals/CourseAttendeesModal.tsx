import React from 'react';
import { BookOpen, X, Trash2 } from 'lucide-react';
import { Course } from '../../types';

interface CourseAttendeesModalProps {
  course: Course;
  onClose: () => void;
  onDeleteRegistration: (courseId: string | number, employeeId: string, nameTh: string) => void;
}

export const CourseAttendeesModal: React.FC<CourseAttendeesModalProps> = ({
  course,
  onClose,
  onDeleteRegistration
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 md:p-4 z-50">
      <div className="bg-white dark:bg-[#1E1E1E] p-5 md:p-8 rounded-3xl md:rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-2xl max-w-3xl w-full max-h-[85vh] md:max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-start mb-4 md:mb-6 border-b border-gray-100 dark:border-gray-800 pb-4 shrink-0">
          <div className="pr-4">
            <h3 className="text-lg md:text-2xl font-bold flex items-start md:items-center gap-2 text-gray-900 dark:text-white leading-tight">
              <BookOpen className="text-gray-700 dark:text-gray-300 shrink-0 mt-1 md:mt-0" /> {course.courseName}
            </h3>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1.5">
              ผู้ลงทะเบียนทั้งหมด: <span className="font-bold text-gray-800 dark:text-gray-200">{course.attendees?.length || 0}</span> คน
            </p>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-[#2A2A2A] hover:bg-gray-200 rounded-full transition-all text-gray-600 dark:text-gray-300 shrink-0"><X size={20}/></button>
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
              {course.attendees && course.attendees.length > 0 ? course.attendees.map((att, idx) => (
                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-[#2A2A2A] transition-colors group/row">
                  <td className="p-3 md:p-4 text-xs md:text-sm font-bold text-gray-800 dark:text-gray-300">{att.employeeId}</td>
                  <td className="p-3 md:p-4 text-xs md:text-sm font-medium text-gray-800 dark:text-gray-200">
                    {att.nameTh}
                    <div className="text-[10px] text-gray-400 mt-0.5">{att.department}</div>
                  </td>
                  <td className="p-3 md:p-4 text-center">
                    <span className="text-[10px] md:text-xs font-bold px-2 py-1 md:px-3 md:py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50">
                      {att.status}
                    </span>
                  </td>
                  <td className="p-3 md:p-4 text-center">
                    <button 
                      onClick={() => onDeleteRegistration(course.courseId, att.employeeId, att.nameTh)} 
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
  );
};
