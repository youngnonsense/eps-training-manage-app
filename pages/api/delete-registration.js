import { getDoc } from '../../lib/googleSheets';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { courseId, employeeId } = req.body;

  if (!courseId || !employeeId) {
    return res.status(400).json({ error: 'ข้อมูลไม่ครบถ้วน' });
  }

  try {
    const doc = await getDoc();
    const sheet = doc.sheetsByTitle['Registrations'];
    
    if (!sheet) {
      throw new Error('ไม่พบแท็บ Registrations ใน Google Sheets');
    }

    const rows = await sheet.getRows();
    
    // หาแถวที่รหัสหลักสูตรและรหัสพนักงานตรงกัน
    const rowToDelete = rows.find(r => 
      (r.get('course_id') || '').toString() === courseId.toString() && 
      (r.get('employee_id') || '').toString() === employeeId.toString()
    );
    
    if (rowToDelete) {
      await rowToDelete.delete();
      return res.status(200).json({ success: true, message: 'ลบผู้ลงทะเบียนสำเร็จ' });
    } else {
      return res.status(404).json({ error: 'ไม่พบข้อมูลการลงทะเบียนนี้' });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}