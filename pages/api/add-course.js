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

    // 1. หา course_id ล่าสุดที่เป็นตัวเลข (แก้ปัญหา ID ซ้ำตอนแอดมินกดเรียงวันที่)
    const rows = await courseSheet.getRows();
    let nextIdNumber = 1;
    
    if (rows.length > 0) {
      // ดึง ID ทั้งหมดออกมา แล้วหาค่าที่เยอะที่สุด
      const allIds = rows
        .map(row => parseInt(row.get('course_id'), 10))
        .filter(id => !isNaN(id)); 
        
      if (allIds.length > 0) {
        nextIdNumber = Math.max(...allIds) + 1; // หาค่าที่มากสุดแล้ว + 1
      }
    }

    // 2. บันทึกลง Sheet ให้ตรง Column (ไม่ต้องใช้ formatDate แล้วเพราะ Frontend ส่งมาสวยแล้ว)
    await courseSheet.addRow({
      course_id: nextIdNumber,
      course_code: courseCode || '',
      course_name: courseName,
      category: category || 'หลักสูตรทั่วไป',
      start_date: startDate || '', // ลงวันที่ตรงๆ ได้เลย
      end_date: endDate || '',     // ลงวันที่ตรงๆ ได้เลย
      duration_hours: durationHours,
      instructor: instructor || '',
      location: location || ''
    });

    return res.status(200).json({ success: true, courseId: nextIdNumber });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}