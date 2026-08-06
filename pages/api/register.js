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
    
    if (!sheet) {
      throw new Error('ไม่พบแท็บ Registrations ใน Google Sheets');
    }

    const rows = await sheet.getRows();
    let nextRegId = 1;

    if (rows.length > 0) {
      const lastRegId = rows[rows.length - 1].get('registration_id');
      const parsedId = parseInt(lastRegId, 10);
      if (!isNaN(parsedId)) {
        nextRegId = parsedId + 1;
      } else {
        nextRegId = rows.length + 1;
      }
    }

    // เตรียมข้อมูลเป็น Array สำหรับเพิ่มหลายแถวพร้อมกัน
    const newRows = employeeIds.map((empId, index) => ({
      registration_id: nextRegId + index,
      course_id: courseId.toString(),
      employee_id: empId,
      attendance_status: 'Registered',
      evaluation_result: 'Pending',
      hours_completed: 0
    }));

    // บันทึกลง Google Sheets แบบหลายแถวรวดเดียว
    await sheet.addRows(newRows);

    return res.status(200).json({ success: true, message: `ลงทะเบียนสำเร็จ ${employeeIds.length} คน` });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}