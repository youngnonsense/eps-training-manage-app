import { getDoc } from '../../lib/googleSheets';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { courseId, courseCode, courseName, category, startDate, endDate, durationHours, instructor, location } = req.body;

  try {
    const doc = await getDoc();
    const sheet = doc.sheetsByTitle['Courses'];
    const rows = await sheet.getRows();

    // หาบรรทัดที่มี course_id ตรงกับที่เราต้องการแก้
    const rowToUpdate = rows.find(r => r.get('course_id') === courseId.toString());
    
    if (!rowToUpdate) {
      return res.status(404).json({ error: 'ไม่พบหลักสูตรนี้ในระบบ' });
    }

    // เขียนข้อมูลใหม่ทับลงไป
    rowToUpdate.set('course_code', courseCode || '');
    rowToUpdate.set('course_name', courseName);
    rowToUpdate.set('category', category || 'หลักสูตรทั่วไป');
    rowToUpdate.set('start_date', startDate || '');
    rowToUpdate.set('end_date', endDate || '');
    rowToUpdate.set('duration_hours', durationHours);
    rowToUpdate.set('instructor', instructor || '');
    rowToUpdate.set('location', location || '');

    await rowToUpdate.save(); // สั่งบันทึกลง Sheets

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}