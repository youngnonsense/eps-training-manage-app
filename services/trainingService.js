import { getDoc } from '../lib/googleSheets';

export async function getEmployeeTrainingSummary(employeeId) {
  const doc = await getDoc();

  // 1. ดึงแต่ละ Sheet ตามชื่อแท็บ
  const empSheet = doc.sheetsByTitle['Employees'];
  const courseSheet = doc.sheetsByTitle['Courses'];
  const matrixSheet = doc.sheetsByTitle['Training_Need_Matrix'];
  const regSheet = doc.sheetsByTitle['Registrations'];

  if (!empSheet || !courseSheet || !matrixSheet || !regSheet) {
    throw new Error('ไม่พบชื่อ Sheet ที่กำหนดใน Google Sheets กรุณาตรวจสอบชื่อแท็บด้านล่างสเปรดชีต');
  }

  const employees = await empSheet.getRows();
  const courses = await courseSheet.getRows();
  const matrix = await matrixSheet.getRows();
  const registrations = await regSheet.getRows();

  // 2. ค้นหาข้อมูลพนักงาน
  const emp = employees.find(r => r.get('employee_id') === employeeId);
  if (!emp) {
    throw new Error(`ไม่พบข้อมูลพนักงานรหัส: ${employeeId}`);
  }

  const positionName = emp.get('position_name');

  // 3. ดึงประวัติการอบรมที่ผ่านแล้ว (Attended + Pass)
  const passedRegistrations = registrations.filter(r => 
    r.get('employee_id') === employeeId && 
    r.get('attendance_status') === 'Attended' && 
    r.get('evaluation_result') === 'Pass'
  );

  let totalHoursCompleted = 0;
  let certCoursesCount = 0;
  let nonCertHours = 0;

  const passedCourseNames = [];
  const completedDetails = [];

  passedRegistrations.forEach(r => {
    const course = courses.find(c => c.get('course_id') === r.get('course_id'));
    if (course) {
      const cName = course.get('course_name');
      const hours = parseFloat(r.get('hours_completed') || course.get('duration_hours') || 0);
      const rawCert = course.get('has_certificate') ?? course.get('is_certificate') ?? '';
      const hasCert = rawCert === '1' || rawCert === 1 || rawCert === 'true' || rawCert === true || String(rawCert).toLowerCase() === 'yes';

      totalHoursCompleted += hours;
      if (hasCert) {
        certCoursesCount += 1;
      } else {
        nonCertHours += hours;
      }

      passedCourseNames.push(cName);
      completedDetails.push({
        courseName: cName,
        hasCertificate: hasCert,
        hours
      });
    }
  });

  const totalCoursesCompleted = Math.round((certCoursesCount + (nonCertHours / 6.0)) * 10) / 10;
  const isPassed = totalCoursesCompleted >= 2.0;

  // 4. Gap Analysis: หาหลักสูตรบังคับตามตำแหน่งที่ยังไม่ได้เรียน (To-Do)
  const mandatoryCourses = matrix.filter(m => 
    m.get('position_name') === positionName && parseInt(m.get('is_required')) === 1
  );

  const pendingMandatoryCourses = mandatoryCourses
    .filter(m => !passedCourseNames.includes(m.get('course_name')))
    .map(m => m.get('course_name'));

  return {
    employeeId: emp.get('employee_id'),
    name: emp.get('name_th'),
    department: emp.get('department_name'),
    position: positionName,
    kpi: {
      totalHoursCompleted,
      certCoursesCount,
      nonCertHours,
      totalCoursesCompleted,
      targetCourses: 2,
      isPassed,
      statusLabel: isPassed ? 'ผ่าน KPI (≥ 2 หลักสูตร)' : `ยังไม่ผ่าน KPI (${totalCoursesCompleted}/2 หลักสูตร)`
    },
    todoList: pendingMandatoryCourses,
    completedList: passedCourseNames,
    completedDetails
  };
}

export async function getAllDashboardData() {
  const doc = await getDoc();

  const empSheet = doc.sheetsByTitle['Employees'];
  const courseSheet = doc.sheetsByTitle['Courses'];
  const matrixSheet = doc.sheetsByTitle['Training_Need_Matrix'];
  const regSheet = doc.sheetsByTitle['Registrations'];

  const employees = await empSheet.getRows();
  const courses = await courseSheet.getRows();
  const matrix = await matrixSheet.getRows();
  const registrations = await regSheet.getRows();

  // 1. ดึงข้อมูลหลักสูตรทั้งหมด
  const allCourses = courses.map(c => {
    const rawCert = c.get('has_certificate') ?? c.get('is_certificate') ?? '';
    const hasCertificate = rawCert === '1' || rawCert === 1 || rawCert === 'true' || rawCert === true || String(rawCert).toLowerCase() === 'yes';

    return {
      courseId: c.get('course_id'),
      courseName: c.get('course_name'),
      category: c.get('category') || 'ทั่วไป',
      hours: parseFloat(c.get('duration_hours') || 0),
      hasCertificate,
      description: c.get('description') || ''
    };
  });

  // 2. สรุปข้อมูลพนักงานทุกคน
  const employeesSummary = employees.map(emp => {
    const empId = emp.get('employee_id');
    const positionName = emp.get('position_name');

    const passedRegs = registrations.filter(r => 
      r.get('employee_id') === empId && 
      r.get('attendance_status') === 'Attended' && 
      r.get('evaluation_result') === 'Pass'
    );

    let totalHours = 0;
    let certCoursesCount = 0;
    let nonCertHours = 0;
    const passedCourseNames = [];

    passedRegs.forEach(r => {
      const c = allCourses.find(course => course.courseId.toString() === r.get('course_id'));
      if (c) {
        const h = parseFloat(r.get('hours_completed') || c.hours || 0);
        totalHours += h;
        if (c.hasCertificate) {
          certCoursesCount += 1;
        } else {
          nonCertHours += h;
        }
        passedCourseNames.push(c.courseName);
      }
    });

    const totalCourses = Math.round((certCoursesCount + (nonCertHours / 6.0)) * 10) / 10;
    const isPassed = totalCourses >= 2.0;

    // Gap Analysis (To-Do)
    const mandatory = matrix.filter(m => m.get('position_name') === positionName && parseInt(m.get('is_required')) === 1);
    const todoList = mandatory
      .filter(m => !passedCourseNames.includes(m.get('course_name')))
      .map(m => m.get('course_name'));

    return {
      employeeId: empId,
      name: emp.get('name_th'),
      department: emp.get('department_name'),
      position: positionName,
      kpi: {
        totalHoursCompleted: totalHours,
        certCoursesCount,
        nonCertHours,
        totalCoursesCompleted: totalCourses,
        targetCourses: 2,
        isPassed
      },
      todoList,
      completedList: passedCourseNames
    };
  });

  return {
    courses: allCourses,
    employees: employeesSummary
  };
}