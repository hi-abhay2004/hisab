import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { profileService } from './profileService';

export const pdfService = {
  async generateInvoicePDF(bill) {
    try {
      const profile = await profileService.getProfile();
      const htmlContent = this.generateHTMLContent(bill, profile);

      const { uri } = await Print.printToFileAsync({ html: htmlContent, base64: false });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `${bill.billName}_Invoice.pdf`,
        });
      } else {
        alert('PDF generated but sharing is not available on this device');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  },

generateHTMLContent(bill, profile) {
  const totalAmount = bill.headers.reduce((total, header) => {
    return total + header.workItems.reduce((sum, item) => sum + item.totalRate, 0);
  }, 0);
  
  const advance = bill.advanceAmount || 0;
  const balance = totalAmount - advance;

  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>Invoice</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          padding: 20px;
          color: #333;
        }

        .header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
        }

        .company-info, .client-info {
          font-size: 14px;
          line-height: 1.6;
        }

        .company-name {
          font-size: 20px;
          font-weight: bold;
          color: #2c3e50;
        }

        .invoice-title {
          text-align: center;
          font-size: 22px;
          font-weight: bold;
          margin-bottom: 20px;
          color: #3498db;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }

        th, td {
          border: 1px solid #ddd;
          padding: 10px;
          font-size: 14px;
        }

        th {
          background-color: #2c3e50;
          color: white;
          text-align: left;
        }

        .room-header {
          background-color: #ecf0f1;
          font-weight: bold;
          color: #e74c3c;
        }

        .grand-footer {
          background-color: #2ecc71;
          color: white;
          font-weight: bold;
          font-size: 16px;
        }

        .totals-summary {
          margin-top: 30px;
          border-top: 2px solid #333;
          padding-top: 20px;
          font-size: 16px;
          width: 100%;
          max-width: 500px;
          margin-left: auto;
        }

        .totals-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #ddd;
        }

        .totals-row.final {
          background-color: #2ecc71;
          color: white;
          font-weight: bold;
          border-radius: 6px;
          padding: 12px;
          margin-top: 10px;
          border: none;
        }

        .label {
          font-weight: bold;
        }

        .value {
          font-weight: bold;
          text-align: right;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-info">
          <div class="company-name">${profile?.companyName || 'Company Name'}</div>
          <div>📞 ${profile?.phoneNumber || 'N/A'}</div>
          <div>📍 ${profile?.address || 'Address not available'}</div>
        </div>
        <div class="client-info">
          <div><strong>Client:</strong> ${bill.billName || 'N/A'}</div>
          <div><strong>Date:</strong> ${new Date().toLocaleDateString()}</div>
        </div>
      </div>

      

      <table>
        <thead>
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
          ${bill.headers.map(header => `
            <tr class="room-header">
              <td colspan="7">📍 ${header.name} - Total: ₹${header.workItems.reduce((sum, i) => sum + i.totalRate, 0).toFixed(2)}</td>
            </tr>
            ${header.workItems.map(item => `
              <tr>
                <td>${item.workName}</td>
                <td>${item.width}</td>
                <td>${item.height}</td>
                <td>${item.widthUnit}</td>
                <td>${item.totalSqft.toFixed(2)}</td>
                <td>₹${item.rate}</td>
                <td>₹${item.totalRate.toFixed(2)}</td>
              </tr>
            `).join('')}
          `).join('')}
          <tr class="grand-footer">
            <td colspan="6" style="text-align: right;">GRAND TOTAL:</td>
            <td>₹${totalAmount.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      <div class="totals-summary">
        <div class="totals-row">
          <span class="label">💰 Grand Total:</span>
          <span class="value">₹${totalAmount.toFixed(2)}</span>
        </div>
        <div class="totals-row">
          <span class="label">➖ Advance Paid:</span>
          <span class="value">₹${advance.toFixed(2)}</span>
        </div>
        <div class="totals-row final">
          <span class="label">🧾 Balance Due:</span>
          <span class="value">₹${balance.toFixed(2)}</span>
        </div>
      </div>
    </body>
  </html>
  `;
}

};
