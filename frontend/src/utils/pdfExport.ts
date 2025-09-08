// PDF Export utility for reports
// Note: This is a simplified implementation. For production, consider using libraries like jsPDF or Puppeteer

export interface ReportData {
  id: string;
  title: string;
  symbol: string;
  summary: string;
  investmentThesis: string;
  riskAssessment: string;
  targetPrice: number;
  currentPrice: number;
  recommendation: 'BUY' | 'HOLD' | 'SELL';
  confidenceLevel: number;
  createdAt: string;
  financialMetrics?: any;
  technicalAnalysis?: any;
}

export const exportReportToPDF = async (report: ReportData): Promise<void> => {
  try {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Unable to open print window. Please check your popup blocker settings.');
    }

    // Generate HTML content for the report
    const htmlContent = generateReportHTML(report);
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load, then trigger print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    };
    
  } catch (error) {
    console.error('Error exporting PDF:', error);
    throw new Error('Failed to export report to PDF. Please try again.');
  }
};

const generateReportHTML = (report: ReportData): string => {
  const currentDate = new Date().toLocaleDateString('en-AU');
  const reportDate = new Date(report.createdAt).toLocaleDateString('en-AU');
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${report.title} - Mug Punters Investment Research</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #2563eb;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #2563eb;
          margin: 0;
          font-size: 28px;
        }
        .header .subtitle {
          color: #666;
          margin: 5px 0 0 0;
          font-size: 16px;
        }
        .report-meta {
          background: #f8fafc;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 30px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }
        .meta-item {
          display: flex;
          justify-content: space-between;
        }
        .meta-label {
          font-weight: 600;
          color: #374151;
        }
        .meta-value {
          color: #6b7280;
        }
        .recommendation {
          background: ${getRecommendationColor(report.recommendation)};
          color: white;
          padding: 10px 15px;
          border-radius: 6px;
          font-weight: 600;
          text-align: center;
          margin: 20px 0;
        }
        .section {
          margin-bottom: 30px;
        }
        .section h2 {
          color: #1f2937;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 10px;
          margin-bottom: 15px;
        }
        .section p {
          margin-bottom: 15px;
          text-align: justify;
        }
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-top: 15px;
        }
        .metric-item {
          background: #f9fafb;
          padding: 10px;
          border-radius: 6px;
          text-align: center;
        }
        .metric-label {
          font-size: 12px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .metric-value {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin-top: 5px;
        }
        .disclaimer {
          background: #fef3c7;
          border: 1px solid #f59e0b;
          padding: 15px;
          border-radius: 6px;
          margin-top: 40px;
          font-size: 12px;
          color: #92400e;
        }
        .disclaimer strong {
          color: #b45309;
        }
        @media print {
          body { margin: 0; padding: 15px; }
          .header { page-break-after: avoid; }
          .section { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Mug Punters Investment Research</h1>
        <p class="subtitle">Professional Investment Analysis Platform</p>
      </div>
      
      <h1 style="color: #1f2937; margin-bottom: 10px;">${report.title}</h1>
      <p style="color: #6b7280; margin-bottom: 30px;">Analysis for ${report.symbol} • Generated on ${reportDate}</p>
      
      <div class="report-meta">
        <div class="meta-item">
          <span class="meta-label">Stock Symbol:</span>
          <span class="meta-value">${report.symbol}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Current Price:</span>
          <span class="meta-value">$${report.currentPrice.toFixed(2)}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Target Price:</span>
          <span class="meta-value">$${report.targetPrice.toFixed(2)}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Confidence Level:</span>
          <span class="meta-value">${report.confidenceLevel}/10</span>
        </div>
      </div>
      
      <div class="recommendation">
        RECOMMENDATION: ${report.recommendation}
      </div>
      
      <div class="section">
        <h2>Executive Summary</h2>
        <p>${report.summary}</p>
      </div>
      
      <div class="section">
        <h2>Investment Thesis</h2>
        <p>${report.investmentThesis}</p>
      </div>
      
      <div class="section">
        <h2>Risk Assessment</h2>
        <p>${report.riskAssessment}</p>
      </div>
      
      ${report.financialMetrics ? `
        <div class="section">
          <h2>Key Financial Metrics</h2>
          <div class="metrics-grid">
            ${Object.entries(report.financialMetrics).map(([key, value]) => `
              <div class="metric-item">
                <div class="metric-label">${formatMetricLabel(key)}</div>
                <div class="metric-value">${formatMetricValue(value)}</div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
      
      <div class="disclaimer">
        <strong>IMPORTANT DISCLAIMER:</strong> This report is for educational and research purposes only. 
        This is not financial advice. Mug Punters is not a licensed financial services provider. 
        All investments carry risk of loss. Past performance does not guarantee future results. 
        Please seek professional financial advice before making investment decisions. 
        Generated on ${currentDate} by Mug Punters Investment Research Platform.
      </div>
    </body>
    </html>
  `;
};

const getRecommendationColor = (recommendation: string): string => {
  switch (recommendation) {
    case 'BUY':
      return '#059669'; // green
    case 'HOLD':
      return '#d97706'; // amber
    case 'SELL':
      return '#dc2626'; // red
    default:
      return '#6b7280'; // gray
  }
};

const formatMetricLabel = (key: string): string => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .replace(/_/g, ' ');
};

const formatMetricValue = (value: any): string => {
  if (typeof value === 'number') {
    if (value > 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value > 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    } else if (value < 1) {
      return `${(value * 100).toFixed(1)}%`;
    } else {
      return value.toFixed(2);
    }
  }
  return String(value);
};
