import { google } from 'googleapis';

export default async function handler(req, res) {
  // รับเฉพาะ Method POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { employeeId, action, courseName } = req.body;

    if (!employeeId || !action || !courseName) {
      return res.status(400).json({ error: 'ข้อมูลไม่ครบถ้วน' });
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID; 
    const SHEET_NAME = 'Training_History';

    // กรณีเพิ่มประวัติ
    if (action === 'add') {
      // สร้างวันที่ปัจจุบันในรูปแบบ DD/MM/YYYY (อิงตาม Timezone ไทย)
      const today = new Date();
      const currentDate = new Intl.DateTimeFormat('en-GB', { 
        timeZone: 'Asia/Bangkok',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(today);
      
      // กำหนดสถานะเริ่มต้น
      const status = 'ผ่านการอบรม';

      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        // ขยาย Range เป็น A:D เพื่อรองรับคอลัมน์ วันที่ และ สถานะ
        range: `${SHEET_NAME}!A:D`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          // เรียงตามคอลัมน์: A(รหัส), B(วิชา), C(วันที่), D(สถานะ)
          values: [[employeeId, courseName, currentDate, status]],
        },
      });
      return res.status(200).json({ success: true, message: 'บันทึกประวัติสำเร็จ' });
    } 
    
    // กรณีลบประวัติ
    else if (action === 'remove') {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A:B`, // ดึงแค่ A และ B มาเช็คก็พอ
      });

      const rows = response.data.values || [];
      let rowIndexToDelete = -1;

      for (let i = 0; i < rows.length; i++) {
        if (rows[i][0] === employeeId && rows[i][1] === courseName) {
          rowIndexToDelete = i; 
          break;
        }
      }

      if (rowIndexToDelete === -1) {
        return res.status(404).json({ error: 'ไม่พบประวัติดังกล่าวในระบบ' });
      }

      const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
      const sheet = spreadsheet.data.sheets?.find(s => s.properties?.title === SHEET_NAME);
      const sheetId = sheet?.properties?.sheetId;

      if (sheetId === undefined) {
         return res.status(500).json({ error: 'หาหน้า Sheet ไม่เจอ' });
      }

      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [{
            deleteDimension: {
              range: {
                sheetId: sheetId,
                dimension: 'ROWS',
                startIndex: rowIndexToDelete,
                endIndex: rowIndexToDelete + 1,
              },
            },
          }],
        },
      });

      return res.status(200).json({ success: true, message: 'ลบประวัติสำเร็จ' });
    }

    return res.status(400).json({ error: 'รูปแบบคำสั่งไม่ถูกต้อง' });

  } catch (error) {
    console.error('Error updating history:', error);
    return res.status(500).json({ error: error.message });
  }
}