import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export default async function generatePDF(billName, headers, profile) {
  const currentDate = new Date().toLocaleDateString('en-IN');
  
  // Calculate grand total
  const grandTotal = headers.reduce((total, header) => 
    total + header.items.reduce((headerTotal, item) => headerTotal + item.total, 0), 0
  );

  // Generate table rows for each header and its items
  const headerSections = headers.map(header => {
    const headerTotal = header.items.reduce((total, item) => total + item.total, 0);
    
    const itemRows = header.items.map(item => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${item.name}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.width}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.height}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.unit}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.sqft.toFixed(2)}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">₹${item.rate}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold;">₹${item.total.toFixed(2)}</td>
      </tr>
    `).join('');

    return `
      <tr style="background-color: #34495e;">
        <td colspan="7" style="padding: 12px; color: white; font-weight: bold; font-size: 16px;">
          📍 ${header.name} - Total: ₹${headerTotal.toFixed(2)}
        </td>
      </tr>
      ${itemRows}
    `;
  }).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${billName} - Invoice</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          margin: 20px;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 3px solid #3498db;
          padding-bottom: 20px;
        }
        .company-name {
          font-size: 24px;
          font-weight: bold;
          color: #2c3e50;
          margin-bottom: 5px;
        }
        .profile-details {
          font-size: 14px;
          color: #7f8c8d;
          margin-bottom: 10px;
        }
        .bill-title {
          font-size: 20px;
          color: #3498db;
          margin-bottom: 10px;
        }
        .date {
          font-size: 14px;
          color: #7f8c8d;
        }
        .invoice-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .table-header {
          background-color: #2c3e50;
          color: white;
        }
        .table-header th {
          padding: 12px 8px;
          text-align: center;
          font-weight: bold;
          border: 1px solid #34495e;
        }
        .grand-total {
          background-color: #27ae60;
          color: white;
          font-weight: bold;
          font-size: 18px;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 12px;
          color: #7f8c8d;
          border-top: 1px solid #ecf0f1;
          padding-top: 20px;
        }
        .signature-section {
          margin-top: 60px;
          display: flex;
          justify-content: space-between;
        }
        .signature-box {
          width: 200px;
          text-align: center;
        }
        .signature-line {
          border-top: 1px solid #333;
          margin-top: 50px;
          padding-top: 5px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">🔨 ${profile?.company || 'Carpenter'}</div>
        <div class="profile-details">
          <div>Phone: ${profile?.phone || ''}</div>
          <div>Address: ${profile?.address || ''}</div>
        </div>
        <div class="bill-title">${billName}</div>
        <div class="date">Date: ${currentDate}</div>
      </div>

      <table class="invoice-table">
        <thead class="table-header">
          <tr>
            <th>Work Description</th>
            <th>Width</th>
            <th>Height</th>
            <th>Unit</th>
            <th>Area</th>
            <th>Rate</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${headerSections}
          <tr class="grand-total">
            <td colspan="6" style="padding: 15px; text-align: right; border: 1px solid #27ae60;">
              GRAND TOTAL:
            </td>
            <td style="padding: 15px; text-align: right; border: 1px solid #27ae60;">
              ₹${grandTotal.toFixed(2)}
            </td>
          </tr>
        </tbody>
      </table>

 

      <div class="footer">
        <p>Thank you for choosing our carpentry services!</p>
        <p>Generated on ${currentDate} | Carpenter Invoice App</p>
      </div>
    </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({ 
      html,
      base64: false
    });
    
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Share Invoice PDF',
      UTI: 'com.adobe.pdf'
    });
    
    return uri;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
}



