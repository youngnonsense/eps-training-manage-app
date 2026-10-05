import { getDoc } from '../../lib/googleSheets';

function isCoursePastOrToday(startDateStr, endDateStr) {
  const targetStr = (endDateStr && endDateStr.trim()) ? endDateStr.trim() : (startDateStr || '').trim();
  if (!targetStr) return false;
  const parts = targetStr.split('/');
  if (parts.length !== 3) return false;
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);
  if (isNaN(day) || isNaN(month) || isNaN(year)) return false;
  const courseDate = new Date(year, month, day);
  courseDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return courseDate <= today;
}

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

    // ดึงข้อมูลหลักสูตรบังคับจาก Training_Need_Matrix
    const matrixSheet = doc.sheetsByTitle['Training_Need_Matrix'];
    const matrixRows = matrixSheet ? await matrixSheet.getRows() : [];
    
    // ดึงเฉพาะชื่อหลักสูตร (course_name) และกรองเอาเฉพาะค่าที่ไม่ซ้ำกัน
    const rawMandatoryCourses = matrixRows.map(row => row.get('course_name') || '').filter(name => name.trim() !== '');
    const mandatoryCourses = [...new Set(rawMandatoryCourses)];

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
      const rawCert = row.get('has_certificate') ?? row.get('is_certificate') ?? '';
      const hasCertificate = rawCert === '1' || rawCert === 1 || rawCert === 'true' || rawCert === true || String(rawCert).toLowerCase() === 'yes';
      const startDate = row.get('start_date') || '';
      const endDate = row.get('end_date') || '';
      const isPast = isCoursePastOrToday(startDate, endDate);

      const attendees = regRows
        .filter(r => r.get('course_id') === cId.toString())
        .map(r => {
          const rawStatus = (r.get('attendance_status') || 'Registered').trim();
          const effectiveStatus = (rawStatus === 'Registered' && isPast) ? 'Attended' : rawStatus;
          return {
            employeeId: r.get('employee_id'),
            nameTh: empMap[r.get('employee_id')]?.nameTh || 'ไม่พบข้อมูล',
            department: empMap[r.get('employee_id')]?.department || '-',
            status: effectiveStatus
          };
        });

      return {
        courseId: cId,
        courseCode: row.get('course_code') || '',
        courseName: row.get('course_name') || '',
        category: row.get('category') || '',
        startDate: startDate,
        endDate: endDate,
        hours: parseFloat(row.get('duration_hours')) || 0,
        durationHours: row.get('duration_hours') || '',
        hasCertificate: hasCertificate,
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
      let certCoursesCount = 0;
      let nonCertHours = 0;
      const completedList = [];
      const completedDetails = [];
      
      empRegs.forEach(reg => {
        const c = courses.find(c => c.courseId.toString() === reg.get('course_id'));
        if (!c) return;

        const rawStatus = (reg.get('attendance_status') || 'Registered').trim();
        const rawEval = (reg.get('evaluation_result') || '').trim();

        // ข้ามกรณีที่ขาดเรียน (Absence) หรือไม่ผ่านการประเมิน (Fail)
        if (rawStatus.toLowerCase() === 'absence' || rawEval.toLowerCase() === 'fail') {
          return;
        }

        const isPast = isCoursePastOrToday(c.startDate, c.endDate);
        const isAttended = rawStatus === 'Attended' || rawEval === 'Pass' || (rawStatus === 'Registered' && isPast);

        if (isAttended) {
          totalHours += c.hours;
          if (c.hasCertificate) {
            certCoursesCount += 1;
          } else {
            nonCertHours += c.hours;
          }
          completedList.push(c.courseName);
          completedDetails.push({
            courseName: c.courseName,
            hasCertificate: c.hasCertificate,
            hours: c.hours,
            status: 'Attended',
            startDate: c.startDate
          });
        } else if (rawStatus === 'Registered') {
          // หลักสูตรที่ลงทะเบียนไว้ล่วงหน้าแต่ยังไม่ถึงวันอบรม
          completedDetails.push({
            courseName: c.courseName,
            hasCertificate: c.hasCertificate,
            hours: c.hours,
            status: 'Registered',
            startDate: c.startDate
          });
        }
      });

      // คำนวณ KPI:
      // - คอร์สที่มี Certificate = นับเป็น 1 หลักสูตรเต็ม
      // - คอร์สทั่วไปที่ไม่มี Certificate = 6 ชั่วโมงนับเป็น 1 หลักสูตร (nonCertHours / 6.0)
      // - เกณฑ์ผ่าน KPI คือรวมได้ตั้งแต่ 2.0 หลักสูตรขึ้นไป
      const nonCertEquivalent = nonCertHours / 6.0;
      const rawTotalCourses = certCoursesCount + nonCertEquivalent;
      const totalCoursesCompleted = Math.round(rawTotalCourses * 10) / 10;
      const isPassed = rawTotalCourses >= 2.0;
      const progressPercent = Math.min(100, Math.round((rawTotalCourses / 2.0) * 100));

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
          certCoursesCount,
          nonCertHours,
          totalCoursesCompleted: totalCoursesCompleted,
          targetCourses: 2,
          isPassed: isPassed,
          progressPercent: progressPercent
        },
        completedList: completedList,
        completedDetails: completedDetails,
        historyList: historyList,
        todoList: !isPassed ? [`ต้องสะสมให้ครบ 2 หลักสูตร (ปัจจุบันได้ ${totalCoursesCompleted}/2 หลักสูตร)`] : []
      };
    });

    return res.status(200).json({ employees, courses, mandatoryCourses });
  } catch (error) {
    console.error('Dashboard API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}