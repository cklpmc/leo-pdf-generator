import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
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
    
    // Configure chromium for serverless
    const browser = await puppeteer.launch({
      args: [
        ...chromium.args,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless
    });
    
    const page = await browser.newPage();
    
    await page.setContent(html, { 
      waitUntil: ['networkidle0', 'load']
    });
    
    // Wait for Chart.js to render
    await page.waitForTimeout(2000);
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0mm',
        right: '0mm',
        bottom: '0mm',
        left: '0mm'
      }
    });
    
    await browser.close();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="report-${data.name}.pdf"`);
    return res.send(pdf);
    
  } catch (error) {
    console.error('PDF Error:', error);
    return res.status(500).json({ 
      error: 'PDF generation failed',
      message: error.message
    });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    }
  }
};