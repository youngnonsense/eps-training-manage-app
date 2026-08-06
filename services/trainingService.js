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

  // คำนวณชั่วโมงสะสม
  const totalHoursCompleted = passedRegistrations.reduce(
    (sum, r) => sum + parseFloat(r.get('hours_completed') || 0), 0
  );

  // ดึงรายชื่อวิชาที่เรียนผ่านแล้ว
  const passedCourseNames = passedRegistrations.map(r => {
    const course = courses.find(c => c.get('course_id') === r.get('course_id'));
    return course ? course.get('course_name') : null;
  }).filter(Boolean);

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
      equivalentCourses: totalHoursCompleted / 6.0,
      isPassed: totalHoursCompleted >= 12.0,
      statusLabel: totalHoursCompleted >= 12.0 ? 'ผ่าน KPI (≥ 2 หลักสูตร)' : 'ยังไม่ผ่าน KPI (< 2 หลักสูตร)'
    },
    todoList: pendingMandatoryCourses,
    completedList: passedCourseNames
  };
}

// ... โค้ดเดิมก่อนหน้านี้ ...

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
  const allCourses = courses.map(c => ({
    courseId: c.get('course_id'),
    courseName: c.get('course_name'),
    category: c.get('category') || 'ทั่วไป',
    hours: parseFloat(c.get('duration_hours') || 0),
    description: c.get('description') || ''
  }));

  // 2. สรุปข้อมูลพนักงานทุกคน
  const employeesSummary = employees.map(emp => {
    const empId = emp.get('employee_id');
    const positionName = emp.get('position_name');

    // ประวัติการอบรมที่ผ่านแล้ว
    const passedRegs = registrations.filter(r => 
      r.get('employee_id') === empId && 
      r.get('attendance_status') === 'Attended' && 
      r.get('evaluation_result') === 'Pass'
    );

    const totalHours = passedRegs.reduce((sum, r) => sum + parseFloat(r.get('hours_completed') || 0), 0);
    const passedCourseNames = passedRegs.map(r => {
      const c = courses.find(course => course.get('course_id') === r.get('course_id'));
      return c ? c.get('course_name') : null;
    }).filter(Boolean);

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
        isPassed: totalHours >= 12.0
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