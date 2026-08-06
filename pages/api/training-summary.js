import { getEmployeeTrainingSummary } from '../../services/trainingService';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { employeeId } = req.query;

  if (!employeeId) {
    return res.status(400).json({ error: 'โปรดระบุ employeeId ใน URL query string' });
  }

  try {
    const data = await getEmployeeTrainingSummary(employeeId);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}