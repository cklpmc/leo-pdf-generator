import { generateReportHTML } from '../templates/report-template.js';

export default async function handler(req, res) {
if (req.method !== 'POST') {
return res.status(405).json({ error: 'Method not allowed' });
}

try {
const data = req.body;
const html = generateReportHTML(data);
return res.status(200).send(html);

} catch (error) {
return res.status(500).json({ error: error.message });
}
}