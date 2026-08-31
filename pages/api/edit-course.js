import { getDoc } from '../../lib/googleSheets';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { courseId, courseCode, courseName, category, startDate, endDate, durationHours, hasCertificate, instructor, location } = req.body;

  try {
    const doc = await getDoc();
    const courseSheet = doc.sheetsByTitle['Courses'];
    const regSheet = doc.sheetsByTitle['Registrations'];
    
    if (!courseSheet) {
      throw new Error('ไม่พบแท็บ Courses ใน Google Sheets');
    }

    // 1. อัปเดตข้อมูลหลักสูตรในแท็บ Courses
    const courseRows = await courseSheet.getRows();
    const rowToUpdate = courseRows.find(r => r.get('course_id') === courseId.toString());
    
    if (!rowToUpdate) {
      return res.status(404).json({ error: 'ไม่พบหลักสูตรนี้ในระบบ' });
    }

    rowToUpdate.set('course_code', courseCode || '');
    rowToUpdate.set('course_name', courseName);
    rowToUpdate.set('category', category || 'หลักสูตรทั่วไป');
    rowToUpdate.set('start_date', startDate || '');
    rowToUpdate.set('end_date', endDate || '');
    rowToUpdate.set('duration_hours', durationHours || '');
    rowToUpdate.set('has_certificate', hasCertificate ? '1' : '0');
    rowToUpdate.set('instructor', instructor || '');
    rowToUpdate.set('location', location || '');

    await rowToUpdate.save();

    // 2. ตรวจสอบว่าวันที่เริ่มอบรมใหม่เป็นอดีตหรืออนาคต
    let isPast = false;
    if (startDate) {
      const parts = startDate.split('/');
      if (parts.length === 3) {
        const cDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        const today = new Date(); 
        today.setHours(0, 0, 0, 0);
        if (cDate < today) {
          isPast = true;
        }
      }
    }

    // 3. กวาดอัปเดตข้อมูลพนักงานทุกคนที่ลงทะเบียนในวิชานี้
    if (regSheet) {
      const regRows = await regSheet.getRows();
      const attendeesToUpdate = regRows.filter(r => r.get('course_id') === courseId.toString());

      const finalStatus = isPast ? 'Attended' : 'Registered';
      const finalEval = isPast ? 'Pass' : 'Pending';
      const finalHours = isPast ? (parseFloat(durationHours) || 0) : 0;

      for (const regRow of attendeesToUpdate) {
        regRow.set('attendance_status', finalStatus);
        regRow.set('evaluation_result', finalEval);
        regRow.set('hours_completed', finalHours);
        await regRow.save();
      }
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}