export function generateReportHTML(data) {
  const name = data.name || 'User';
  const reportDate = data.report_date || new Date().toLocaleDateString();
  const period = data.period || 'N/A';
  
  const accEma = data.prim_metrics?.acc_ema || '0%';
  const complEma = data.prim_metrics?.compl_ema || '0';
  const userLevel = data.prim_metrics?.user_level || 'N/A';
  const leoPrimComm = data.prim_metrics?.leo_prim_comm || '';
  
  const accStack = data.prim_metrics?.acc_ema_stack || [0];
  const complStack = data.prim_metrics?.compl_ema_stack || [0];
  
  const topErrorTags = data.err_anal?.top_error_tag || [];
  const topErrorCounts = data.err_anal?.top_error_count || [];
  const leoErrDiag = data.err_anal?.leo_err_diag || '';
  
  const winOfWeek = data.win_of_the_week || '';
  const leoAdvice = data.leo_advice || '';
  
  // Generate simple sparkline SVG (no Chart.js!)
  const generateSparkline = (values, color, maxValue = 1) => {
    const width = 600;
    const height = 100;
    const points = values.map((val, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - (val / maxValue) * height;
      return `${x},${y}`;
    }).join(' ');
    
    return `
      <svg width="${width}" height="${height}" style="margin: 20px 0;">
        <polyline
          points="${points}"
          fill="none"
          stroke="${color}"
          stroke-width="3"
        />
      </svg>
    `;
  };
  
  // Generate error bars
  const errorBarsHTML = topErrorTags.slice(0, 5).map((tag, i) => {
    const count = topErrorCounts[i] || 0;
    const maxCount = topErrorCounts[0] || 1;
    const width = (count / maxCount) * 100;
    const tagFormatted = tag.replace(/_/g, ' ');
    
    return `
      <div style="margin: 15px 0;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 14px;">
          <span>${tagFormatted}</span>
          <span style="font-weight: bold; color: #ef4444;">${count} errors</span>
        </div>
        <div style="height: 24px; background: #f3f4f6; border-radius: 12px; overflow: hidden;">
          <div style="width: ${width}%; height: 100%; background: linear-gradient(90deg, #ef4444 0%, #dc2626 100%); border-radius: 12px;"></div>
        </div>
      </div>
    `;
  }).join('');
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
      color: #1f2937;
    }
    .page { 
      width: 210mm;
      min-height: 297mm;
      padding: 20mm;
      background: white;
      page-break-after: always;
    }
    .page:last-child { page-break-after: auto; }
    .header { 
      text-align: center; 
      border-bottom: 4px solid #2563eb; 
      padding-bottom: 20px; 
      margin-bottom: 30px; 
    }
    .header h1 { font-size: 32px; color: #1e40af; margin-bottom: 8px; }
    .header .subtitle { font-size: 14px; color: #6b7280; }
    .metrics { 
      display: flex;
      justify-content: space-between;
      gap: 15px;
      margin: 30px 0;
    }
    .metric-card { 
      flex: 1;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
      color: white; 
      padding: 20px; 
      border-radius: 12px; 
      text-align: center; 
    }
    .metric-value { font-size: 48px; font-weight: bold; margin: 10px 0; }
    .metric-label { font-size: 14px; opacity: 0.9; text-transform: uppercase; }
    .comment { 
      background: #eff6ff; 
      border-left: 4px solid #3b82f6; 
      padding: 20px; 
      border-radius: 8px; 
      margin: 20px 0; 
    }
    .section-title { 
      font-size: 24px; 
      color: #374151; 
      margin: 30px 0 20px; 
      padding-bottom: 10px; 
      border-bottom: 2px solid #e5e7eb; 
    }
    .win { 
      background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); 
      color: #78350f; 
      padding: 30px; 
      border-radius: 16px; 
      text-align: center; 
      margin: 30px 0; 
      font-size: 18px; 
    }
    .advice { 
      background: #eff6ff; 
      border: 2px solid #3b82f6; 
      padding: 25px; 
      border-radius: 12px; 
      margin: 30px 0; 
    }
    .footer { 
      text-align: center; 
      color: #9ca3af; 
      font-size: 12px; 
      margin-top: 40px; 
      padding-top: 20px; 
      border-top: 1px solid #e5e7eb; 
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <h1>Progress Report</h1>
      <div class="subtitle">${name} | ${reportDate} | ${period}</div>
    </div>
    
    <div class="metrics">
      <div class="metric-card">
        <div class="metric-label">Accuracy</div>
        <div class="metric-value">${accEma}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Complexity</div>
        <div class="metric-value">${complEma}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Level</div>
        <div class="metric-value" style="font-size: 32px;">${userLevel}</div>
      </div>
    </div>
    
    <div class="comment">${leoPrimComm}</div>
    
    <div class="section-title">Accuracy Progress</div>
    ${generateSparkline(accStack, '#ef4444', 1)}
    
    <div class="section-title">Complexity Progress</div>
    ${generateSparkline(complStack, '#3b82f6', 6)}
  </div>
  
  <div class="page">
    <div class="section-title">Error Analysis</div>
    ${errorBarsHTML}
    
    <div class="comment">${leoErrDiag}</div>
    
    <div class="win">${winOfWeek}</div>
    
    <div class="advice">${leoAdvice}</div>
    
    <div class="footer">Generated by Leo | ${reportDate}</div>
  </div>
</body>
</html>`;
}