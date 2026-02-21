import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { generateReportHTML } from '../templates/report-template.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const data = req.body;
    const html = generateReportHTML(data);
    
const browser = await puppeteer.launch({
args: [
...chromium.args,
"--hide-scrollbars",
"--disable-web-security",
"--no-sandbox",
"--disable-setuid-sandbox"
],
defaultViewport: chromium.defaultViewport,
executablePath: await chromium.executablePath(),
headless: chromium.headless,
ignoreHTTPSErrors: true,
});
    
    const page = await browser.newPage();
    
    // Set content and wait for the CDN (Chart.js) to load
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    // Use a standard promise-based delay instead of waitForTimeout
    await new Promise(resolve => setTimeout(resolve, 2000)); 
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
    });
    
    await browser.close();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.send(pdf);
    
  } catch (error) {
    console.error('Build Error:', error);
    res.status(500).json({ error: error.message });
  }
}