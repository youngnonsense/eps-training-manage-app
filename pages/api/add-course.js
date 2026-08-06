import { getDoc } from '../../lib/googleSheets';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { courseCode, courseName, category, startDate, endDate, durationHours, instructor, location } = req.body;

  if (!courseName || !durationHours) {
    return res.status(400).json({ error: 'กรุณากรอกชื่อหลักสูตรและชั่วโมงอบรม' });
  }

  try {
    const doc = await getDoc();
    const courseSheet = doc.sheetsByTitle['Courses'];

    if (!courseSheet) {
      throw new Error('ไม่พบแท็บ Courses ใน Google Sheets');
    }

    // หา course_id ล่าสุดที่เป็นตัวเลข
    const rows = await courseSheet.getRows();
    let nextIdNumber = 1;
    
    if (rows.length > 0) {
      const lastId = rows[rows.length - 1].get('course_id');
      const parsedId = parseInt(lastId, 10);
      if (!isNaN(parsedId)) {
        nextIdNumber = parsedId + 1; // รันตัวเลขต่อจากแถวสุดท้าย
      } else {
        nextIdNumber = rows.length + 1;
      }
    }

    // ฟังก์ชันแปลงวันที่จาก "2026-07-23" (HTML Date) เป็น "23/7/2026" (Google Sheets format)
    const formatDate = (dateString) => {
      if (!dateString) return '';
      const [year, month, day] = dateString.split('-');
      return `${parseInt(day, 10)}/${parseInt(month, 10)}/${year}`;
    };

    // บันทึกลง Sheet ให้ตรง Column เป๊ะๆ
    await courseSheet.addRow({
      course_id: nextIdNumber,
      course_code: courseCode || '',
      course_name: courseName,
      category: category || 'หลักสูตรทั่วไป',
      start_date: formatDate(startDate),
      end_date: formatDate(endDate),
      duration_hours: durationHours,
      instructor: instructor || '',
      location: location || ''
    });

    return res.status(200).json({ success: true, courseId: nextIdNumber });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}