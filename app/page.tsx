const coursesOnThisDay = data.courses.filter((c: any) => {
  const sDate = parseDateStr(c.startDate);
  if (!sDate) return false; // ขยับบรรทัดนี้ขึ้นมาเช็คก่อน
  
  const eDate = parseDateStr(c.endDate) || sDate;
  
  const current = new Date(dayDate); current.setHours(0,0,0,0);
  // ใช้ as Date เพื่อยืนยันกับ TypeScript ว่ามีค่าแน่นอน
  const start = new Date(sDate as Date); start.setHours(0,0,0,0);
  const end = new Date(eDate as Date); end.setHours(0,0,0,0);
  
  return current >= start && current <= end;
});
