import { google } from 'googleapis';

export default async function handler(req, res) {
  // รับเฉพาะ Method POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // รับค่ามาจาก Frontend ซึ่งตอนนี้ startDate และ endDate เป็น String "DD/MM/YYYY" ที่สมบูรณ์แล้ว
    const { 
      courseCode, courseName, category, 
      startDate, endDate, durationHours, 
      instructor, location 
    } = req.body;

    if (!courseName) {
      return res.status(400).json({ error: 'กรุณากรอกชื่อหลักสูตร' });
    }

    // ตั้งค่าการเชื่อมต่อ
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
    
    // ⚠️ ตรงนี้แก้ชื่อชีตให้ตรงกับที่คุณใช้ใน Google Sheets นะครับ (ปกติจะเป็น Courses)
    const SHEET_NAME = 'Courses'; 

    // 1. ดึงข้อมูลทั้งหมดในชีตมาดูก่อน เพื่อหาเลข ID ล่าสุด
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:A`, 
    });

    const rows = response.data.values || [];
    let nextId = 1;
    if (rows.length > 1) {
      // เอาแถวสุดท้าย (ที่ไม่ใช่ Header) มาเช็คเลข ID แล้วบวก 1
      const lastId = parseInt(rows[rows.length - 1][0]);
      if (!isNaN(lastId)) {
        nextId = lastId + 1;
      }
    }

    // 2. บันทึกข้อมูลใหม่ลง Google Sheets
    // 💡 สังเกตว่าเราใช้ startDate และ endDate แบบตรงๆ เลย ไม่ต้องผ่าน new Date() 
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:I`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          nextId,                // คอลัมน์ A: course_id
          courseCode || '',      // คอลัมน์ B: course_code
          courseName || '',      // คอลัมน์ C: course_name
          category || '',        // คอลัมน์ D: category
          startDate || '',       // คอลัมน์ E: start_date (จะเป็น 06/08/2026 สวยๆ เลย)
          endDate || '',         // คอลัมน์ F: end_date
          durationHours || '',   // คอลัมน์ G: duration_hours
          instructor || '',      // คอลัมน์ H: instructor
          location || ''         // คอลัมน์ I: location
        ]],
      },
    });

    return res.status(200).json({ success: true, message: 'เพิ่มหลักสูตรสำเร็จ' });

  } catch (error) {
    console.error('Error adding course:', error);
    return res.status(500).json({ error: error.message });
  }
}