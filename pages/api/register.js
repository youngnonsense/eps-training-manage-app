import { getDoc } from '../../lib/googleSheets';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // รับเป็น Array ของ employeeIds
  const { employeeIds, courseId } = req.body;

  if (!employeeIds || employeeIds.length === 0 || !courseId) {
    return res.status(400).json({ error: 'ข้อมูลไม่ครบถ้วน' });
  }

  try {
    const doc = await getDoc();
    const sheet = doc.sheetsByTitle['Registrations'];
    const courseSheet = doc.sheetsByTitle['Courses']; // เรียกแท็บ Courses มาด้วยเพื่อดูข้อมูลวิชา
    
    if (!sheet || !courseSheet) {
      throw new Error('ไม่พบแท็บที่ต้องการใน Google Sheets');
    }

    // 1. ดึงข้อมูลหลักสูตร เพื่อเอาวันที่ และ ชั่วโมง มาเช็ค
    const courseRows = await courseSheet.getRows();
    const courseInfo = courseRows.find(r => r.get('course_id') === courseId.toString());
    
    if (!courseInfo) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลหลักสูตรนี้ในระบบ' });
    }

    const courseDateStr = courseInfo.get('start_date');
    const courseHours = parseFloat(courseInfo.get('duration_hours')) || 0;

    // 2. เช็คว่าวันที่ของหลักสูตร ผ่านมาแล้วหรือยัง?
    let isPast = false;
    if (courseDateStr) {
      const parts = courseDateStr.split('/');
      if (parts.length === 3) {
        const cDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        const today = new Date(); 
        today.setHours(0, 0, 0, 0); // รีเซ็ตเวลาเพื่อเทียบแค่วันที่
        
        if (cDate < today) {
          isPast = true; // ถ้าวันที่เรียนน้อยกว่าวันนี้ = เรียนจบไปแล้ว
        }
      }
    }

    // 3. เตรียมตัวแปรสถานะและชั่วโมงให้พร้อม
    const finalStatus = isPast ? 'Attended' : 'Registered';
    const finalEval = isPast ? 'Pass' : 'Pending';
    const finalHours = isPast ? courseHours : 0;

    // 4. แก้ปัญหา ID รวนด้วยการใช้ Math.max หาค่าที่มากที่สุด
    const rows = await sheet.getRows();
    let nextRegId = 1;

    if (rows.length > 0) {
      const allIds = rows
        .map(row => parseInt(row.get('registration_id'), 10))
        .filter(id => !isNaN(id));

      if (allIds.length > 0) {
        nextRegId = Math.max(...allIds) + 1;
      }
    }

    // 5. เตรียมข้อมูลเป็น Array สำหรับเพิ่มหลายแถวพร้อมกัน (ใช้ตัวแปรที่คำนวณไว้)
    const newRows = employeeIds.map((empId, index) => ({
      registration_id: nextRegId + index,
      course_id: courseId.toString(),
      employee_id: empId,
      attendance_status: finalStatus,
      evaluation_result: finalEval,
      hours_completed: finalHours
    }));

    // บันทึกลง Google Sheets แบบหลายแถวรวดเดียว
    await sheet.addRows(newRows);

    return res.status(200).json({ success: true, message: `ลงทะเบียนสำเร็จ ${employeeIds.length} คน` });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}