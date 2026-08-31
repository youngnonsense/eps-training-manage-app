import React, { useState } from 'react';
import { BookOpen, Calendar as CalendarIcon } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Course } from '../../types';
import { formatDateForApi, parseDateStr } from '../../lib/dateUtils';

interface EditCourseModalProps {
  course: Course;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditCourseModal: React.FC<EditCourseModalProps> = ({ course, onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCourse, setEditingCourse] = useState({
    courseId: course.courseId,
    courseCode: course.courseCode || '',
    courseName: course.courseName || '',
    category: course.category || 'หลักสูตรทั่วไป',
    startDate: parseDateStr(course.startDate),
    endDate: parseDateStr(course.endDate),
    durationHours: course.durationHours || course.hours || '',
    instructor: course.instructor || '',
    location: course.location || ''
  });

  const glassInput = "w-full bg-white dark:bg-[#2A2A2A] border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-gray-400 outline-none transition-all flex items-center text-gray-800 dark:text-gray-100";

  const handleEditCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const payload = {
      ...editingCourse,
      startDate: formatDateForApi(editingCourse.startDate),
      endDate: formatDateForApi(editingCourse.endDate)
    };

    try {
      const res = await fetch('/api/edit-course', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert('แก้ไขหลักสูตรสำเร็จ!');
        onSuccess();
      } else {
        alert('เกิดข้อผิดพลาดในการแก้ไขหลักสูตร');
      }
    } catch (err) {
      alert('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 md:p-4 z-50">
      <div className="bg-white dark:bg-[#1E1E1E] p-5 md:p-8 rounded-3xl md:rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-2xl max-w-xl w-full max-h-[85vh] md:max-h-[95vh] overflow-y-auto hide-scrollbar">
        <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
          <BookOpen className="text-blue-600 dark:text-blue-400"/> แก้ไขหลักสูตร
          <span className="text-[10px] md:text-xs font-medium text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-lg border border-blue-200 dark:border-blue-800">
            ID: {editingCourse.courseId}
          </span>
        </h3>
        <form onSubmit={handleEditCourseSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 pl-1">รหัสอ้างอิง</label>
              <input placeholder="เช่น HR-001" className={`${glassInput}`} value={editingCourse.courseCode} onChange={e => setEditingCourse({...editingCourse, courseCode: e.target.value})}/>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 pl-1">หมวดหมู่</label>
              <select className={`${glassInput}`} value={editingCourse.category} onChange={e => setEditingCourse({...editingCourse, category: e.target.value})}>
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
            <input required placeholder="พิมพ์ชื่อวิชาที่นี่..." className={`${glassInput}`} value={editingCourse.courseName} onChange={e => setEditingCourse({...editingCourse, courseName: e.target.value})}/>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
            <div className="relative">
              <label className="block text-[10px] md:text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 pl-1">วันที่เริ่ม</label>
              <div className="relative w-full">
                <DatePicker 
                  selected={editingCourse.startDate} 
                  onChange={(date: Date | null) => setEditingCourse({...editingCourse, startDate: date})} 
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
                  selected={editingCourse.endDate} 
                  onChange={(date: Date | null) => setEditingCourse({...editingCourse, endDate: date})} 
                  dateFormat="dd/MM/yyyy"
                  placeholderText="dd/mm/yyyy"
                  className={`${glassInput} pl-3 pr-8 w-full`}
                />
                <CalendarIcon size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-[10px] md:text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 pl-1">ชั่วโมงอบรม *</label>
              <input required type="number" min="0.5" step="0.5" placeholder="เช่น 6" className={`${glassInput}`} value={editingCourse.durationHours} onChange={e => setEditingCourse({...editingCourse, durationHours: e.target.value})}/>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 pl-1">ผู้สอน</label>
              <input placeholder="ชื่อวิทยากร" className={`${glassInput}`} value={editingCourse.instructor} onChange={e => setEditingCourse({...editingCourse, instructor: e.target.value})}/>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 pl-1">สถานที่</label>
              <input placeholder="เช่น ห้องประชุม A, Zoom" className={`${glassInput}`} value={editingCourse.location} onChange={e => setEditingCourse({...editingCourse, location: e.target.value})}/>
            </div>
          </div>
          <div className="flex gap-3 pt-6 border-t border-gray-100 dark:border-gray-800 mt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-gray-100 dark:bg-[#333] hover:bg-gray-200 text-gray-700 dark:text-gray-200 rounded-xl font-bold text-sm transition-colors">ยกเลิก</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-colors shadow-md">{isSubmitting ? 'กำลังอัปเดต...' : 'บันทึกการแก้ไข'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};
