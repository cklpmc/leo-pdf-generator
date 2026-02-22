import { generateReportHTML } from '../templates/report-template.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const data = req.body;
    
    if (!data || !data.name) {
      return res.status(400).json({ error: 'Invalid data' });
    }
    
    const html = generateReportHTML(data);
    
    // Call PDF.co API
    const response = await fetch('https://api.pdf.co/v1/pdf/convert/from/html', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.PDFCO_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        html: html,
        name: `report-${data.name}.pdf`,
        margins: '0',
        paperSize: 'A4',
        orientation: 'portrait',
        printBackground: true,
        mediaType: 'print'
      })
    });
    
    const result = await response.json();
    
    if (!result.url) {
      throw new Error('PDF generation failed');
    }
    
    // Fetch the generated PDF
    const pdfResponse = await fetch(result.url);
    const pdfBuffer = await pdfResponse.arrayBuffer();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="report-${data.name}.pdf"`);
    return res.send(Buffer.from(pdfBuffer));
    
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      error: 'PDF generation failed',
      message: error.message 
    });
  }
}