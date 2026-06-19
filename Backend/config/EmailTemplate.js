export const resetPasswordTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Password Reset OTP</title>
<style>
  body {
    background: #ffffff;
    margin: 0;
    padding: 0;
    font-family: "Arial", sans-serif;
    color: #000;
  }

  .container {
    max-width: 600px;
    margin: 0 auto;
    border: 3px solid #000;
    padding: 30px;
  }

  h1 {
    font-size: 32px;
    margin: 0 0 20px 0;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: -1px;
  }

  .otp-box {
    border: 3px dashed #000;
    padding: 20px;
    font-size: 28px;
    font-weight: bold;
    text-align: center;
    margin: 30px 0;
  }

  .warning {
    font-size: 14px;
    padding: 10px;
    border: 2px solid #000;
    background: #ffeb3b;
    font-weight: 600;
  }

  a.button {
    display: inline-block;
    margin-top: 25px;
    padding: 12px 20px;
    border: 3px solid #000;
    color: #000;
    text-decoration: none;
    font-weight: bold;
    font-size: 16px;
    background: #fff;
  }

  .footer {
    margin-top: 40px;
    font-size: 12px;
    opacity: 0.7;
    border-top: 2px solid #000;
    padding-top: 10px;
  }
</style>
</head>

<body>
  <div class="container">
    <h1>Password Reset</h1>

    <p>You requested to reset your password. Use the OTP below:</p>

    <div class="otp-box">
      {{OTP_CODE}}
    </div>

    <p>This OTP is valid for <strong>15 minutes</strong>. Do not share it with anyone.</p>

    <div class="warning">
      If you didn’t request this reset, ignore this email immediately.
    </div>


    <div class="footer">
      This is an automated email. Please do not reply.
    </div>
  </div>
</body>
</html>

`;

export const monthlyReportTemplate = ({ userName, month, year, analysis, stats, reportType }) => {
  const isPersonal = reportType === 'personal';

  const walletIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;margin-right:8px;"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>`;

  const truckIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;margin-right:8px;"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>`;

  const chartIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;margin-right:8px;"><line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/></svg>`;
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Monthly ${isPersonal ? 'Expense' : 'Business'} Report</title>
<style>
  body {
    background: #f0f0f0;
    margin: 0;
    padding: 0;
    font-family: "Arial", sans-serif;
    color: #000;
  }

  .container {
    max-width: 700px;
    margin: 20px auto;
    border: 4px solid #000;
    background: #fff;
    box-shadow: 8px 8px 0px 0px rgba(0,0,0,1);
  }

  .header {
    background: ${isPersonal ? '#ffeb3b' : '#4caf50'};
    border-bottom: 4px solid #000;
    padding: 30px;
    text-align: center;
  }

  .header h1 {
    font-size: 32px;
    margin: 0;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: -1px;
  }

  .header p {
    font-size: 18px;
    margin: 10px 0 0 0;
    font-weight: 700;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 0;
    border-bottom: 4px solid #000;
  }

  .stat-box {
    padding: 25px;
    border: 2px solid #000;
    text-align: center;
    background: #fff;
  }

  .stat-label {
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    margin-bottom: 8px;
    opacity: 0.7;
  }

  .stat-value {
    font-size: 28px;
    font-weight: 900;
    color: #000;
  }

  .content {
    padding: 30px;
  }

  .analysis-section {
    background: #f9f9f9;
    border: 3px solid #000;
    padding: 20px;
    margin: 20px 0;
    line-height: 1.8;
  }

  .analysis-section h2 {
    font-size: 18px;
    font-weight: 900;
    text-transform: uppercase;
    margin: 20px 0 10px 0;
    border-bottom: 2px solid #000;
    padding-bottom: 5px;
  }

  .analysis-section h2:first-child {
    margin-top: 0;
  }

  .analysis-section p {
    margin: 10px 0;
    font-size: 14px;
  }

  .analysis-section ul {
    margin: 10px 0;
    padding-left: 25px;
  }

  .analysis-section li {
    margin: 8px 0;
    font-size: 14px;
  }

  .cta-box {
    background: ${isPersonal ? '#ffeb3b' : '#4caf50'};
    border: 3px solid #000;
    padding: 20px;
    text-align: center;
    margin: 20px 0;
  }

  .cta-box p {
    margin: 0 0 15px 0;
    font-weight: 700;
    font-size: 16px;
  }

  .button {
    display: inline-block;
    padding: 12px 30px;
    border: 3px solid #000;
    background: #000;
    color: #fff;
    text-decoration: none;
    font-weight: 900;
    font-size: 14px;
    text-transform: uppercase;
    box-shadow: 4px 4px 0px 0px rgba(0,0,0,1);
  }

  .footer {
    border-top: 3px solid #000;
    padding: 20px 30px;
    font-size: 12px;
    background: #f0f0f0;
    text-align: center;
  }

  .footer p {
    margin: 5px 0;
  }
</style>
</head>

<body>
  <div class="container">
    <div class="header">
      <h1>${isPersonal ? walletIcon : truckIcon} ${month} ${year} Report</h1>
      <p>Hello ${userName}!</p>
    </div>

    <div class="stats-grid">
      ${isPersonal ? `
        <div class="stat-box">
          <div class="stat-label">Total Spent</div>
          <div class="stat-value">₹${stats.total.toLocaleString()}</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Transactions</div>
          <div class="stat-value">${stats.count}</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Avg/Transaction</div>
          <div class="stat-value">₹${Math.round(stats.total / stats.count).toLocaleString()}</div>
        </div>
      ` : `
        <div class="stat-box">
          <div class="stat-label">Total Income</div>
          <div class="stat-value">₹${stats.totalIncome.toLocaleString()}</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Total Expenses</div>
          <div class="stat-value">₹${stats.totalExpenses.toLocaleString()}</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Net Profit</div>
          <div class="stat-value">₹${stats.totalProfit.toLocaleString()}</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Profit Margin</div>
          <div class="stat-value">${stats.profitMargin}%</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Total Trips</div>
          <div class="stat-value">${stats.tripCount}</div>
        </div>
      `}
    </div>

    <div class="content">
      <h2 style="font-size: 22px; font-weight: 900; text-transform: uppercase; margin-bottom: 15px;">
        ${chartIcon} AI-Powered Analysis
      </h2>

      <div class="analysis-section">
        ${analysis.split('\n').map(line => {
          if (line.startsWith('#')) {
            return `<h2>${line.replace(/^#+\s*/, '')}</h2>`;
          } else if (line.startsWith('-') || line.startsWith('*')) {
            return `<li>${line.replace(/^[-*]\s*/, '')}</li>`;
          } else if (line.trim()) {
            return `<p>${line}</p>`;
          }
          return '';
        }).join('')}
      </div>

      <div class="cta-box">
        <p>Want to see more details?</p>
        <a href="${process.env.FRONTEND}" class="button">
          View Dashboard
        </a>
      </div>
    </div>

    <div class="footer">
      <p><strong>ExpenseFlow</strong> - Your AI-Powered Financial Assistant</p>
      <p>This is an automated monthly report. Keep tracking your expenses!</p>
      <p style="margin-top: 15px; opacity: 0.6;">
        © ${year} ExpenseFlow. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `;
};


export const emailVerificationTemplate = (otp) => `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Verify Your Email</title>
<style>
  body { background: #ffffff; margin: 0; padding: 0; font-family: "Arial", sans-serif; color: #000; }
  .container { max-width: 600px; margin: 0 auto; border: 3px solid #000; padding: 30px; }
  h1 { font-size: 32px; margin: 0 0 20px 0; font-weight: 700; text-transform: uppercase; letter-spacing: -1px; }
  .otp-box { border: 3px dashed #000; padding: 20px; font-size: 28px; font-weight: bold; text-align: center; margin: 30px 0; }
  .warning { font-size: 14px; padding: 10px; border: 2px solid #000; background: #ffeb3b; font-weight: 600; }
  .footer { margin-top: 40px; font-size: 12px; opacity: 0.7; border-top: 2px solid #000; padding-top: 10px; }
</style>
</head>
<body>
  <div class="container">
    <h1>Verify Your Email</h1>
    <p>Welcome to ExpenseFlow! Use the OTP below to verify your email:</p>
    <div class="otp-box">${otp}</div>
    <p>This OTP is valid for <strong>15 minutes</strong>.</p>
    <div class="warning">If you didn't create an account, ignore this email.</div>
    <div class="footer">This is an automated email. Please do not reply.</div>
  </div>
</body>
</html>
`;