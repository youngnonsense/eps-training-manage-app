import { getDoc } from '../../lib/googleSheets';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { courseId } = req.body;

  if (!courseId) {
    return res.status(400).json({ error: 'กรุณาระบุรหัสหลักสูตรที่ต้องการลบ' });
  }

  try {
    const doc = await getDoc();
    const courseSheet = doc.sheetsByTitle['Courses'];
    
    if (!courseSheet) {
      throw new Error('ไม่พบแท็บ Courses ใน Google Sheets');
    }

    const rows = await courseSheet.getRows();
    
    // แปลงเป็น String ทั้งสองฝั่งเพื่อป้องกันบั๊ก
    const rowToDelete = rows.find(r => (r.get('course_id') || '').toString() === courseId.toString());
    
    if (rowToDelete) {
      await rowToDelete.delete();
      return res.status(200).json({ success: true, message: 'ลบสำเร็จ' });
    } else {
      return res.status(404).json({ error: 'ไม่พบหลักสูตรนี้ในระบบ' });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}