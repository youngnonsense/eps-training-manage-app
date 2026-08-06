import { getDoc } from '../../lib/googleSheets';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const doc = await getDoc();
    
    const empSheet = doc.sheetsByTitle['Employees'];
    const empRows = empSheet ? await empSheet.getRows() : [];
    
    const regSheet = doc.sheetsByTitle['Registrations'];
    const regRows = regSheet ? await regSheet.getRows() : [];

    // ดึงข้อมูลประวัติเก่าจาก Training_History
    const historySheet = doc.sheetsByTitle['Training_History'];
    const historyRows = historySheet ? await historySheet.getRows() : [];

    // 🟢 [เพิ่มใหม่] ดึงข้อมูลหลักสูตรบังคับจาก Training_Need_Matrix
    const matrixSheet = doc.sheetsByTitle['Training_Need_Matrix'];
    const matrixRows = matrixSheet ? await matrixSheet.getRows() : [];
    
    // ดึงเฉพาะชื่อหลักสูตร (course_name) และกรองเอาเฉพาะค่าที่ไม่ซ้ำกัน
    const rawMandatoryCourses = matrixRows.map(row => row.get('course_name') || '').filter(name => name.trim() !== '');
    const mandatoryCourses = [...new Set(rawMandatoryCourses)];
    // 🟢 สิ้นสุดส่วนที่เพิ่มใหม่

    const empMap = {};
    empRows.forEach(r => {
      empMap[r.get('employee_id')] = {
        nameTh: r.get('name_th') || '',
        department: r.get('department_name') || ''
      };
    });

    const courseSheet = doc.sheetsByTitle['Courses'];
    const courseRows = courseSheet ? await courseSheet.getRows() : [];
    
    const courses = courseRows.map(row => {
      const cId = row.get('course_id') || '';
      const attendees = regRows
        .filter(r => r.get('course_id') === cId.toString())
        .map(r => ({
          employeeId: r.get('employee_id'),
          nameTh: empMap[r.get('employee_id')]?.nameTh || 'ไม่พบข้อมูล',
          department: empMap[r.get('employee_id')]?.department || '-',
          status: r.get('attendance_status') || 'Registered'
        }));

      return {
        courseId: cId,
        courseCode: row.get('course_code') || '',
        courseName: row.get('course_name') || '',
        category: row.get('category') || '',
        startDate: row.get('start_date') || '',
        endDate: row.get('end_date') || '',
        hours: parseFloat(row.get('duration_hours')) || 0,
        instructor: row.get('instructor') || '',
        location: row.get('location') || '',
        attendees: attendees
      };
    });
    
    const employees = empRows.map(row => {
      const empId = row.get('employee_id');
      const empRegs = regRows.filter(r => r.get('employee_id') === empId);
      
      // ดึงรายชื่อคอร์สประวัติเก่าของพนักงานคนนี้
      const historyList = historyRows
        .filter(r => r.get('employee_id') === empId)
        .map(r => r.get('course_name') || '');
      
      let totalHours = 0;
      const completedList = [];
      
      empRegs.forEach(reg => {
        const c = courses.find(c => c.courseId.toString() === reg.get('course_id'));
        if (c) {
          totalHours += c.hours;
          completedList.push(c.courseName);
        }
      });

      return {
        employeeId: empId,
        nameTh: row.get('name_th') || '',
        nameEn: row.get('name_en') || '',
        departmentName: row.get('department_name') || '',
        level: row.get('level') || '',
        levelGroup: row.get('level_group') || '',
        positionName: row.get('position_name') || '',
        phone: row.get('phone') || '',
        email: row.get('email') || '',
        status: row.get('status') || 'Active',
        kpi: {
          totalHoursCompleted: totalHours,
          isPassed: totalHours >= 12
        },
        completedList: completedList,
        historyList: historyList,
        todoList: totalHours < 12 ? ['ต้องเก็บชั่วโมงอบรมเพิ่มให้ครบ 12 ชม.'] : []
      };
    });

    // 🟢 [อัปเดต] ส่ง mandatoryCourses แนบไปพร้อมกับพนักงานและหลักสูตร
    return res.status(200).json({ employees, courses, mandatoryCourses });
  } catch (error) {
    console.error('Dashboard API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}